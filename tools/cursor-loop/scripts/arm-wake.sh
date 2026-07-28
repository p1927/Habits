#!/usr/bin/env bash
# Dynamic-mode one-shot wake — monitored shell sleeps then prints wake_sentinel JSON line.
# Env: LOOP_ID, WAKE_SENTINEL, INTERVAL, CONTRACT_DOC, STATE_FILE (optional), PROJECT_ROOT (optional)
set -euo pipefail

LOOP_ID="${LOOP_ID:?LOOP_ID is required}"
WAKE_SENTINEL="${WAKE_SENTINEL:?WAKE_SENTINEL is required}"
INTERVAL="${INTERVAL:-120}"
CONTRACT_DOC="${CONTRACT_DOC:?CONTRACT_DOC is required}"
STATE_FILE="${STATE_FILE:-}"
PROJECT_ROOT="${PROJECT_ROOT:-.}"

if ! [[ "$INTERVAL" =~ ^[0-9]+$ ]] || [[ "$INTERVAL" -lt 1 ]]; then
  echo "AGENT_LOOP_ERROR invalid INTERVAL=${INTERVAL}" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WAKE_PIDFILE="${WAKE_PIDFILE:-${TMPDIR:-/tmp}/cursor-loop-${LOOP_ID}.wake.pid}"

if [[ -n "$STATE_FILE" && -f "$PROJECT_ROOT/$STATE_FILE" ]]; then
  gate_args=(
    --project "$PROJECT_ROOT"
    --loop-id "$LOOP_ID"
    --state-file "$STATE_FILE"
    --mode arm
  )
  if [[ -n "${RITUAL_GATE_FORCE:-}" ]]; then
    gate_args+=(--force)
  fi
  python3 "${SCRIPT_DIR}/validate_ritual_gate.py" "${gate_args[@]}" || exit 1
fi

python3 "${SCRIPT_DIR}/record_wake_fired.py" --clear "$LOOP_ID" 2>/dev/null || true

if [[ -f "$WAKE_PIDFILE" ]]; then
  old_pid="$(cat "$WAKE_PIDFILE" 2>/dev/null || true)"
  if [[ -n "$old_pid" ]] && kill -0 "$old_pid" 2>/dev/null; then
    echo "WAKE_ALREADY_ARMED loop_id=${LOOP_ID} pid=${old_pid} interval=${INTERVAL}s sentinel=${WAKE_SENTINEL}"
    exit 0
  fi
  rm -f "$WAKE_PIDFILE"
fi

PAYLOAD="$(python3 "${SCRIPT_DIR}/build_wake_prompt.py" \
  --loop-id "$LOOP_ID" \
  --contract-doc "$CONTRACT_DOC" \
  --state-file "$STATE_FILE" \
  --project "$PROJECT_ROOT")"

echo "$$" > "$WAKE_PIDFILE"
python3 "${SCRIPT_DIR}/record_wake_meta.py" "$LOOP_ID" "$INTERVAL" "$WAKE_SENTINEL" "$$" 2>/dev/null || true

# Warn immediately if notify_on_output was not recorded — sentinel will fire silently.
_notify_ok="$(PYTHONPATH="${SCRIPT_DIR}" LOOP_ID="${LOOP_ID}" python3 -c "
import os, loop_hook_lib as m
lid = os.environ.get('LOOP_ID', '')
meta = m.read_wake_meta(lid)
print('yes' if m.is_notify_attached(meta) else 'no')
" 2>/dev/null || echo 'no')"
if [[ "$_notify_ok" != "yes" ]]; then
    echo "WAKE_ORPHAN_WARN loop_id=${LOOP_ID} notify_on_output not attached — sentinel will fire silently; re-arm with block_until_ms=0 and notify_on_output=SHELL_NOTIFY_ON_OUTPUT"
fi

cleanup() {
  rm -f "$WAKE_PIDFILE"
}
trap cleanup EXIT INT TERM

echo "WAKE_ARMED loop_id=${LOOP_ID} interval=${INTERVAL}s sentinel=${WAKE_SENTINEL} pid=$$"

INJECT_POLL_SEC="${INJECT_POLL_SEC:-5}"
remaining="$INTERVAL"
FIRED_LINE=""
while (( remaining > 0 )); do
  if FIRED_LINE="$(python3 "${SCRIPT_DIR}/consume_inject_arm.py" "$LOOP_ID" 2>/dev/null)"; then
    echo "WAKE_INJECT loop_id=${LOOP_ID} reason=inject_request"
    break
  fi
  chunk="$INJECT_POLL_SEC"
  if (( remaining < chunk )); then
    chunk="$remaining"
  fi
  sleep "$chunk"
  remaining=$(( remaining - chunk ))
done

if [[ -z "$FIRED_LINE" ]]; then
  FIRED_LINE="${WAKE_SENTINEL} ${PAYLOAD}"
fi
echo "$FIRED_LINE"
python3 "${SCRIPT_DIR}/record_wake_fired.py" "$LOOP_ID" "$FIRED_LINE" 2>/dev/null || true
