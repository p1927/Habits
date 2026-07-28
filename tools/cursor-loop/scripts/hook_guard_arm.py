#!/usr/bin/env python3
"""Enforce Phase 9 arm contract — background notify primary; foreground exec recovery only."""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

import loop_hook_lib as mod

_RECOVERY_FOREGROUND = re.compile(r"--recovery-foreground")
_PREPARE_EXEC = re.compile(r"prepare_arm_wake\.sh[^\n;|&]*--exec")
_ARM_WAKE = re.compile(r"(?:^|[;&|\s(])(?:bash\s+)?(?:[^\s'\"]*[/])?arm-wake\.sh\b")
_PHASE9_NOTIFY_ARM = re.compile(r"(?:^|[;&|\s(])(?:bash\s+)?(?:[^\s'\"]*[/])?phase9-notify-arm\.sh\b")
_PREPARE_ARM = re.compile(r"prepare_arm_wake\.sh")


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


def _shell_meta(payload: dict) -> tuple[str | None, int | None]:
    """notify pattern and block_until_ms from preToolUse Shell tool_input."""
    tool_input = payload.get("tool_input") or {}
    if not isinstance(tool_input, dict):
        return None, None
    notify = tool_input.get("notify_on_output")
    pattern: str | None = None
    if isinstance(notify, dict):
        pattern = notify.get("pattern")
    elif isinstance(notify, str):
        pattern = notify
    block_ms = tool_input.get("block_until_ms")
    try:
        block_ms = int(block_ms) if block_ms is not None else None
    except (TypeError, ValueError):
        block_ms = None
    return pattern, block_ms


def _loop_context_from_command(command: str) -> tuple[str, str]:
    loop_id = ""
    state_file = "<STATE.md>"
    m = re.search(r"STATE_FILE=([^\s]+)", command)
    if m:
        state_file = m.group(1)
    m = re.search(r"LOOP_ID=([^\s]+)", command)
    if m:
        loop_id = m.group(1)
    if not loop_id and state_file != "<STATE.md>":
        loop_id = Path(state_file).parent.name
    # Return empty string if loop_id cannot be determined; callers must guard
    return loop_id, state_file


def _is_arm_command(command: str) -> bool:
    cmd = command.strip()
    if not cmd:
        return False
    return bool(_ARM_WAKE.search(cmd) or _PHASE9_NOTIFY_ARM.search(cmd) or _PREPARE_ARM.search(cmd))


def _is_notify_arm_command(command: str) -> bool:
    cmd = command.strip()
    if not cmd:
        return False
    return bool(_PHASE9_NOTIFY_ARM.search(cmd) or (_ARM_WAKE.search(cmd) and not _PREPARE_EXEC.search(cmd)))


def should_deny_arm(
    command: str,
    *,
    notify_pattern: str | None = None,
    block_until_ms: int | None = None,
    enforce_notify: bool = False,
) -> tuple[bool, str | None]:
    cmd = command.strip()
    if not _is_arm_command(cmd):
        return False, None

    recovery = bool(_RECOVERY_FOREGROUND.search(cmd))

    if _PREPARE_EXEC.search(cmd) and not recovery:
        return True, (
            "BLOCKED: prepare_arm_wake.sh --exec without --recovery-foreground is not allowed "
            "in steady state. Primary path: prepare_arm_wake.sh (no --exec), then ARM_COMMAND "
            "with block_until_ms=0 AND notify_on_output on monitor_regex from prep output. "
            "Use --recovery-foreground only when stop hook sent a recovery wake."
        )

    if _is_notify_arm_command(cmd) and not _PREPARE_EXEC.search(cmd):
        if block_until_ms is not None and block_until_ms > 0:
            return False, None
        if enforce_notify:
            if not notify_pattern or "AGENT_LOOP_WAKE" not in notify_pattern:
                return True, (
                    "BLOCKED: background arm-wake.sh requires Shell notify_on_output.pattern "
                    "matching AGENT_LOOP_WAKE_* (use SHELL_NOTIFY_ON_OUTPUT from prepare_arm_wake.sh). "
                    "Also set block_until_ms=0 for background arm."
                )
            if block_until_ms is not None and block_until_ms != 0:
                return True, (
                    "BLOCKED: background arm-wake.sh requires block_until_ms=0 plus "
                    "notify_on_output on monitor_regex."
                )

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
    event = payload.get("hook_event_name") or ""
    notify_pattern, block_ms = _shell_meta(payload) if event == "preToolUse" else (None, None)
    enforce_notify = event == "preToolUse"

    deny, msg = should_deny_arm(
        command,
        notify_pattern=notify_pattern,
        block_until_ms=block_ms,
        enforce_notify=enforce_notify,
    )
    if deny and msg:
        print(
            json.dumps(
                {
                    "permission": "deny",
                    "user_message": "Phase 9 arm must use background notify (see prepare_arm_wake.sh)",
                    "agent_message": msg,
                }
            )
        )
        return 0

    if (
        event == "preToolUse"
        and _is_notify_arm_command(command)
        and notify_pattern
        and (block_ms == 0 or block_ms is None)
        and "AGENT_LOOP_WAKE" in notify_pattern
    ):
        loop_id, _ = _loop_context_from_command(command)
        if loop_id:
            mod.write_wake_pending(
                loop_id,
                notify_pattern=notify_pattern,
                block_until_ms=0 if block_ms is None else block_ms,
                arm_source="agent_notify",
            )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
