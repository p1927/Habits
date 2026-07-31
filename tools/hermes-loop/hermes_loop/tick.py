"""Drive a single tick of a Hermes Loop worker.

Slice A keeps this intentionally minimal: build the bundle, write it
under tools/hermes-loop/bundles/<id>/, touch the heartbeat, append to
the scratchpad. Slice B will swap the executor to a real one.

The executor field is intentionally unused in Slice A. We log it so the
operator knows whether the tick actually ran an agent.
"""

from __future__ import annotations

import sys
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


def run_one(cfg: WorkerConfig, *, dry_run: bool, repo_root: Path | None = None) -> int:
    repo_root = repo_root or _find_repo_root(Path.cwd())

    prompt = build_prompt(cfg, repo_root)
    bundle_path = write_bundle(prompt, repo_root, cfg.id)

    scratch_path = repo_root / cfg.scratchpad
    heartbeat_path = repo_root / cfg.heartbeat

    if dry_run or cfg.executor == "none":
        scratchpad.append(
            scratch_path,
            kind="dry-run" if dry_run else "noop",
            payload=(
                f"executor={cfg.executor!r} bundle={bundle_path.relative_to(repo_root)} "
                f"len={len(prompt)} bytes"
            ),
        )
        scratchpad.touch_heartbeat(heartbeat_path, note=f"dry-run bundle written at {bundle_path.name}")
        print(f"[hermes-loop] worker={cfg.id} executor={cfg.executor} dry_run={dry_run}")
        print(f"[hermes-loop] bundle written: {bundle_path.relative_to(repo_root)}")
        return 0

    # Slice B/C will spawn the configured executor here. For Slice A we
    # have no executor other than 'none', so the branch above is what
    # actually runs in this slice.
    scratchpad.append(
        scratch_path,
        kind="error",
        payload=f"executor {cfg.executor!r} not implemented in Slice A",
    )
    print(
        f"[hermes-loop] worker={cfg.id} executor={cfg.executor!r} is not wired up "
        f"in Slice A. Run with --dry-run to see the bundle.",
        file=sys.stderr,
    )
    return 2
