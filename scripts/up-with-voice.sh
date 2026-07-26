#!/usr/bin/env bash
# Start local-voice-ai Docker stack + Habits API.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LVA="${LOCAL_VOICE_AI_DIR:-$ROOT/../local-voice-ai}"
cd "$ROOT"

if [[ ! -f "$LVA/docker-compose.yml" ]]; then
  echo "Error: local-voice-ai not found at $LVA"
  echo "Clone it next to Habits or set LOCAL_VOICE_AI_DIR"
  exit 1
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

echo "Starting local-voice-ai (LiveKit, STT, Kokoro TTS, Habits agent, frontend :8080)..."
(cd "$LVA" && docker compose up --build -d)

echo "Starting habits-api..."
docker compose up --build -d habits-api

ADMIN="${HABITS_ADMIN_SECRET:-change-me-admin-secret}"
API="http://localhost:${HABITS_PORT:-8787}"
VOICE_PORT="${WEB_PORT:-8080}"

echo ""
echo "Voice UI:    http://localhost:${VOICE_PORT}  (embedded in Habits Agent tab)"
echo "habits-api:  ${API}/healthz"
echo "LiveKit:     ws://localhost:7880"
echo ""
echo "Configure ../local-voice-ai/.env:"
echo "  AGENT_PROFILE=habits"
echo "  HABITS_API_URL=http://host.docker.internal:8787"
echo "  HABITS_INTERNAL_BEARER=<same bearer as PWA Settings>"
echo ""
echo "Issue PWA bearer:"
echo "  curl -X POST ${API}/api/issue -H 'X-Admin-Token: ${ADMIN}' -H 'Content-Type: application/json' -d '{\"device_id\":\"phone\",\"label\":\"PWA\"}'"
