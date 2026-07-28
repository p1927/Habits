#!/usr/bin/env bash
# Single dev entry: Vite HMR (:5174) + API auto-reload (:8787, proxied — one browser URL).
#
#   bash scripts/dev.sh           # foreground (Ctrl+C stops both)
#   bash scripts/dev.sh --detach  # background — survives terminal close
#   bash scripts/dev.sh --stop    # stop detached/foreground processes on :5174 / :8787
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PWA_PORT=5174
API_PORT=8787
PID_DIR="$ROOT/.habits"
LOG_DIR="$PID_DIR/dev-logs"
API_PID_FILE="$PID_DIR/dev-api.pid"
PWA_PID_FILE="$PID_DIR/dev-pwa.pid"

stop_port() {
  local port=$1
  local pids
  pids="$(lsof -ti :"$port" 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "Stopping :$port (pid $pids)"
    kill $pids 2>/dev/null || true
    sleep 0.3
  fi
}

stop_pidfile() {
  local file=$1
  if [[ -f "$file" ]]; then
    local pid
    pid="$(cat "$file" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
    rm -f "$file"
  fi
}

stop_all() {
  stop_port 4173
  stop_port "$PWA_PORT"
  stop_port "$API_PORT"
  stop_pidfile "$API_PID_FILE"
  stop_pidfile "$PWA_PID_FILE"
}

wait_for_url() {
  local url=$1
  local label=$2
  local i
  for i in $(seq 1 30); do
    if curl -sf -o /dev/null "$url" 2>/dev/null; then
      return 0
    fi
    sleep 0.5
  done
  echo "ERROR: $label did not become ready — check $LOG_DIR" >&2
  return 1
}

start_api() {
  cd "$ROOT/server"
  # shellcheck disable=SC1091
  source .venv/bin/activate
  uvicorn habits_api.main:create_app --factory --host 127.0.0.1 --port "$API_PORT" --reload &
}

start_pwa() {
  cd "$ROOT/pwa"
  npm run dev &
}

if [[ "${1:-}" == "--stop" ]]; then
  stop_all
  echo "Habits dev stopped."
  exit 0
fi

if [[ "${1:-}" == "--detach" ]]; then
  mkdir -p "$LOG_DIR"
  stop_all
  cd "$ROOT/server"
  nohup .venv/bin/uvicorn habits_api.main:create_app --factory --host 127.0.0.1 --port "$API_PORT" --reload \
    >"$LOG_DIR/api.log" 2>&1 &
  echo $! >"$API_PID_FILE"
  cd "$ROOT/pwa"
  nohup ./node_modules/.bin/vite >"$LOG_DIR/pwa.log" 2>&1 &
  echo $! >"$PWA_PID_FILE"
  wait_for_url "http://127.0.0.1:${API_PORT}/healthz" "API"
  wait_for_url "http://127.0.0.1:${PWA_PORT}/Habits/" "PWA"
  echo ""
  echo "Habits dev (detached) → http://localhost:${PWA_PORT}/Habits/"
  echo "  Logs: $LOG_DIR/"
  echo "  Stop: bash scripts/dev.sh --stop"
  exit 0
fi

stop_all

start_api
API_PID=$!

start_pwa
VITE_PID=$!

cleanup() {
  kill "$API_PID" "$VITE_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo ""
echo "Habits dev → http://localhost:${PWA_PORT}/Habits/"
echo "  UI: Vite HMR on :${PWA_PORT}"
echo "  API: uvicorn --reload on :${API_PORT} (proxied via Vite — no second browser port)"
echo ""

wait
