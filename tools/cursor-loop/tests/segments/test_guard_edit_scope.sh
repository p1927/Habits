#!/usr/bin/env bash
# Segment: guard_edit_scope blocks pwa edit on main without worktree
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPTS="${ROOT}/scripts"
GIT_TMP="$(mktemp -d)"
trap 'rm -rf "$GIT_TMP"' EXIT
export PYTHONPATH="${SCRIPTS}:${PYTHONPATH:-}"

(
  cd "$GIT_TMP"
  git init -q
  git config user.email test@test.com
  git config user.name Test
  mkdir -p docs/window-instances/worker-relay pwa
  echo "v1" > pwa/foo.ts
  git add .
  git commit -q -m init
)
cat > "${GIT_TMP}/docs/window-instances/worker-relay/STATE.md" <<'EOF'
## CHECKPOINT
| field | value |
| ritual_step | `3.3-worktree` |
| worktree_status | none |
| current_item_id | relay-1 |
| brainstorm_done | yes |
EOF

if python3 "${SCRIPTS}/guard_edit_scope.py" \
  --project "$GIT_TMP" \
  --file pwa/foo.ts \
  --loop-id worker-relay \
  --state-file docs/window-instances/worker-relay/STATE.md 2>/dev/null; then
  echo "FAIL: guard should block pwa edit without worktree"
  exit 1
fi
echo "OK guard blocks pwa edit on main"

if python3 "${SCRIPTS}/guard_edit_scope.py" \
  --project "$GIT_TMP" \
  --file docs/window-instances/worker-relay/STATE.md \
  --loop-id worker-relay \
  --state-file docs/window-instances/worker-relay/STATE.md; then
  echo "OK guard allows STATE.md edit"
else
  echo "FAIL: guard should allow STATE.md edit"
  exit 1
fi

echo "OK guard edit scope segment"
