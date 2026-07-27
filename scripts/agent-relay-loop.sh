#!/usr/bin/env bash
# Persistent relay wake loop — re-arms automatically (never one-shot).
# Primary cadence: 1 minute. Triggers full Review → Brainstorm → Execute ritual.
#
# NOTE: Start in the Habits chat window terminal only. Uses a PID file so other
# windows/agents do not spawn duplicates. Monitor ^AGENT_LOOP_TICK_HABITS.
set -euo pipefail

INTERVAL="${RELAY_LOOP_INTERVAL_SEC:-60}"
PROMPT='Run relay ritual: Review RELAY+git, Brainstorm backlog, Execute next item, Verify, Commit, Update RELAY. Do not ask user.'
PIDFILE="${RELAY_LOOP_PIDFILE:-${TMPDIR:-/tmp}/habits-relay-loop.pid}"

if [[ -f "$PIDFILE" ]]; then
  old_pid="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [[ -n "$old_pid" ]] && kill -0 "$old_pid" 2>/dev/null; then
    echo "AGENT_RELAY_LOOP_ALREADY_RUNNING pid=${old_pid} interval=${INTERVAL}s"
    exit 0
  fi
  rm -f "$PIDFILE"
fi

echo "$$" > "$PIDFILE"
trap 'rm -f "$PIDFILE"' EXIT INT TERM

echo "AGENT_RELAY_LOOP_STARTED interval=${INTERVAL}s sentinel=AGENT_LOOP_TICK_HABITS pid=$$"

while true; do
  sleep "$INTERVAL"
  echo "AGENT_LOOP_TICK_HABITS {\"prompt\":\"${PROMPT}\"}"
done
