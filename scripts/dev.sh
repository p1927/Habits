#!/usr/bin/env bash
# Single dev entry: Vite HMR (:5174) + API auto-reload (:8787, proxied — one browser URL).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PWA_PORT=5174
API_PORT=8787

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

# One frontend URL only — no parallel vite preview on :4173
stop_port 4173
stop_port "$PWA_PORT"
stop_port "$API_PORT"

cd "$ROOT/server"
source .venv/bin/activate
uvicorn habits_api.main:create_app --factory --host 0.0.0.0 --port "$API_PORT" --reload &
API_PID=$!

cd "$ROOT/pwa"
npm run dev &
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
