#!/usr/bin/env bash
# Segment tests for hook_guard_checkpoint.py
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
export PYTHONPATH="${SCRIPT_DIR}/scripts"

python3 - <<'PY'
import hook_guard_checkpoint as guard

deny, msg = guard.should_deny_edit(
    "StrReplace",
    {
        "path": "docs/window-instances/worker-relay/STATE.md",
        "old_string": "| phase | `8-close` |",
        "new_string": "| phase | `9-arm` |",
    },
)
assert deny is True, "manual phase edit should be denied"
assert "phase" in msg

deny, msg = guard.should_deny_edit(
    "StrReplace",
    {
        "path": "docs/window-instances/worker-relay/STATE.md",
        "old_string": "- [ ] relay-200",
        "new_string": "- [x] relay-200",
    },
)
assert deny is False, "backlog checkbox edit should be allowed"

print("test_guard_checkpoint: ok")
PY
