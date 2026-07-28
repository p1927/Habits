#!/usr/bin/env python3
"""afterShellExecution — auto-continue when background arm-wake sentinel fires."""
from __future__ import annotations

import json
import os
import re
import sys

import loop_hook_lib as mod

_WAKE_LINE = re.compile(
    r"^(AGENT_LOOP_WAKE_[A-Z0-9_]+)\s+(\{.*\})\s*$",
    re.MULTILINE,
)
_PREPARE_EXEC = re.compile(r"prepare_arm_wake\.sh[^\n;|&]*--exec")


def _wake_lines(output: str) -> list[tuple[str, str]]:
    return [(m.group(1), m.group(2)) for m in _WAKE_LINE.finditer(output or "")]


def main() -> int:
    raw = os.environ.get("CURSOR_LOOP_INPUT", "")
    if not raw:
        return 0
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return 0

    conversation_id = payload.get("conversation_id") or ""
    command = str(payload.get("command") or "")
    output = str(payload.get("output") or "")

    if not conversation_id or not output:
        return 0

    wakes = _wake_lines(output)
    if not wakes:
        return 0

    # Foreground --exec: agent already has shell output in the same turn.
    if _PREPARE_EXEC.search(command):
        return 0

    root = mod.workspace_root(payload)
    if root is None:
        return 0

    binding = mod.read_binding(root, conversation_id)
    if not binding or binding.get("stopped") or binding.get("paused") or binding.get("bind_blocked"):
        return 0

    loop_id = binding.get("loop_id") or ""
    contract_doc = binding.get("contract_doc") or ""
    state_file = binding.get("state_file") or ""
    wake_sentinel = binding.get("wake_sentinel") or ""

    for sentinel, payload_json in wakes:
        if wake_sentinel and sentinel != wake_sentinel:
            continue
        try:
            wake_data = json.loads(payload_json)
        except json.JSONDecodeError:
            wake_data = {}
        if wake_data.get("loop_id") and wake_data.get("loop_id") != loop_id:
            continue

        line = f"{sentinel} {payload_json}"
        fired = mod.read_wake_fired(loop_id)
        if not fired or (fired.get("payload_line") or "").strip() != line.strip():
            mod.write_wake_fired(loop_id, line)

        msg = (
            f"TICK for {loop_id}: dynamic wake sentinel fired "
            f"(background arm — chat was not monitoring Shell). "
            f"Run Ritual phases 1→8 NOW from the wake payload below, "
            f"then re-arm with prepare_arm_wake.sh + ARM_COMMAND "
            f"(block_until_ms=0, notify_on_output on monitor_regex). "
            f"Read {contract_doc}"
        )
        if state_file:
            msg += f" and {state_file}"
        msg += f". Wake payload: {line}"
        print(json.dumps({"followup_message": msg}))
        return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
