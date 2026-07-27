#!/usr/bin/env bash
# Segment: advance_ritual_step --apply patches CHECKPOINT
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPTS="${ROOT}/scripts"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
export PYTHONPATH="${SCRIPTS}:${PYTHONPATH:-}"

cat > "${TMP}/STATE.md" <<'EOF'
## LAST_REVIEW
| reviewed_at | git_head | notes |
| — | — | ok |

## CHECKPOINT
| field | value |
| ritual_step | `1-wake` |
| phase | `1-wake` |
| brainstorm_done | no |
EOF

bash "${SCRIPTS}/advance_ritual_step.sh" "$TMP" \
  --state-file STATE.md --loop-id po-relay --apply

grep -q '`2-orient`' "${TMP}/STATE.md" || {
  echo "FAIL: advance should patch ritual_step to 2-orient"
  exit 1
}
echo "OK advance --apply patches CHECKPOINT"

echo "OK advance ritual step segment"
