"""Drive a single tick of a Hermes Loop worker.

Slice B-fix replaces the prior launcher shim with the real ``hermes chat``
executor (see :mod:`hermes_loop.executor`). The executor config field
on a worker now controls which path is used:

  * ``"hermes"`` — invoke a fresh ``hermes chat`` session against the bundle.
  * ``"none"``   — write bundle only (parity with Slice A; useful for review).

For both, we:
  1. Build the bundle via :mod:`hermes_loop.prompt`.
  2. Append tick-start / tick-end to the scratchpad.
  3. Touch the heartbeat regardless of outcome.
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

from . import scratchpad
from .config import WorkerConfig
from .prompt import build_prompt, write_bundle


def _find_repo_root(start: Path) -> Path:
    cur = start.resolve()
    for _ in range(6):
        if (cur / "docs/window-instances").is_dir() and (cur / "pwa").is_dir():
            return cur
        parent = cur.parent
        if parent == cur:
            break
        cur = parent
    return start.resolve()


def run_one(
    cfg: WorkerConfig,
    *,
    dry_run: bool,
    repo_root: Path | None = None,
    timeout_seconds: int = 900,
) -> int:
    repo_root = repo_root or _find_repo_root(Path.cwd())

    prompt = build_prompt(cfg, repo_root)
    bundle_path = write_bundle(prompt, repo_root, cfg.id)

    scratch_path = repo_root / cfg.scratchpad
    heartbeat_path = repo_root / cfg.heartbeat

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

    if cfg.executor == "hermes":
        from .executor import run as hermes_run
        try:
            scratchpad.append(
                scratch_path,
                kind="tick-start",
                payload=f"executor=hermes bundle={bundle_path.relative_to(repo_root)}",
            )
            print(f"[hermes-loop] tick start worker={cfg.id} bundle={bundle_path.relative_to(repo_root)}")

            t0 = time.monotonic()
            proc = hermes_run(
                cfg,
                bundle_path=bundle_path,
                repo_root=repo_root,
                timeout_seconds=timeout_seconds,
            )
            elapsed = time.monotonic() - t0

            stdout_tail = (proc.stdout or "")[-300:]
            stderr_tail = (proc.stderr or "")[-300:]
            scratchpad.append(
                scratch_path,
                kind="tick-end",
                payload=(
                    f"executor=hermes returncode={proc.returncode} "
                    f"elapsed={elapsed:.2f}s stdout_tail={stdout_tail!r} "
                    f"stderr_tail={stderr_tail!r}"
                ),
            )
            scratchpad.touch_heartbeat(
                heartbeat_path, note=f"tick returncode={proc.returncode} elapsed={elapsed:.1f}s"
            )

            if proc.returncode == 0:
                print(
                    f"[hermes-loop] tick OK worker={cfg.id} "
                    f"returncode=0 elapsed={elapsed:.1f}s"
                )
                return 0
            print(
                f"[hermes-loop] tick FAIL worker={cfg.id} "
                f"returncode={proc.returncode} stderr_tail={stderr_tail!r}",
                file=sys.stderr,
            )
            return 1
        except FileNotFoundError as exc:
            scratchpad.append(
                scratch_path,
                kind="error",
                payload=f"hermes binary not found: {exc}",
            )
            scratchpad.touch_heartbeat(heartbeat_path, note="hermes binary missing")
            print(
                f"[hermes-loop] worker={cfg.id} executor=hermes but hermes binary "
                f"not found on PATH. Set HERMES_BIN or install Hermes CLI.",
                file=sys.stderr,
            )
            return 4
        except Exception as exc:  # pragma: no cover - defensive
            scratchpad.append(
                scratch_path,
                kind="error",
                payload=f"executor=hermes crashed: {type(exc).__name__}: {exc}",
            )
            scratchpad.touch_heartbeat(heartbeat_path, note=f"crashed {type(exc).__name__}")
            print(
                f"[hermes-loop] worker={cfg.id} executor=hermes crashed: {exc}",
                file=sys.stderr,
            )
            return 5

    # Unknown executor string — fail safe.
    scratchpad.append(
        scratch_path,
        kind="error",
        payload=f"unknown executor {cfg.executor!r} (expected 'hermes' or 'none')",
    )
    print(
        f"[hermes-loop] worker={cfg.id}: unknown executor {cfg.executor!r}. "
        f"Set to 'hermes' or 'none'.",
        file=sys.stderr,
    )
    return 6
