#!/usr/bin/env bash
# Segment: prep scripts emit AGENT_INSTRUCTION
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPTS="${ROOT}/scripts"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
export PYTHONPATH="${SCRIPTS}:${PYTHONPATH:-}"

cat > "${TMP}/STATE.md" <<'EOF'
## CHECKPOINT
| field | value |
| current_item_id | relay-1 |
| worktree_status | none |
| brainstorm_done | no |
EOF

OUT="$(bash "${SCRIPTS}/prepare_brainstorm_tick.sh" "$TMP" \
  --state-file STATE.md --loop-id worker-relay 2>&1 || true)"
echo "$OUT" | grep -q "AGENT_INSTRUCTION=" || {
  echo "FAIL: prepare_brainstorm missing AGENT_INSTRUCTION"
  exit 1
}
echo "$OUT" | grep -q "RITUAL_OK=no" || {
  echo "FAIL: prepare_brainstorm should block until --apply"
  exit 1
}
echo "OK prepare_brainstorm emits directive"

OUT2="$(bash "${SCRIPTS}/prepare_select_tick.sh" "$TMP" \
  --state-file STATE.md --loop-id worker-relay 2>&1 || true)"
echo "$OUT2" | grep -q "AGENT_INSTRUCTION=" || {
  echo "FAIL: prepare_select missing AGENT_INSTRUCTION"
  exit 1
}
echo "$OUT2" | grep -q "PHASE_4_BLOCKED=yes" || {
  echo "FAIL: prepare_select should block phase 4"
  exit 1
}
echo "OK prepare_select emits directive"

echo "OK ritual directive segment"
