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

import subprocess
import sys
import threading
import time
import pathlib
from datetime import datetime, timezone
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



def _start_heartbeat(heartbeat_path: Path, scratch_path: Path, stop: threading.Event) -> threading.Thread:
    """Background thread: write every 60s while a tick is in flight so the
    loop dispatcher can distinguish a *stuck* tick (BUSY stale >90 min) from
    a *healthy* long-running one. Without this, the dispatcher can't tell
    the difference between "agent is making progress" and "agent is hung."
    """
    def _run():
        while not stop.wait(60.0):
            try:
                pathlib.Path(heartbeat_path).write_text(
                    f"tick_heartbeat pid={os.getpid()} ts={datetime.now(timezone.utc).isoformat()}\n",
                    encoding="utf-8",
                )
                scratchpad.touch_heartbeat(
                    pathlib.Path(heartbeat_path),
                    note="tick progress heartbeat (60s)",
                )
            except Exception as exc:  # pragma: no cover
                # Heartbeats must never kill the agent's tick.
                pass
    t = threading.Thread(target=_run, name="tick-heartbeat", daemon=True)
    t.start()
    return t



def run_one(
    cfg: WorkerConfig,
    *,
    dry_run: bool,
    repo_root: Path | None = None,
    timeout_seconds: int | None = None,
) -> int:
    repo_root = repo_root or _find_repo_root(Path.cwd())

    prompt = build_prompt(cfg, repo_root)
    bundle_path = write_bundle(prompt, repo_root, cfg.id)

    scratch_path = repo_root / cfg.scratchpad
    heartbeat_path = repo_root / cfg.heartbeat

    # Resolve the effective timeout now — used in two places (scratchpad log,
    # subprocess.run) so capture once.
    effective_timeout = (
        timeout_seconds
        if timeout_seconds is not None
        else cfg.effective_timeout()
    )

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
                payload=(
                    f"executor=hermes bundle={bundle_path.relative_to(repo_root)} "
                    f"timeout={effective_timeout}s max_turns={cfg.effective_max_turns()}"
                ),
            )
            print(f"[hermes-loop] tick start worker={cfg.id} bundle={bundle_path.relative_to(repo_root)} timeout={effective_timeout}s")
            _hb_stop = threading.Event()
            _hb_thread = _start_heartbeat(heartbeat_path, scratch_path, _hb_stop)

            t0 = time.monotonic()
            proc = hermes_run(
                cfg,
                bundle_path=bundle_path,
                repo_root=repo_root,
                timeout_seconds=effective_timeout,
            )
            _hb_stop.set()
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
        except subprocess.TimeoutExpired:
            _hb_stop.set()
            elapsed = time.monotonic() - t0
            scratchpad.append(
                scratch_path,
                kind="error",
                payload=(
                    f"executor=hermes timed out after {effective_timeout}s "
                    f"(max_turns={cfg.effective_max_turns()}); this means the LLM "
                    f"needed more than the configured budget. Set "
                    f"HERMES_LOOP_TICK_TIMEOUT env var or tick_timeout_seconds in "
                    f"the worker JSON to give it more room, or break the backlog "
                    f"item into smaller ones."
                ),
            )
            scratchpad.touch_heartbeat(
                heartbeat_path,
                note=f"timeout after {effective_timeout}s elapsed={elapsed:.1f}s",
            )
            print(
                f"[hermes-loop] tick TIMEOUT worker={cfg.id} "
                f"elapsed={elapsed:.1f}s budget={effective_timeout}s — set "
                f"HERMES_LOOP_TICK_TIMEOUT higher or add tick_timeout_seconds "
                f"to the worker config.",
                file=sys.stderr,
            )
            return 5
        except FileNotFoundError as exc:
            _hb_stop.set()
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
            try: _hb_stop.set()
            except Exception: pass
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
