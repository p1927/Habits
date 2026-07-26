#!/usr/bin/env bash
# Fallback heartbeat if agent goes idle — 5 minutes.

set -euo pipefail

INTERVAL="${RELAY_FALLBACK_INTERVAL_SEC:-300}"
PROMPT='Run relay ritual: Review RELAY+git, Brainstorm backlog, Execute next item, Verify, Commit, Update RELAY. Idle fallback wake. Do not ask user.'

echo "AGENT_RELAY_FALLBACK_STARTED interval=${INTERVAL}s"

while true; do
  sleep "$INTERVAL"
  echo "AGENT_LOOP_WAKE_HABITS {\"prompt\":\"${PROMPT}\"}"
done
