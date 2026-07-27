#!/usr/bin/env bash
# Segment: validate_product_evidence.py
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPTS="${ROOT}/scripts"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

export PYTHONPATH="${SCRIPTS}:${PYTHONPATH:-}"

(
  cd "$TMP"
  git init -q
  git config user.email test@test.com
  git config user.name Test
  mkdir -p pwa docs/window-instances/worker-relay
  echo "x" > pwa/app.ts
  git add .
  git commit -q -m init
)

cat > "${TMP}/docs/window-instances/worker-relay/STATE.md" <<'EOF'
## CHECKPOINT
| Field | Value |
| worktree_status | none |
EOF

if python3 "${SCRIPTS}/validate_product_evidence.py" "$TMP" \
  --loop-id worker-relay \
  --state-file docs/window-instances/worker-relay/STATE.md \
  --evidence "phase 9-arm" 2>/dev/null; then
  echo "FAIL: should reject chore evidence"
  exit 1
fi
echo "OK rejects chore evidence"

if python3 "${SCRIPTS}/validate_product_evidence.py" "$TMP" \
  --loop-id worker-relay \
  --state-file docs/window-instances/worker-relay/STATE.md \
  --evidence "not-a-valid-id" 2>/dev/null; then
  echo "FAIL: should reject invalid backlog id"
  exit 1
fi
echo "OK rejects invalid backlog id"

echo "v2" >> "${TMP}/pwa/app.ts"
(
  cd "$TMP"
  git add pwa/app.ts
  git commit -q -m "feat: relay-999 test"
)

python3 "${SCRIPTS}/validate_product_evidence.py" "$TMP" \
  --loop-id worker-relay \
  --state-file docs/window-instances/worker-relay/STATE.md \
  --evidence "relay-999"
echo "OK accepts valid product evidence"

echo "OK product evidence segment"
