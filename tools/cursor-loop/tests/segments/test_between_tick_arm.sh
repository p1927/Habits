#!/usr/bin/env bash
# Segment: between-tick arm gate allows re-arm with main-scope diff
set -euo pipefail

HABITS_ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
SCRIPTS="${HABITS_ROOT}/tools/cursor-loop/scripts"
export PYTHONPATH="${SCRIPTS}:${PYTHONPATH:-}"

OUT="$(python3 "${SCRIPTS}/validate_ritual_gate.py" --project "${HABITS_ROOT}" \
  --loop-id worker-relay \
  --state-file docs/window-instances/worker-relay/STATE.md \
  --mode arm 2>&1)" || true

echo "$OUT" | grep -q "RITUAL_GATE_OK" || {
  echo "FAIL: worker-relay arm gate should pass at 9-arm between ticks"
  echo "$OUT"
  exit 1
}
echo "OK between-tick arm gate passes"
