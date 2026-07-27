#!/usr/bin/env bash
set -euo pipefail

CF_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$CF_DIR/../.." && pwd)"
LINKEDIN_ENV="$ROOT/../LinkedInPost/.env"
LOCAL_ENV="$CF_DIR/.env"

while IFS= read -r line; do eval "$line"; done < <(
  python3 "$CF_DIR/load_env.py" "$LINKEDIN_ENV" "$LOCAL_ENV"
)

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "CLOUDFLARE_API_TOKEN is missing." >&2
  exit 1
fi

code="$(curl -sS -o /tmp/cf-verify.json -w "%{http_code}" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}")"

if [[ "$code" != "200" ]]; then
  echo "Cloudflare API token is invalid (HTTP ${code})." >&2
  echo "Create a new token at:" >&2
  echo "  https://dash.cloudflare.com/profile/api-tokens" >&2
  echo "Required permissions (Account scope):" >&2
  echo "  - Cloudflare Tunnel: Edit" >&2
  echo "  - Access: Apps and Policies: Edit" >&2
  echo "  - Cloudflare Pages: Edit" >&2
  echo "  - Account Settings: Read" >&2
  echo "" >&2
  echo "Update CLOUDFLARE_API_TOKEN in ../LinkedInPost/.env or deploy/cloudflare/.env" >&2
  echo "Or run: npx wrangler login" >&2
  cat /tmp/cf-verify.json >&2 2>/dev/null || true
  exit 1
fi

echo "Cloudflare token OK (account ${CLOUDFLARE_ACCOUNT_ID:-unknown})"
