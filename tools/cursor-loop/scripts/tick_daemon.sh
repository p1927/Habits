#!/usr/bin/env bash
# Poll unhealthy window instances; inject when NOTIFY=yes + macOS notify.
# Usage: tick_daemon.sh [project] [--interval SEC] [--notify-after SEC]
# Env: INJECT_AUTO=1  INJECT_COOLDOWN_SEC=600
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="${1:-.}"
shift || true
POLL_SEC=30
NOTIFY_AFTER=60

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interval) POLL_SEC="${2:?}"; shift 2 ;;
    --notify-after) NOTIFY_AFTER="${2:?}"; shift 2 ;;
    *) echo "Unknown: $1" >&2; exit 1 ;;
  esac
done

ROOT="$(cd "$ROOT" && pwd)"
export PYTHONPATH="${SCRIPT_DIR}"
export TICK_DAEMON_ROOT="$ROOT"
export TICK_DAEMON_NOTIFY_AFTER="$NOTIFY_AFTER"
INJECT_AUTO="${INJECT_AUTO:-1}"
INJECT_COOLDOWN_SEC="${INJECT_COOLDOWN_SEC:-600}"

notify_macos() {
  local title="$1"
  local msg="$2"
  if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "TICK_DAEMON_NOTIFY title=${title} msg=${msg}"
    return 0
  fi
  osascript -e "display notification $(python3 -c "import json; print(json.dumps('$msg'))") with title $(python3 -c "import json; print(json.dumps('$title'))")" 2>/dev/null \
    || echo "TICK_DAEMON_NOTIFY title=${title} msg=${msg}"
}

echo "TICK_DAEMON_START project=${ROOT} poll=${POLL_SEC}s ladder_auto=${INJECT_AUTO} cooldown=${INJECT_COOLDOWN_SEC}s"

while true; do
  if [[ "$INJECT_AUTO" == "1" ]]; then
    REPORT="$(python3 "${SCRIPT_DIR}/trigger_instance_wake.py" "$ROOT" \
      --reason daemon --source tick_daemon \
      --mode ladder \
      --cooldown-sec "$INJECT_COOLDOWN_SEC" --json 2>/dev/null || echo '{"results":[],"skipped":[],"needs_bind":[],"ok_count":0}')"
    python3 - <<'PY' "$REPORT" || echo "TICK_DAEMON_WARN report-parse python failed" >&2
import json, sys
report = json.loads(sys.argv[1])
for row in report.get("results") or []:
    lid = row.get("loop_id")
    method = row.get("succeeded") or row.get("method")
    if row.get("succeeded"):
        print(json.dumps({"kind": "WAKE_OK", "loop_id": lid, "method": method}))
    elif method == "inject_pending":
        print(json.dumps({"kind": "INJECT", "loop_id": lid, "reason": row.get("reason", "daemon")}))
    elif method == "needs_notify":
        print(json.dumps({"kind": "NEEDS_NOTIFY", "loop_id": lid, "reason": row.get("reason", "daemon"), "wake": row.get("wake", "?")}))
    elif method == "failed" or row.get("error"):
        print(json.dumps({"kind": "WAKE_FAIL", "loop_id": lid, "error": row.get("error", "failed")}))
for row in report.get("needs_bind") or []:
    print(json.dumps({"kind": "NEEDS_BIND", "loop_id": row["loop_id"]}))
for row in report.get("skipped") or []:
    if row.get("reason") == "inject_cooldown":
        print(json.dumps({"kind": "COOLDOWN", "loop_id": row["loop_id"]}))
PY
  else
    python3 - <<'PY' || echo "TICK_DAEMON_WARN spin-check python failed" >&2
import json, os
from datetime import datetime, timezone
from pathlib import Path
import loop_hook_lib as lh

root = Path(os.environ["TICK_DAEMON_ROOT"])
notify_after = int(os.environ.get("TICK_DAEMON_NOTIFY_AFTER", "60"))
instances = lh.load_instances_manifest(root, lh.load_manifest(root)).get("instances") or []
now = datetime.now(timezone.utc)
for entry in instances:
    loop_id = entry["loop_id"]
    fired = lh.read_wake_fired(loop_id)
    if fired:
        fired_at = fired.get("fired_at", "")
        try:
            age = int((now - datetime.fromisoformat(fired_at.replace("Z", "+00:00"))).total_seconds())
        except ValueError:
            age = notify_after
        if age >= notify_after:
            print(json.dumps({"kind": "SPIN", "loop_id": loop_id, "age_sec": age}))
PY
  fi | while read -r line; do
    [[ -z "$line" ]] && continue
    KIND="$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('kind','?'))" "$line")"
    LOOP_ID="$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['loop_id'])" "$line")"
    case "$KIND" in
      WAKE_OK)
        METHOD="$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('method',''))" "$line")"
        notify_macos "Habits ${LOOP_ID} wake" "Operator wake succeeded (${METHOD})."
        echo "TICK_DAEMON_WAKE_OK loop_id=${LOOP_ID} method=${METHOD}"
        ;;
      NEEDS_NOTIFY)
        REASON="$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('reason','daemon'))" "$line")"
        WAKE="$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('wake','?'))" "$line")"
        notify_macos "Habits ${LOOP_ID} ${WAKE}" "Focus chat and paste @INSTANCE keep working (${REASON})."
        echo "TICK_DAEMON_NEEDS_NOTIFY loop_id=${LOOP_ID} wake=${WAKE} reason=${REASON}"
        ;;
      INJECT)
        REASON="$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('reason','daemon'))" "$line")"
        notify_macos "Habits ${LOOP_ID} inject" "Inject pending (${REASON}); waiting for notify sleeper."
        echo "TICK_DAEMON_INJECT loop_id=${LOOP_ID} reason=${REASON}"
        ;;
      WAKE_FAIL)
        ERR="$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('error',''))" "$line")"
        notify_macos "Habits ${LOOP_ID} wake failed" "${ERR} — retrying via cwin trigger-all --force"
        echo "TICK_DAEMON_WAKE_FAIL loop_id=${LOOP_ID} error=${ERR}"
        ;;
      NEEDS_BIND)
        python3 "${SCRIPT_DIR}/provision_instances.py" "$ROOT" --loop-id "$LOOP_ID" --create-window 2>/dev/null || true
        notify_macos "Habits ${LOOP_ID} unbound" "Auto-provisioning Agent tab in Habits window…"
        echo "TICK_DAEMON_NEEDS_BIND loop_id=${LOOP_ID} action=provision"
        ;;
      COOLDOWN)
        echo "TICK_DAEMON_COOLDOWN loop_id=${LOOP_ID}"
        ;;
      SPIN)
        AGE="$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('age_sec',0))" "$line")"
        notify_macos "Habits ${LOOP_ID} SPIN" "Missed tick ${AGE}s ago — run cwin trigger-all --force."
        echo "TICK_DAEMON_SPIN loop_id=${LOOP_ID} age_sec=${AGE}"
        ;;
    esac
  done

  sleep "$POLL_SEC"
done
