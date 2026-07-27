#!/usr/bin/env bash
# Provision Cloudflare Tunnel + Access + Pages for Habits (FreeDNS-friendly).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CF_DIR="$(cd "$(dirname "$0")" && pwd)"
LINKEDIN_ENV="$ROOT/../LinkedInPost/.env"
LOCAL_ENV="$CF_DIR/.env"
STATE_FILE="$CF_DIR/.provision-state.json"

load_env_file() {
  while IFS= read -r line; do
    eval "$line"
  done < <(python3 "$CF_DIR/load_env.py" "$@")
}

load_env_file "$LINKEDIN_ENV" "$LOCAL_ENV"

: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN in deploy/cloudflare/.env or ../LinkedInPost/.env}"
: "${CLOUDFLARE_ACCOUNT_ID:?Set CLOUDFLARE_ACCOUNT_ID}"
: "${HABITS_CF_APP_HOST:?Set HABITS_CF_APP_HOST in deploy/cloudflare/.env}"
: "${HABITS_CF_API_HOST:?Set HABITS_CF_API_HOST in deploy/cloudflare/.env}"
: "${HABITS_CF_ALLOWED_EMAIL:?Set HABITS_CF_ALLOWED_EMAIL}"

HABITS_CF_TUNNEL_NAME="${HABITS_CF_TUNNEL_NAME:-habits-mac}"
HABITS_CF_PAGES_PROJECT="${HABITS_CF_PAGES_PROJECT:-habits-pwa}"
HABITS_PORT="${HABITS_PORT:-8787}"

export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID STATE_FILE
export HABITS_CF_TUNNEL_NAME HABITS_CF_PAGES_PROJECT HABITS_PORT
export HABITS_CF_APP_HOST HABITS_CF_API_HOST HABITS_CF_ALLOWED_EMAIL

chmod +x "$CF_DIR/provision.py" "$CF_DIR/tunnel-run.sh" "$CF_DIR/check-auth.sh" 2>/dev/null || true

echo "==> Checking Cloudflare credentials"
bash "$CF_DIR/check-auth.sh"

echo "==> Cloudflare provision (tunnel + access + pages domain)"
python3 "$CF_DIR/provision.py"

echo "==> Building PWA"
(
  cd "$ROOT/pwa"
  npm ci
  VITE_BASE_PATH="/" \
  VITE_HABITS_API_URL="https://${HABITS_CF_API_HOST}" \
  VITE_VOICE_UI_URL="${VITE_VOICE_UI_URL:-}" \
  npm run build
)

echo "==> Deploying PWA to Cloudflare Pages (${HABITS_CF_PAGES_PROJECT})"
CLOUDFLARE_ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID" CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" \
  npx --yes wrangler@4 pages deploy "$ROOT/pwa/dist" \
    --project-name "$HABITS_CF_PAGES_PROJECT" \
    --branch main \
    --commit-dirty=true

TUNNEL_CNAME="$(python3 -c 'import json; print(json.load(open("'"$STATE_FILE"'"))["tunnel_cname"])')"

cat <<EOF

================================================================================
Done — manual steps
================================================================================

1) FreeDNS CNAME for API:
   ${HABITS_CF_API_HOST}  ->  ${TUNNEL_CNAME}

2) FreeDNS CNAME for PWA (target from Cloudflare Pages -> ${HABITS_CF_PAGES_PROJECT} -> Custom domains):
   ${HABITS_CF_APP_HOST}  ->  <pages CNAME from dashboard>

3) Run tunnel (keep terminal open):
   bash ${CF_DIR}/tunnel-run.sh

4) Run habits-api on port ${HABITS_PORT}.

5) Update ${ROOT}/.env:
   HABITS_PUBLIC_URL=https://${HABITS_CF_API_HOST}
   HABITS_PWA_URL=https://${HABITS_CF_APP_HOST}/
   GOOGLE_REDIRECT_URI=https://${HABITS_CF_API_HOST}/auth/callback
   HABITS_CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,https://${HABITS_CF_APP_HOST}

6) Google OAuth console:
   JS origin: https://${HABITS_CF_APP_HOST}
   Redirect:  https://${HABITS_CF_API_HOST}/auth/callback

7) Visit https://${HABITS_CF_APP_HOST} — Cloudflare Access email for ${HABITS_CF_ALLOWED_EMAIL}
   Then issue a bearer (POST /api/issue) and save in Settings.

State: ${STATE_FILE}
================================================================================
EOF
