#!/usr/bin/env bash
# Expose habits-api (8787), local-voice-ai UI (8080), and LiveKit (7880) via Tailscale Funnel.
set -euo pipefail

API_PORT="${HABITS_PORT:-8787}"
VOICE_UI_PORT="${VOICE_UI_PORT:-8080}"
LK_PORT="${LIVEKIT_PORT:-7880}"

echo "Starting Tailscale Funnel for habits-api on port ${API_PORT}..."
tailscale funnel --bg "${API_PORT}"
echo ""
echo "Starting Tailscale Funnel for local-voice-ai UI on port ${VOICE_UI_PORT}..."
tailscale funnel --bg "${VOICE_UI_PORT}"
echo ""
echo "Starting Tailscale Funnel for LiveKit on port ${LK_PORT}..."
tailscale funnel --bg "${LK_PORT}"
echo ""
tailscale funnel status
echo ""
echo "Update .env with your funnel URLs:"
echo "  HABITS_PUBLIC_URL=https://<machine>.<tailnet>.ts.net"
echo "  GOOGLE_REDIRECT_URI=https://<machine>.<tailnet>.ts.net/auth/callback"
echo ""
echo "In ../local-voice-ai/.env set:"
echo "  NEXT_PUBLIC_LIVEKIT_URL=wss://<machine>.<tailnet>.ts.net:${LK_PORT}"
echo ""
echo "Set GitHub repo secrets:"
echo "  VITE_HABITS_API_URL=https://<machine>.<tailnet>.ts.net"
echo "  VITE_VOICE_UI_URL=https://<machine>.<tailnet>.ts.net:${VOICE_UI_PORT}"
