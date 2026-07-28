#!/usr/bin/env bash
# Print arm-wake env + Shell requirements (Phase 9 prep), or run arm-wake (--exec).
# Usage: prepare_arm_wake.sh [project] --state-file PATH [--loop-id ID] [--exec] [--recovery-foreground]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="${1:-.}"
if [[ -d "$ROOT" ]]; then
  shift || true
else
  ROOT="."
fi

STATE_FILE=""
LOOP_ID=""
EXEC=0
RECOVERY_FOREGROUND=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --state-file) STATE_FILE="${2:?}"; shift 2 ;;
    --loop-id) LOOP_ID="${2:?}"; shift 2 ;;
    --exec) EXEC=1; shift ;;
    --recovery-foreground) RECOVERY_FOREGROUND=1; shift ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$STATE_FILE" ]]; then
  echo "Usage: prepare_arm_wake.sh [project] --state-file PATH [--loop-id ID] [--exec] [--recovery-foreground]" >&2
  exit 1
fi

if [[ "$EXEC" -eq 1 && "$RECOVERY_FOREGROUND" -eq 0 ]]; then
  echo "prepare_arm_wake.sh: --exec requires --recovery-foreground (recovery path only)" >&2
  exit 1
fi

ROOT="$(cd "$ROOT" && pwd)"
LOOP_ID="${LOOP_ID:-$(basename "$(dirname "$STATE_FILE")")}"
CONTRACT_DOC="docs/window-instances/${LOOP_ID}/INSTANCE.md"

eval "$(PYTHONPATH="${SCRIPT_DIR}" python3 - <<PY
import loop_hook_lib as mod
from pathlib import Path
root = Path("$ROOT")
text = (root / "$CONTRACT_DOC").read_text(encoding="utf-8")
cfg = mod.parse_loop_config(text)
for k in ("wake_sentinel", "interval_sec", "monitor_regex"):
    v = cfg.get(k, "")
    print(f'export {k.upper()}="{v}"')
PY
)"

BLOCK_MS="$(PYTHONPATH="${SCRIPT_DIR}" python3 -c "import loop_hook_lib as m; print(m.arm_block_until_ms('${INTERVAL_SEC}'))")"

echo "PREPARE_ARM_WAKE_BEGIN"
echo "loop_id=${LOOP_ID}"
echo "wake_sentinel=${WAKE_SENTINEL}"
echo "interval_sec=${INTERVAL_SEC}"
echo "monitor_regex=${MONITOR_REGEX}"
echo "SHELL_BLOCK_UNTIL_MS=${BLOCK_MS}"
echo "SHELL_NOTIFY_ON_OUTPUT=${MONITOR_REGEX}"
echo "PHASE_9_MODE=background_notify_primary"
echo "ARM_COMMAND=LOOP_ID=${LOOP_ID} WAKE_SENTINEL=${WAKE_SENTINEL} INTERVAL=${INTERVAL_SEC} CONTRACT_DOC=${CONTRACT_DOC} STATE_FILE=${STATE_FILE} PROJECT_ROOT=${ROOT} bash tools/cursor-loop/scripts/phase9-notify-arm.sh"
echo "CRITICAL=Run ARM_COMMAND with block_until_ms=0 (background) AND notify_on_output=SHELL_NOTIFY_ON_OUTPUT; end turn while verify-wake shows ARMED"
if [[ "$RECOVERY_FOREGROUND" -eq 1 ]]; then
  echo "EXEC_COMMAND=bash tools/cursor-loop/scripts/prepare_arm_wake.sh . --state-file ${STATE_FILE} --loop-id ${LOOP_ID} --exec --recovery-foreground"
  echo "RECOVERY_NOTE=Recovery only: run EXEC_COMMAND with block_until_ms=SHELL_BLOCK_UNTIL_MS; process AGENT_LOOP_WAKE in same turn"
fi
echo "PREPARE_ARM_WAKE_END"

if [[ "$EXEC" -eq 1 ]]; then
  export LOOP_ID WAKE_SENTINEL INTERVAL="${INTERVAL_SEC}" CONTRACT_DOC STATE_FILE PROJECT_ROOT="${ROOT}"
  exec bash "${SCRIPT_DIR}/arm-wake.sh"
fi
