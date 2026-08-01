#!/usr/bin/env bash
# tick_one.sh — run ONE Hermes Loop worker tick with full self-healing.
#
# Behavior:
#   * Reads rotation from queue.yaml; picks the next worker (counter atomically).
#   * If PAUSE sentinel exists -> exit 0 silently.
#   * Touches BUSY file before spawn, removes it in a trap on any exit path.
#   * Captures the LLM pid; if it's still alive after max_runtime+60s, kills it.
#   * Always advances the counter (even on timeout/crash), so the queue keeps moving.
#
# This is invoked by loop.sh, which is invoked by `hermes_loop tick-loop` or
# by the cron daemon. It can also be called directly.

set -u
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/../../.." && pwd)"

PYTHON="$REPO/server/.venv/bin/python"
# Allow override so dev environments work.
PYTHON="${HERMES_LOOP_PYTHON:-$PYTHON}"

CONFIG="$REPO/tools/hermes-loop/queue.yaml"
PAUSE_FILE="$REPO/tools/hermes-loop/state/PAUSE"
BUSY_FILE="$REPO/tools/hermes-loop/state/BUSY"
STATE_FILE="$REPO/tools/hermes-loop/state/queue.json"
LOG="$REPO/tools/hermes-loop/logs/loop.log"

mkdir -p "$(dirname "$LOG")" "$(dirname "$BUSY_FILE")" "$(dirname "$STATE_FILE")"

log() {
  printf "[%s] %s\n" "$(date +%Y-%m-%dT%H:%M:%S%z)" "$*" >> "$LOG"
}

cleanup() {
  rm -f "$BUSY_FILE" 2>/dev/null || true
}
trap cleanup EXIT

# 1. Pause gate
if [[ -f "$PAUSE_FILE" ]]; then
  log "PAUSED"
  exit 0
fi

# 2. Read rotation via python
ROTATION=$("$PYTHON" - "$CONFIG" <<'PY' 2>/dev/null
import json, sys
cfg = json.load(open(sys.argv[1]))
for w in cfg.get("rotation", []):
    print(w)
PY
)
if [[ -z "$ROTATION" ]]; then
  log "ERROR: rotation list is empty or could not parse $CONFIG"
  exit 1
fi

# 3. Counter + worker selection. Atomic-in-spirit: read+write under a lock file.
#    macOS lacks flock(1); use mkdir-as-lock (atomic on POSIX) + retry.
LOCK="$STATE_FILE.lock"
LOCKDIR="$STATE_FILE.lockdir"
if ! mkdir "$LOCKDIR" 2>/dev/null; then
  # Check if the lock is stale (older than 10 min — older than any realistic tick).
  if [[ -d "$LOCKDIR" ]]; then
    lock_age=$(( $(date +%s) - $(stat -f%m "$LOCKDIR") ))
    if (( lock_age < 600 )); then
      log "BUSY: another tick dispatcher holds the lock (age=${lock_age}s); skipping"
      exit 0
    fi
    rm -rf "$LOCKDIR"
    if ! mkdir "$LOCKDIR" 2>/dev/null; then
      log "BUSY: lock contention; skipping"
      exit 0
    fi
  fi
fi
cleanup_lock() { rm -rf "$LOCKDIR" 2>/dev/null || true; }
trap 'cleanup; cleanup_lock' EXIT
counter=0
if [[ -f "$STATE_FILE" ]]; then
  counter=$(grep -oE '"counter"[[:space:]]*:[[:space:]]*[0-9]+' "$STATE_FILE" \
    | grep -oE '[0-9]+$' || echo 0)
fi
n=$(printf '%s\n' "$ROTATION" | wc -l | tr -d ' ')
idx=$((counter % n))
worker=$(printf '%s\n' "$ROTATION" | sed -n "$((idx + 1))p")

# 4. Touch BUSY + run
touch "$BUSY_FILE"
log "DISPATCH counter=$counter idx=$idx worker=$worker"

cd "$REPO"
export PYTHONPATH="$REPO/tools/hermes-loop"

# 5. Run the tick. Don't trust the inner subprocess to clean up; capture rc.
rc=5
"$PYTHON" -m hermes_loop tick "$worker" </dev/null
rc=$?

# 6. Always advance counter + clear BUSY (trap handles BUSY on any exit)
next_counter=$((counter + 1))
cat > "$STATE_FILE" <<EOF
{
  "counter": ${next_counter},
  "last_worker": "${worker}",
  "last_returncode": ${rc},
  "last_dispatched_at": "$(date +%Y-%m-%dT%H:%M:%S%z)"
}
EOF
log "DONE worker=$worker rc=$rc next_counter=$next_counter"

exit 0
