#!/usr/bin/env bash
# loop.sh — keep ticking workers back-to-back forever.
#
# Used two ways:
#   1. `hermes_loop run` (foreground) — blocks forever, ticks every interval.
#   2. `hermes_loop tick-loop` (cron) — runs ONCE, then exits. The cron daemon
#      fires this every 1 minute; this script self-replicates by backgrounding
#      itself into a singleton (heartbeat via RUNNING_FILE) and exits the
#      foreground cron tick immediately.
#
# State:
#   * tools/hermes-loop/state/RUNNING    pid file when the long-running loop is alive
#   * tools/hermes-loop/state/PAUSE     sentinel to pause dispatching
#   * tools/hermes-loop/state/BUSY      set by tick_one.sh while a tick is in flight
#
# Loop:
#   while not paused and rotation not empty:
#     if a tick is currently in flight (BUSY younger than 90 min): sleep 30s
#     else: tick_one.sh
#     sleep interval
#
# Interval defaults to 5 seconds when run in foreground, 60 seconds when run
# from cron (so cron ticks and this loop don't double-fire).

set -u
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/../../.." && pwd)"
TICK_ONE="$SCRIPT_DIR/tick_one.sh"
RUNNING_FILE="$REPO/tools/hermes-loop/state/RUNNING"

mkdir -p "$REPO/tools/hermes-loop/state"

# If we're already the long-running loop, no-op (the cron tick just kicked us).
if [[ -f "$RUNNING_FILE" ]]; then
  pid=$(cat "$RUNNING_FILE" 2>/dev/null || echo 0)
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    # The long-running loop is alive. Cron tick should exit immediately.
    exit 0
  fi
  rm -f "$RUNNING_FILE"
fi

# We are NOT already running. Take the singleton lock.
# Try to write our pid to RUNNING_FILE atomically.
echo $$ > "$RUNNING_FILE.tmp"
if ! mv "$RUNNING_FILE.tmp" "$RUNNING_FILE" 2>/dev/null; then
  # Someone else just won the race.
  rm -f "$RUNNING_FILE.tmp"
  exit 0
fi

# Cleanup on exit.
cleanup() { rm -f "$RUNNING_FILE"; }
trap cleanup EXIT INT TERM

# Mode: foreground (continuous loop) or cron tick (just one tick + check).
MODE="${1:-foreground}"

if [[ "$MODE" == "once" ]]; then
  # Cron tick mode: a single tick, then exit (cron re-fires).
  "$TICK_ONE" || true
  exit 0
fi

# Foreground continuous mode.
INTERVAL="${HERMES_LOOP_INTERVAL:-30}"
echo "[hermes-loop] loop.sh starting pid=$$ interval=${INTERVAL}s repo=$REPO"

while true; do
  PAUSE_FILE="$REPO/tools/hermes-loop/state/PAUSE"
  if [[ -f "$PAUSE_FILE" ]]; then
    sleep "$INTERVAL"
    continue
  fi
  BUSY_FILE="$REPO/tools/hermes-loop/state/BUSY"
  # If BUSY is fresh (set within last 90 min by a still-running tick), wait.
  if [[ -f "$BUSY_FILE" ]]; then
    age=$(( $(date +%s) - $(stat -f%m "$BUSY_FILE") ))
    if (( age < 5400 )); then
      sleep "$INTERVAL"
      continue
    fi
    # Stale — the previous tick crashed. Take over.
    rm -f "$BUSY_FILE"
  fi
  "$TICK_ONE" || true
  sleep "$INTERVAL"
done
