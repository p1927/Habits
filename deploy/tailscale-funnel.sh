#!/usr/bin/env bash
# Expose habits-api (8787) and LiveKit (7880) via Tailscale Funnel.
# Voice UI is embedded in the PWA via LiveKit SDK — no :8080 iframe needed.
set -euo pipefail

API_PORT="${HABITS_PORT:-8787}"
LK_PORT="${LIVEKIT_PORT:-7880}"

echo "Starting Tailscale Funnel for habits-api on port ${API_PORT}..."
tailscale funnel --bg "${API_PORT}"
echo ""
echo "Starting Tailscale Funnel for LiveKit on port ${LK_PORT}..."
tailscale funnel --bg "${LK_PORT}"
echo ""
tailscale funnel status
echo ""
echo "Update .env with your funnel URLs:"
echo "  HABITS_PUBLIC_URL=https://<machine>.<tailnet>.ts.net"
echo "  GOOGLE_REDIRECT_URI=https://<machine>.<tailnet>.ts.net/auth/callback"
echo "  LIVEKIT_URL=wss://<machine>.<tailnet>.ts.net:${LK_PORT}"
echo ""
echo "Set GitHub repo secret:"
echo "  VITE_HABITS_API_URL=https://<machine>.<tailnet>.ts.net"
