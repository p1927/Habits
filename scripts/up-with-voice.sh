#!/usr/bin/env bash
# Start Habits API + full local-voice-ai stack (Whisper, Kokoro, LiveKit, Habits agent).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d ../local-voice-ai/inference/kokoro ]]; then
  echo "Error: ../local-voice-ai not found. Clone local-voice-ai next to Habits:"
  echo "  git clone <local-voice-ai-url> ../local-voice-ai"
  exit 1
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example — fill MINIMAX_API_KEY and Google OAuth"
fi

echo "Starting Habits + local-voice-ai stack..."
docker compose -f docker-compose.voice.yml up --build -d

ADMIN="${HABITS_ADMIN_SECRET:-change-me-admin-secret}"
API="http://localhost:${HABITS_PORT:-8787}"

echo ""
echo "habits-api:  ${API}/healthz"
echo "LiveKit:     ws://localhost:7880"
echo ""
echo "Issue PWA bearer:"
echo "  curl -X POST ${API}/api/issue -H 'X-Admin-Token: ${ADMIN}' -H 'Content-Type: application/json' -d '{\"device_id\":\"phone\",\"label\":\"PWA\"}'"
echo ""
echo "Issue voice-agent bearer (set HABITS_INTERNAL_BEARER in .env):"
echo "  curl -X POST ${API}/api/issue -H 'X-Admin-Token: ${ADMIN}' -H 'Content-Type: application/json' -d '{\"device_id\":\"livekit-agent\",\"label\":\"Voice agent\"}'"
echo ""
echo "Optional Tailscale Funnel: ./deploy/tailscale-funnel.sh"
