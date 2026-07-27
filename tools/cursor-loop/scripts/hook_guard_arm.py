#!/usr/bin/env python3
"""Block bare arm-wake.sh — it fires sentinels without waking the bound chat."""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

import loop_hook_lib as mod

_PREPARE_EXEC = re.compile(r"prepare_arm_wake\.sh[^\n;|&]*--exec")
_ARM_WAKE = re.compile(r"(?:^|[;&|\s(])(?:bash\s+)?(?:[^\s'\"]*[/])?arm-wake\.sh\b")


def _command_from_payload(payload: dict) -> str:
    event = payload.get("hook_event_name") or ""
    if event == "preToolUse":
        tool = payload.get("tool_name") or payload.get("tool") or ""
        if tool != "Shell":
            return ""
        tool_input = payload.get("tool_input") or {}
        return str(tool_input.get("command") or "")
    if event == "beforeShellExecution":
        return str(payload.get("command") or "")
    return ""


def _deny_message(state_file: str = "<STATE.md>", loop_id: str = "<loop_id>") -> str:
    return (
        "BLOCKED: bare arm-wake.sh cannot wake this chat when run in background. "
        "Phase 9 MUST use foreground exec:\n"
        f"  bash tools/cursor-loop/scripts/prepare_arm_wake.sh . "
        f"--state-file {state_file} --loop-id {loop_id} --exec\n"
        "Run with Shell block_until_ms >= SHELL_BLOCK_UNTIL_MS from prepare output. "
        "When AGENT_LOOP_WAKE_* prints, run Ritual phases 1→8 in THIS turn before ending."
    )


def should_deny_arm(command: str) -> tuple[bool, str | None]:
    cmd = command.strip()
    if not cmd:
        return False, None
    if "arm-wake.sh" not in cmd and "prepare_arm_wake.sh" not in cmd:
        return False, None
    if _PREPARE_EXEC.search(cmd):
        return False, None
    if _ARM_WAKE.search(cmd):
        loop_id = ""
        state_file = "<STATE.md>"
        m = re.search(r"STATE_FILE=([^\s]+)", cmd)
        if m:
            state_file = m.group(1)
        m = re.search(r"LOOP_ID=([^\s]+)", cmd)
        if m:
            loop_id = m.group(1)
        if not loop_id and state_file != "<STATE.md>":
            loop_id = Path(state_file).parent.name
        if not loop_id:
            loop_id = "<loop_id>"
        return True, _deny_message(state_file, loop_id)
    return False, None


def main() -> int:
    raw = os.environ.get("CURSOR_LOOP_INPUT", "")
    if not raw:
        return 0
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return 0

    command = _command_from_payload(payload)
    deny, msg = should_deny_arm(command)
    if not deny or not msg:
        return 0

    print(
        json.dumps(
            {
                "permission": "deny",
                "user_message": "Use prepare_arm_wake.sh --exec (foreground) for Phase 9",
                "agent_message": msg,
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
