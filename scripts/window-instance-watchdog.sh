#!/usr/bin/env bash
# Operator watchdog: poll window instance health; rearm all when code idle >= threshold.
#
# Usage:
#   bash scripts/window-instance-watchdog.sh [project]
# Env:
#   WATCHDOG_CHECK_SEC=60   poll interval
#   WATCHDOG_IDLE_SEC=300   rearm when no code activity for this many seconds
#
# Emits AGENT_LOOP_WAKE_INSTANCE_WATCHDOG on each check tick (for monitored-shell wake).
set -euo pipefail

ROOT="${1:-.}"
ROOT="$(cd "$ROOT" && pwd)"
CHECK_SEC="${WATCHDOG_CHECK_SEC:-60}"
IDLE_SEC="${WATCHDOG_IDLE_SEC:-300}"
SCRIPTS="${ROOT}/tools/cursor-loop/scripts"

echo "AGENT_LOOP_WAKE_INSTANCE_WATCHDOG {\"prompt\":\"Window instance watchdog started. check_sec=${CHECK_SEC} idle_sec=${IDLE_SEC}\"}"

# Initial rearm if instances are unhealthy (runs in this persistent shell so arm-wake survives).
bash "${SCRIPTS}/rearm_all_instances.sh" "$ROOT" --force || true

while true; do
  sleep "$CHECK_SEC"

  REPORT="$("${SCRIPTS}/watch_window_instances.py" "$ROOT" --idle-sec "$IDLE_SEC" --json)"
  SHOULD="$(python3 -c "import json,sys; print('yes' if json.loads(sys.stdin.read())['should_rearm'] else 'no')" <<<"$REPORT")"
  UNHEALTHY="$(python3 -c "import json,sys; d=json.loads(sys.stdin.read()); print(d['unhealthy_count'])" <<<"$REPORT")"
  IDLE="$(python3 -c "import json,sys; d=json.loads(sys.stdin.read()); print(d['idle_seconds'])" <<<"$REPORT")"

  if [[ "$SHOULD" == "yes" ]]; then
    echo "AGENT_LOOP_WAKE_INSTANCE_WATCHDOG {\"prompt\":\"Code idle ${IDLE}s (>=${IDLE_SEC}s) with ${UNHEALTHY} unhealthy window instance(s). Run rearm_all_instances.sh --force and report cwin status.\",\"action\":\"rearm_all\"}"
    bash "${SCRIPTS}/rearm_all_instances.sh" "$ROOT" --force || true
  else
    echo "AGENT_LOOP_WAKE_INSTANCE_WATCHDOG {\"prompt\":\"Watchdog tick: idle=${IDLE}s unhealthy=${UNHEALTHY}. Check window instances; rearm if idle>=${IDLE_SEC}s and not ARMED.\",\"action\":\"check\"}"
  fi
done
