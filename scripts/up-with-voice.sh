#!/usr/bin/env bash
# Start local-voice-ai agent worker (LiveKit STT/TTS) + Habits API.
# Voice UI is embedded in the Habits PWA via LiveKit SDK — no :8080 iframe needed.
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

echo "Starting local-voice-ai (LiveKit, STT, Kokoro TTS, Habits agent worker)..."
(cd "$LVA" && docker compose up --build -d)

echo "Starting habits-api..."
docker compose up --build -d habits-api

ADMIN="${HABITS_ADMIN_SECRET:-change-me-admin-secret}"
API="http://localhost:${HABITS_PORT:-8787}"
LK_PORT="${LIVEKIT_PORT:-7880}"

echo ""
echo "habits-api:  ${API}/healthz"
echo "LiveKit:     ws://localhost:${LK_PORT}  (PWA connects via embedded SDK)"
echo ""
echo "Configure ../local-voice-ai/.env:"
echo "  AGENT_PROFILE=habits"
echo "  HABITS_API_URL=http://host.docker.internal:8787"
echo "  HABITS_INTERNAL_BEARER=<same bearer as PWA Settings>"
echo ""
echo "Configure Habits .env:"
echo "  LIVEKIT_URL=ws://localhost:${LK_PORT}"
echo "  LIVEKIT_API_KEY=devkey"
echo "  LIVEKIT_API_SECRET=secret"
echo ""
echo "Issue PWA bearer:"
echo "  curl -X POST ${API}/api/issue -H 'X-Admin-Token: ${ADMIN}' -H 'Content-Type: application/json' -d '{\"device_id\":\"phone\",\"label\":\"PWA\"}'"
