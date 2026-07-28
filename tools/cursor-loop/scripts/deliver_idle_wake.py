#!/usr/bin/env python3
"""Deliver missed dynamic wake via pending inject queue or macOS notification."""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import loop_hook_lib as mod


def notify_macos(title: str, message: str) -> bool:
    safe_title = title.replace('"', "'")
    safe_msg = message.replace('"', "'")[:500]
    script = f'display notification "{safe_msg}" with title "{safe_title}"'
    try:
        subprocess.run(["osascript", "-e", script], check=False, capture_output=True)
        return True
    except (OSError, subprocess.SubprocessError):
        return False


def deliver_loop(root: Path, loop_id: str, *, dry_run: bool = False) -> bool:
    fired = mod.read_wake_fired(loop_id)
    if not fired:
        return False

    lock = mod.read_loop_lock(root, loop_id)
    conversation_id = (lock or {}).get("conversation_id") or ""
    payload_line = (fired.get("payload_line") or "").strip()
    message = (
        f"Loop {loop_id} tick ready (sentinel fired at {fired.get('fired_at', '?')}). "
        f"Paste keep working or focus bound chat. Payload: {payload_line[:200]}"
    )

    if dry_run:
        print(f"DRY_RUN deliver loop_id={loop_id} conversation={conversation_id[:12]}")
        return True

    mod.queue_pending_inject(
        root,
        loop_id,
        conversation_id,
        payload_line,
        reason="tick_daemon",
    )
    notify_macos(f"Habits loop {loop_id}", "Tick ready — focus chat or send keep working")
    mod.clear_wake_fired(loop_id)
    print(json.dumps({"delivered": True, "loop_id": loop_id, "conversation_id": conversation_id}))
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Deliver idle wake for a loop")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--loop-id", required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    ok = deliver_loop(root, args.loop_id, dry_run=args.dry_run)
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
