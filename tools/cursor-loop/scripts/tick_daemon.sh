#!/usr/bin/env bash
# Poll unconsumed wake.fired markers; notify operator when SPIN persists.
# Usage: tick_daemon.sh [project] [--interval SEC] [--notify-after SEC]
# Does NOT wake chats — macOS notification only (Tier B mitigation).
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

echo "TICK_DAEMON_START project=${ROOT} poll=${POLL_SEC}s notify_after=${NOTIFY_AFTER}s"

while true; do
  python3 - <<'PY' | while read -r line; do
import json
import os
from datetime import datetime, timezone
from pathlib import Path

import loop_hook_lib as lh

root = Path(os.environ["TICK_DAEMON_ROOT"])
notify_after = int(os.environ.get("TICK_DAEMON_NOTIFY_AFTER", "60"))
manifest = lh.load_manifest(root)
instances = lh.load_instances_manifest(root, manifest).get("instances") or []
now = datetime.now(timezone.utc)

for entry in instances:
    loop_id = entry["loop_id"]
    fired = lh.read_wake_fired(loop_id)
    if not fired:
        continue
    fired_at = fired.get("fired_at", "")
    try:
        ts = datetime.fromisoformat(fired_at.replace("Z", "+00:00"))
        age = int((now - ts).total_seconds())
    except ValueError:
        age = notify_after
    if age >= notify_after:
        print(
            json.dumps(
                {
                    "loop_id": loop_id,
                    "age_sec": age,
                    "paste": f"@{entry.get('contract_doc', '')} keep working",
                }
            )
        )
PY
    [[ -z "$line" ]] && continue
    LOOP_ID="$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['loop_id'])" "$line")"
    PASTE="$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['paste'])" "$line")"
    AGE="$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['age_sec'])" "$line")"
    notify_macos "Habits ${LOOP_ID} SPIN" "Missed tick ${AGE}s ago. Focus chat and: ${PASTE}"
    echo "TICK_DAEMON_ALERT loop_id=${LOOP_ID} age_sec=${AGE}"
  done

  sleep "$POLL_SEC"
done
