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

# Infrastructure: tools/cursor-loop/ is always blocked
if python3 "${SCRIPTS}/guard_edit_scope.py" \
  --project "$GIT_TMP" \
  --file "tools/cursor-loop/scripts/guard_edit_scope.py" \
  --loop-id worker-relay \
  --state-file docs/window-instances/worker-relay/STATE.md 2>/dev/null; then
  echo "FAIL: guard should block tools/cursor-loop edits"
  exit 1
fi
echo "OK guard blocks tools/cursor-loop edit"

# Infrastructure: window-instance definition files are always blocked
if python3 "${SCRIPTS}/guard_edit_scope.py" \
  --project "$GIT_TMP" \
  --file "docs/window-instances/worker-relay/IDENTITY.md" \
  --loop-id worker-relay \
  --state-file docs/window-instances/worker-relay/STATE.md 2>/dev/null; then
  echo "FAIL: guard should block IDENTITY.md edit"
  exit 1
fi
echo "OK guard blocks IDENTITY.md edit"

if python3 "${SCRIPTS}/guard_edit_scope.py" \
  --project "$GIT_TMP" \
  --file "docs/window-instances/worker-relay/INSTANCE.md" \
  --loop-id worker-relay \
  --state-file docs/window-instances/worker-relay/STATE.md 2>/dev/null; then
  echo "FAIL: guard should block INSTANCE.md edit"
  exit 1
fi
echo "OK guard blocks INSTANCE.md edit"

if python3 "${SCRIPTS}/guard_edit_scope.py" \
  --project "$GIT_TMP" \
  --file "docs/window-instances/instances.manifest.json" \
  --loop-id worker-relay \
  --state-file docs/window-instances/worker-relay/STATE.md 2>/dev/null; then
  echo "FAIL: guard should block instances.manifest.json edit"
  exit 1
fi
echo "OK guard blocks instances.manifest.json edit"

# STATE.hot.json and STATE.coord are runtime data — must remain writable
if python3 "${SCRIPTS}/guard_edit_scope.py" \
  --project "$GIT_TMP" \
  --file docs/window-instances/worker-relay/STATE.hot.json \
  --loop-id worker-relay \
  --state-file docs/window-instances/worker-relay/STATE.md; then
  echo "OK guard allows STATE.hot.json edit"
else
  echo "FAIL: guard should allow STATE.hot.json edit"
  exit 1
fi

echo "OK guard edit scope segment"
