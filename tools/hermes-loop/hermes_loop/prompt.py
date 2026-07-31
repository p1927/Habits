"""Build the wake prompt a tick would hand to an executor.

The prompt is fully self-contained so a fresh Hermes session can pick
up where the previous one left off without shared context.
"""

from __future__ import annotations

import json
from pathlib import Path

from .config import WorkerConfig
from .scratchpad import heartbeat_age_str


_HEADER = """\
You are an autonomous Hermes sub-agent driving the {worker_id} window instance.
Read the bundle below as a single tick of your ritual.

DO NOT EDIT THIS BUNDLE FILE. Use it as reference only.

Per window contract:
  - 9-phase ritual from docs/window-instances/{worker_id}/RITUAL.md
  - Anti-idle / anti-empty-backlog mandates are mandatory
  - Always checkpoint STATE via tools/cursor-loop/scripts/state_api.sh
"""

_FOOTER = """\
End of bundle. Begin tick:
  1. Phase 1 wake → advance_ritual_step.sh --apply
  2. Phases 2-9 per RITUAL.md
  3. Final line of your reply MUST be:
        STATUS: <ok|stuck|skipped|error> item_id=<relay-N> evidence=<one-line>

The scheduler reads only the final STATUS line to decide next cadence.
"""


def _read_rel(path: Path, *, must_exist: bool = True) -> str:
    if path.is_file():
        return path.read_text(encoding="utf-8")
    if must_exist:
        return f"<<MISSING FILE: {path.as_posix()}>>"
    return ""


def build_prompt(
    cfg: WorkerConfig,
    repo_root: Path,
    *,
    include_state_snapshot: bool = True,
) -> str:
    """Return the wake prompt for a tick of this worker.

    The prompt bundles (a) the worker contract bundle (INSTANCE, IDENTITY,
    RITUAL), (b) a fresh state snapshot pulled via state_api, and
    (c) the per-window reminder header.
    """
    instance_md = repo_root / f"docs/window-instances/{cfg.id}/INSTANCE.md"
    identity_md = repo_root / f"docs/window-instances/{cfg.id}/IDENTITY.md"
    ritual_md = repo_root / f"docs/window-instances/{cfg.id}/RITUAL.md"
    state_md = repo_root / cfg.state_file

    bundle_parts = [
        "=" * 72,
        f"WORKER_ID: {cfg.id}",
        f"TICK_AT:  {__import__('datetime').datetime.now().astimezone().isoformat()}",
        f"LAST_HEARTBEAT: {heartbeat_age_str(repo_root / cfg.heartbeat)}",
        "=" * 72,
        "",
        _HEADER.format(worker_id=cfg.id),
        "",
        "-" * 72,
        f"INSTANCE.md — path: {instance_md.as_posix()}",
        "-" * 72,
        _read_rel(instance_md),
        "",
        "-" * 72,
        f"IDENTITY.md — path: {identity_md.as_posix()}",
        "-" * 72,
        _read_rel(identity_md),
        "",
        "-" * 72,
        f"RITUAL.md — path: {ritual_md.as_posix()}",
        "-" * 72,
        _read_rel(ritual_md),
        "",
    ]
    if include_state_snapshot:
        bundle_parts.extend(
            [
                "-" * 72,
                f"STATE.md snapshot — path: {state_md.as_posix()}",
                "-" * 72,
                _read_rel(state_md, must_exist=False),
                "",
            ]
        )
    bundle_parts.extend(["", _FOOTER])

    return "\n".join(bundle_parts)


def write_bundle(prompt: str, repo_root: Path, worker_id: str) -> Path:
    """Write the bundle to a stable path and return it.

    Path: ``tools/hermes-loop/bundles/<worker_id>/<tick_at>.md``.
    """
    from datetime import datetime as _dt

    ts = _dt.now().astimezone().strftime("%Y%m%dT%H%M%S")
    bundle_dir = repo_root / "tools/hermes-loop/bundles" / worker_id
    bundle_dir.mkdir(parents=True, exist_ok=True)
    bundle_path = bundle_dir / f"{ts}.md"
    bundle_path.write_text(prompt, encoding="utf-8")
    return bundle_path
