#!/usr/bin/env bash
# Persistent relay wake loop — re-arms automatically (never one-shot).
# Primary cadence: 1 minute. Triggers full Review → Brainstorm → Execute ritual.

set -euo pipefail

INTERVAL="${RELAY_LOOP_INTERVAL_SEC:-60}"
PROMPT='Run relay ritual: Review RELAY+git, Brainstorm backlog, Execute next item, Verify, Commit, Update RELAY. Do not ask user.'

echo "AGENT_RELAY_LOOP_STARTED interval=${INTERVAL}s"

while true; do
  sleep "$INTERVAL"
  echo "AGENT_LOOP_WAKE_HABITS {\"prompt\":\"${PROMPT}\"}"
done
