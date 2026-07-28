#!/usr/bin/env bash
# Rearm all window instances that are not ready_for_autonomous_tick.
# Usage: rearm_all_instances.sh [project] [--force] [--all]
#   --force  pass RITUAL_GATE_FORCE=1 when arm gate fails
#   --all    rearm every instance even if currently ARMED
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="${1:-.}"
shift || true
FORCE=0
REARM_ALL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE=1; shift ;;
    --all) REARM_ALL=1; shift ;;
    *) echo "Unknown: $1" >&2; exit 1 ;;
  esac
done

ROOT="$(cd "$ROOT" && pwd)"
export PYTHONPATH="${SCRIPT_DIR}:${PYTHONPATH:-}"

REPORT="$(python3 "${SCRIPT_DIR}/watch_window_instances.py" "$ROOT" --json)"
export REPORT
export REARM_ALL
export ROOT
TARGETS="$(python3 - <<'PY'
import json, os
data = json.loads(os.environ["REPORT"])
targets = [r["loop_id"] for r in data["instances"] if not r["ready_for_autonomous_tick"]]
if os.environ.get("REARM_ALL") == "1":
    targets = [r["loop_id"] for r in data["instances"]]
print(" ".join(targets))
PY
)"

if [[ -z "$TARGETS" ]]; then
  echo "REARM_ALL_SKIP reason=all_instances_ready"
  exit 0
fi

echo "REARM_ALL_BEGIN targets=${TARGETS}"

for LOOP_ID in $TARGETS; do
  export LOOP_ID
  eval "$(python3 - <<'PY'
import json, os
from pathlib import Path
import loop_hook_lib as lh

root = Path(os.environ["ROOT"])
report = json.loads(os.environ["REPORT"])
row = next(r for r in report["instances"] if r["loop_id"] == os.environ["LOOP_ID"])
contract = row["contract_doc"]
state = row["state_file"]
text = (root / contract).read_text(encoding="utf-8")
cfg = lh.parse_loop_config(text)
print(f'export WAKE_SENTINEL="{cfg.get("wake_sentinel", "")}"')
print(f'export INTERVAL="{cfg.get("interval_sec", "120")}"')
print(f'export CONTRACT_DOC="{contract}"')
print(f'export STATE_FILE="{state}"')
PY
)"
  export LOOP_ID CONTRACT_DOC STATE_FILE PROJECT_ROOT="${ROOT}"

  gate_ok=0
  if python3 "${SCRIPT_DIR}/validate_ritual_gate.py" \
    --project "$ROOT" --loop-id "$LOOP_ID" --state-file "$STATE_FILE" --mode arm 2>/dev/null; then
    gate_ok=1
  fi

  if [[ "$gate_ok" -eq 0 && "$FORCE" -eq 1 ]]; then
    export RITUAL_GATE_FORCE=1
  elif [[ "$gate_ok" -eq 0 ]]; then
    echo "REARM_SKIP loop_id=${LOOP_ID} reason=ritual_gate_failed (use --force)"
    continue
  fi

  if bash "${SCRIPT_DIR}/verify-wake.sh" "$LOOP_ID" 2>/dev/null; then
    echo "REARM_SKIP loop_id=${LOOP_ID} reason=already_armed"
    continue
  fi

  bash "${SCRIPT_DIR}/arm-wake.sh" &
  arm_pid=$!
  disown "$arm_pid" 2>/dev/null || true
  rearm_ok=0
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    if bash "${SCRIPT_DIR}/verify-wake.sh" "$LOOP_ID" 2>/dev/null; then
      echo "REARM_OK loop_id=${LOOP_ID} sentinel=${WAKE_SENTINEL}"
      rearm_ok=1
      break
    fi
    if ! kill -0 "$arm_pid" 2>/dev/null; then
      echo "REARM_FAIL loop_id=${LOOP_ID} reason=arm_wake_exited"
      break
    fi
    sleep 0.3
  done
  if [[ "$rearm_ok" -eq 0 ]] && kill -0 "$arm_pid" 2>/dev/null; then
    echo "REARM_FAIL loop_id=${LOOP_ID} reason=verify_timeout"
  fi
  unset RITUAL_GATE_FORCE 2>/dev/null || true
done

echo "REARM_ALL_END"
