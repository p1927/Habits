#!/usr/bin/env bash
# Print arm-wake env + Shell monitor requirements (Phase 9 prep).
# Usage: prepare_arm_wake.sh [project] --state-file PATH [--loop-id ID]
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

while [[ $# -gt 0 ]]; do
  case "$1" in
    --state-file) STATE_FILE="${2:?}"; shift 2 ;;
    --loop-id) LOOP_ID="${2:?}"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$STATE_FILE" ]]; then
  echo "Usage: prepare_arm_wake.sh [project] --state-file PATH [--loop-id ID]" >&2
  exit 1
fi

ROOT="$(cd "$ROOT" && pwd)"
LOOP_ID="${LOOP_ID:-$(basename "$(dirname "$STATE_FILE")")}"
CONTRACT_DOC="docs/window-instances/${LOOP_ID}/INSTANCE.md"

eval "$(python3 - <<PY
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

echo "PREPARE_ARM_WAKE_BEGIN"
echo "loop_id=${LOOP_ID}"
echo "wake_sentinel=${WAKE_SENTINEL}"
echo "interval_sec=${INTERVAL_SEC}"
echo "monitor_regex=${MONITOR_REGEX}"
echo "SHELL_BLOCK_UNTIL_MS=0"
echo "SHELL_NOTIFY_ON_OUTPUT=${MONITOR_REGEX}"
echo "CRITICAL=Shell MUST set notify_on_output pattern monitor_regex or sentinel will not wake this chat"
echo "ARM_COMMAND=LOOP_ID=${LOOP_ID} WAKE_SENTINEL=${WAKE_SENTINEL} INTERVAL=${INTERVAL_SEC} CONTRACT_DOC=${CONTRACT_DOC} STATE_FILE=${STATE_FILE} PROJECT_ROOT=${ROOT} bash tools/cursor-loop/scripts/arm-wake.sh"
echo "PREPARE_ARM_WAKE_END"
