#!/usr/bin/env bash
# Segment tests for hook_guard_arm.py
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
export PYTHONPATH="${SCRIPT_DIR}/scripts"

python3 - <<'PY'
import hook_guard_arm as guard

ok, msg = guard.should_deny_arm(
    "bash tools/cursor-loop/scripts/prepare_arm_wake.sh . "
    "--state-file docs/window-instances/worker-relay/STATE.md --loop-id worker-relay --exec"
)
assert ok is False, "prepare --exec should be allowed"

ok, msg = guard.should_deny_arm(
    "LOOP_ID=worker-relay bash tools/cursor-loop/scripts/arm-wake.sh"
)
assert ok is True, "bare arm-wake should be denied"
assert msg and "prepare_arm_wake.sh" in msg

ok, _ = guard.should_deny_arm(
    "(bash prepare_arm_wake.sh . --state-file x/STATE.md || RITUAL_GATE_FORCE=1 bash arm-wake.sh)"
)
assert ok is True, "RITUAL_GATE_FORCE fallback should be denied"

print("test_hook_guard_arm: ok")
PY
