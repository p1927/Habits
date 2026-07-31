"""Drive a single tick of a Hermes Loop worker.

Slice B adds real executor dispatch. The executor is one of:
  * ``none``      — write bundle only (Slice A behavior; preserved for parity).
  * ``<command>`` — a shell command template that gets the bundle path
                    substituted into ``{bundle}`` and the worker id into
                    ``{worker_id}``. Default executor is
                    ``bash tools/hermes-loop/scripts/run_subagent.sh``
                    which SIMULATES a subagent (prints "would invoke:" and
                    exits 0) so the pipeline works end-to-end without a
                    real LLM session.

Slice C will swap the simulator for the real Hermes launcher.
"""

from __future__ import annotations

import shlex
import subprocess
import sys
import time
from pathlib import Path

from . import scratchpad
from .config import WorkerConfig
from .prompt import build_prompt, write_bundle


def _find_repo_root(start: Path) -> Path:
    """Walk up looking for a directory containing both 'docs/' and 'pwa/'.

    Falls back to the original start directory if not found, so the tool
    remains usable from anywhere.
    """
    cur = start.resolve()
    for _ in range(6):
        if (cur / "docs/window-instances").is_dir() and (cur / "pwa").is_dir():
            return cur
        parent = cur.parent
        if parent == cur:
            break
        cur = parent
    return start.resolve()


def _resolve_executor(executor: str, *, worker_id: str, bundle_path: Path) -> tuple[list[str], str]:
    """Return (argv, display_string) for the executor command.

    Tokens are split with shlex. ``{bundle}`` is replaced with the bundle
    path; ``{worker_id}`` is replaced with the worker id; ``{bundle_dir}``
    is the bundle's parent directory.

    If executor contains no ``{bundle}`` marker, we append ``--bundle
    <path>`` automatically for shell-style executors, otherwise we leave
    the call verbatim.
    """
    rendered = executor.format(
        worker_id=worker_id,
        bundle=str(bundle_path),
        bundle_dir=str(bundle_path.parent),
    )
    argv = shlex.split(rendered)
    return argv, rendered


def run_one(
    cfg: WorkerConfig,
    *,
    dry_run: bool,
    repo_root: Path | None = None,
    timeout_seconds: int = 600,
) -> int:
    repo_root = repo_root or _find_repo_root(Path.cwd())

    prompt = build_prompt(cfg, repo_root)
    bundle_path = write_bundle(prompt, repo_root, cfg.id)

    scratch_path = repo_root / cfg.scratchpad
    heartbeat_path = repo_root / cfg.heartbeat

    # Slice A parity: --dry-run OR executor="none" both short-circuit.
    if dry_run:
        scratchpad.append(
            scratch_path,
            kind="dry-run",
            payload=(
                f"executor={cfg.executor!r} bundle={bundle_path.relative_to(repo_root)} "
                f"len={len(prompt)} bytes"
            ),
        )
        scratchpad.touch_heartbeat(heartbeat_path, note=f"dry-run bundle written at {bundle_path.name}")
        print(f"[hermes-loop] worker={cfg.id} executor={cfg.executor} dry_run=True")
        print(f"[hermes-loop] bundle written: {bundle_path.relative_to(repo_root)}")
        return 0

    if cfg.executor == "none":
        scratchpad.append(
            scratch_path,
            kind="noop",
            payload=(
                f"executor='none' bundle={bundle_path.relative_to(repo_root)} "
                f"len={len(prompt)} bytes"
            ),
        )
        scratchpad.touch_heartbeat(heartbeat_path, note=f"noop bundle written at {bundle_path.name}")
        print(f"[hermes-loop] worker={cfg.id} executor=none (no LLM invoked)")
        print(f"[hermes-loop] bundle written: {bundle_path.relative_to(repo_root)}")
        return 0

    # Real executor dispatch. Slice B uses a subagent simulator; Slice C
    # will replace it with the actual Hermes launcher via config edit.
    argv, rendered = _resolve_executor(
        cfg.executor, worker_id=cfg.id, bundle_path=bundle_path
    )

    scratchpad.append(
        scratch_path,
        kind="tick-start",
        payload=f"executor={rendered!r} bundle={bundle_path.relative_to(repo_root)}",
    )
    print(f"[hermes-loop] tick start worker={cfg.id} bundle={bundle_path.relative_to(repo_root)}")

    t0 = time.monotonic()
    try:
        proc = subprocess.run(
            argv,
            cwd=str(repo_root),
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        scratchpad.append(
            scratch_path,
            kind="timeout",
            payload=f"timed out after {timeout_seconds}s executor={rendered!r} stderr_tail={(exc.stderr or '')[-200:]}",
        )
        scratchpad.touch_heartbeat(heartbeat_path, note=f"timeout after {timeout_seconds}s")
        print(f"[hermes-loop] tick TIMEOUT for {cfg.id} after {timeout_seconds}s", file=sys.stderr)
        return 3

    elapsed = time.monotonic() - t0
    stdout_tail = (proc.stdout or "")[-300:]
    stderr_tail = (proc.stderr or "")[-300:]
    scratchpad.append(
        scratch_path,
        kind="tick-end",
        payload=(
            f"executor={rendered!r} returncode={proc.returncode} "
            f"elapsed={elapsed:.2f}s stdout_tail={stdout_tail!r} stderr_tail={stderr_tail!r}"
        ),
    )
    scratchpad.touch_heartbeat(
        heartbeat_path, note=f"tick returncode={proc.returncode} elapsed={elapsed:.1f}s"
    )

    if proc.returncode == 0:
        print(f"[hermes-loop] tick OK worker={cfg.id} returncode=0 elapsed={elapsed:.1f}s")
        return 0
    scratchpad.append(
        scratch_path,
        kind="error",
        payload=f"executor={rendered!r} returncode={proc.returncode}",
    )
    print(
        f"[hermes-loop] tick FAIL worker={cfg.id} returncode={proc.returncode} "
        f"stderr_tail={stderr_tail!r}",
        file=sys.stderr,
    )
    return 1
