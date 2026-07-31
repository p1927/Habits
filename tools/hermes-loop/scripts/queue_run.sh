#!/usr/bin/env bash
# queue_run.sh — the single back-to-back dispatcher for all Hermes Loop
# workers. Invoked every 1m by `hermes cron tick`.
set -u
REPO="${REPO_ROOT:-$(cd "$(dirname "$0")/../../.." && pwd)}"
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

if [[ -f "$PAUSE_FILE" ]]; then
  log "PAUSED: $PAUSE_FILE exists; skipping dispatch"
  exit 0
fi

max_runtime=1200
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

touch "$BUSY_FILE"
log "DISPATCH: counter=${counter} idx=${idx} worker=${worker} max_runtime=${max_runtime}s"
cd "$REPO"
export PYTHONPATH="$REPO/tools/hermes-loop"

timeout=$(( max_runtime + 60 ))
"$HERMES_LOOP_BIN" -m hermes_loop tick "$worker" >> "$LOG_FILE" 2>&1
rc=$?
rm -f "$BUSY_FILE"

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
