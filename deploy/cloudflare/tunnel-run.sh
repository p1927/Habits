#!/usr/bin/env bash
# Run the Habits Cloudflare tunnel (API -> local habits-api).
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

: "${CLOUDFLARE_API_TOKEN:?Missing CLOUDFLARE_API_TOKEN}"
: "${CLOUDFLARE_ACCOUNT_ID:?Missing CLOUDFLARE_ACCOUNT_ID}"

HABITS_CF_TUNNEL_NAME="${HABITS_CF_TUNNEL_NAME:-habits-mac}"

if [[ ! -f "$STATE_FILE" ]]; then
  echo "Missing $STATE_FILE — run deploy/cloudflare/setup.sh first." >&2
  exit 1
fi

TUNNEL_ID="$(python3 -c 'import json; print(json.load(open("'"$STATE_FILE"'"))["tunnel_id"])')"
export TUNNEL_ID

echo "Running tunnel ${HABITS_CF_TUNNEL_NAME} (${TUNNEL_ID}) -> http://127.0.0.1:${HABITS_PORT:-8787}"
# VPNs often block QUIC; HTTP/2 works more reliably (same as Tailscale workaround).
exec cloudflared tunnel --no-autoupdate --protocol http2 run --token "$(python3 - <<'PY'
import json, os, sys, urllib.request

account_id = os.environ["CLOUDFLARE_ACCOUNT_ID"]
token = os.environ["CLOUDFLARE_API_TOKEN"]
tunnel_id = os.environ["TUNNEL_ID"]

req = urllib.request.Request(
    f"https://api.cloudflare.com/client/v4/accounts/{account_id}/cfd_tunnel/{tunnel_id}/token",
    headers={"Authorization": f"Bearer {token}"},
    method="GET",
)
with urllib.request.urlopen(req, timeout=30) as resp:
    body = json.loads(resp.read().decode("utf-8"))
if not body.get("success"):
    raise SystemExit(body)
print(body["result"])
PY
)"
