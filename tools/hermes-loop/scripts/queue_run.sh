#!/usr/bin/env bash
# queue_run.sh — the single back-to-back dispatcher for all Hermes Loop
# workers. Invoked every 1m by `hermes cron tick` (or `cron run
# hermes-loop.queue`).
#
# Reads rotation order from tools/hermes-loop/queue.yaml. Skips when:
#   * tools/hermes-loop/state/PAUSE exists (manual pause)
#   * a tick is already running (BUSY file fresh) — unless the previous
#     tick exceeded `max_runtime_seconds`, in which case the BUSY file is
#     stale and we take over.
#
# Picks the next worker from the rotation counter stored in
# tools/hermes-loop/state/queue.json. Calls `hermes_loop tick <worker>`
# and waits for it. On exit, advances the counter.
#
# Stdlib only.

set -u
REPO="${REPO_ROOT:-/Users/pratyushmishra/Documents/GitHub/Habits}"
HERMES_LOOP_BIN="${HERMES_LOOP_BIN:-/Users/pratyushmishra/Documents/GitHub/Habits/server/.venv/bin/python}"
QUEUE_YAML="$REPO/tools/hermes-loop/queue.yaml"
PAUSE_FILE="$REPO/tools/hermes-loop/state/PAUSE"
BUSY_FILE="$REPO/tools/hermes-loop/state/BUSY"
QUEUE_STATE="$REPO/tools/hermes-loop/state/queue.json"
ROTATION_FILE="$REPO/tools/hermes-loop/state/.rotation.tmp"
LOG_FILE="$REPO/tools/hermes-loop/logs/queue.log"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
  printf "[%s] %s\n" "$(date +%Y-%m-%dT%H:%M:%S%z)" "$*" >> "$LOG_FILE"
}

# 1. Pause gate
if [[ -f "$PAUSE_FILE" ]]; then
  log "PAUSED: $PAUSE_FILE exists; skipping dispatch"
  exit 0
fi

# 2. Stale-busy recovery: if BUSY file's mtime is older than
#    max_runtime_seconds, assume the previous tick crashed.
max_runtime=1200  # default; overridden from YAML below
if [[ -f "$QUEUE_YAML" ]]; then
  max_runtime=$(grep -E '"max_runtime_seconds"[[:space:]]*:' "$QUEUE_YAML" \
    | sed -E 's/.*:[[:space:]]*([0-9]+).*/\1/')
fi
if [[ -f "$BUSY_FILE" ]]; then
  busy_age=$(( $(date +%s) - $(stat -f%m "$BUSY_FILE") ))
  if (( busy_age < max_runtime )); then
    log "BUSY: previous tick still running (age=${busy_age}s); skipping"
    exit 0
  fi
  log "BUSY: previous tick exceeded ${max_runtime}s; taking over"
  rm -f "$BUSY_FILE"
fi

# 3. Read rotation list via python (the venv has it).
: > "$ROTATION_FILE"
"$HERMES_LOOP_BIN" - "$QUEUE_YAML" >> "$ROTATION_FILE" <<'PY'
import json
import sys
cfg = json.load(open(sys.argv[1]))
for w in cfg["rotation"]:
    print(w)
PY

if [[ ! -s "$ROTATION_FILE" ]]; then
  log "ERROR: empty rotation list from $QUEUE_YAML"
  exit 1
fi

n=$(wc -l < "$ROTATION_FILE" | tr -d ' ')
counter=0
if [[ -f "$QUEUE_STATE" ]]; then
  counter=$(grep -oE '"counter"[[:space:]]*:[[:space:]]*[0-9]+' "$QUEUE_STATE" \
    | grep -oE '[0-9]+$' || echo 0)
fi
idx=$(( counter % n ))
worker=$(sed -n "$((idx + 1))p" "$ROTATION_FILE")
rm -f "$ROTATION_FILE"

# 4. Run the tick (with the configured max_runtime + 60s safety margin)
touch "$BUSY_FILE"
log "DISPATCH: counter=${counter} idx=${idx} worker=${worker} max_runtime=${max_runtime}s"
cd "$REPO"
export PYTHONPATH="$REPO/tools/hermes-loop"

# Enforce timeout via `gtimeout` (macOS coreutils, if installed) or fallback
# to `perl` alarm. We don't background — cron tick waits on us anyway.
timeout=$(( max_runtime + 60 ))
if command -v gtimeout >/dev/null 2>&1; then
  gtimeout "$timeout" "$HERMES_LOOP_BIN" -m hermes_loop tick "$worker" >> "$LOG_FILE" 2>&1
  rc=$?
elif command -v timeout >/dev/null 2>&1; then
  timeout "$timeout" "$HERMES_LOOP_BIN" -m hermes_loop tick "$worker" >> "$LOG_FILE" 2>&1
  rc=$?
else
  # No external timeout(1); the inner hermes_loop tick has its own
  # 900s cap and the agent must respect max_runtime in queue.yaml.
  "$HERMES_LOOP_BIN" -m hermes_loop tick "$worker" >> "$LOG_FILE" 2>&1
  rc=$?
fi
rm -f "$BUSY_FILE"

# 5. Advance counter atomically
next_counter=$(( counter + 1 ))
mkdir -p "$(dirname "$QUEUE_STATE")"
cat > "$QUEUE_STATE" <<EOF
{
  "counter": ${next_counter},
  "last_worker": "${worker}",
  "last_returncode": ${rc},
  "last_dispatched_at": "$(date +%Y-%m-%dT%H:%M:%S%z)"
}
EOF
log "DONE: worker=${worker} returncode=${rc} next_counter=${next_counter}"

exit 0
