#!/usr/bin/env bash
# Segment: ritual step line + advance
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPTS="${ROOT}/scripts"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
export PYTHONPATH="${SCRIPTS}:${PYTHONPATH:-}"

cat > "${TMP}/STATE.md" <<'EOF'
## LAST_REVIEW
| reviewed_at | git_head | notes |
| — | — | orient ok |

## CHECKPOINT
| field | value |
| ritual_step | `3.3-worktree` |
| phase | `3-select` |
| current_item_id | relay-1 |
| worktree_status | none |
| brainstorm_done | yes |

## BACKLOG
| id | priority | status | acceptance_criteria | notes |
| relay-1 | P0 | open | ship | test |
EOF

# Cannot advance 3.3 -> 4 without worktree
if bash "${SCRIPTS}/advance_ritual_step.sh" "$TMP" \
  --state-file STATE.md --loop-id worker-relay --apply 2>/dev/null; then
  echo "FAIL: should block advance without worktree"
  exit 1
fi
echo "OK advance blocked without worktree"

# Skip 3.3 -> 4 should fail in step gate
if python3 "${SCRIPTS}/validate_ritual_gate.py" \
  --project "$TMP" --loop-id worker-relay --state-file STATE.md \
  --mode step --from-step 3.2-brainstorm --to-step 4-execute 2>/dev/null; then
  echo "FAIL: step gate should block skip 3.3"
  exit 1
fi
echo "OK step gate blocks skip"

# Linear next step ok when 3.2 exit satisfied
python3 "${SCRIPTS}/validate_ritual_gate.py" \
  --project "$TMP" --loop-id worker-relay --state-file STATE.md \
  --mode step --from-step 3.2-brainstorm --to-step 3.3-worktree
echo "OK step gate allows 3.2 -> 3.3"

echo "OK ritual step segment"
