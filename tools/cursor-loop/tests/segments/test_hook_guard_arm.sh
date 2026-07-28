#!/usr/bin/env bash
# Segment tests for hook_guard_arm.py (v0.7.0 background primary)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
export PYTHONPATH="${SCRIPT_DIR}/scripts"

python3 - <<'PY'
import hook_guard_arm as guard

ok, msg = guard.should_deny_arm(
    "bash tools/cursor-loop/scripts/prepare_arm_wake.sh . "
    "--state-file docs/window-instances/worker-relay/STATE.md --loop-id worker-relay --exec"
)
assert ok is True, "steady-state --exec should be denied"
assert msg and "recovery-foreground" in msg

ok, msg = guard.should_deny_arm(
    "bash tools/cursor-loop/scripts/prepare_arm_wake.sh . "
    "--state-file docs/window-instances/worker-relay/STATE.md --loop-id worker-relay "
    "--exec --recovery-foreground"
)
assert ok is False, "recovery --exec should be allowed"

ok, msg = guard.should_deny_arm(
    "LOOP_ID=worker-relay bash tools/cursor-loop/scripts/arm-wake.sh"
)
assert ok is False, "bare arm-wake should be allowed (beforeShell path)"

ok, msg = guard.should_deny_arm(
    "LOOP_ID=worker-relay bash tools/cursor-loop/scripts/arm-wake.sh",
    notify_pattern=None,
    block_until_ms=0,
    enforce_notify=True,
)
assert ok is True, "background arm without notify should be denied at preToolUse"

ok, msg = guard.should_deny_arm(
    "LOOP_ID=worker-relay bash tools/cursor-loop/scripts/arm-wake.sh",
    notify_pattern="^AGENT_LOOP_WAKE_HABITS",
    block_until_ms=0,
    enforce_notify=True,
)
assert ok is False, "background arm with notify should be allowed"

import loop_hook_lib as lh

lh.clear_wake_pending("worker-relay")
lh.write_wake_pending("worker-relay", notify_pattern="^AGENT_LOOP_WAKE_HABITS", block_until_ms=0)
# simulate guard allow path (pending consumed on arm)
pending = lh.read_wake_pending("worker-relay")
assert pending is not None
assert pending["notify_pattern"] == "^AGENT_LOOP_WAKE_HABITS"

print("test_hook_guard_arm: ok")
PY
