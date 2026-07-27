#!/usr/bin/env bash
# Segment: Phase 6 requires Bugbot source in REVIEW_FINDINGS when files changed
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPTS="${ROOT}/scripts"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
export PYTHONPATH="${SCRIPTS}:${PYTHONPATH:-}"

cat > "${TMP}/STATE.md" <<'EOF'
## CHECKPOINT
| field | value |
| review_round | 2 |
| code_changed | yes |
| review_changed_files | pwa/src/foo.ts |
| review_status | pending |
## REVIEW_FINDINGS
| id | severity | finding | source | action | backlog_ref | status |
| wr-r2-001 | low | pwa/src/foo.ts:1 — manual only | round-2 /code-review | closed | — | closed |
EOF

python3 - <<PY
import sys
sys.path.insert(0, "${SCRIPTS}")
import ritual_step as rs
text = open("${TMP}/STATE.md").read()
cp = __import__("ritual_phase").parse_checkpoint_table(text)
r = rs.validate_step_exit(
    "6-review", cp, text,
    project_root=__import__("pathlib").Path("${TMP}"),
    loop_id="worker-relay",
    state_file="STATE.md",
    archetype="engineer",
)
assert not r.ok, "should fail without bugbot source"
assert "bugbot" in (r.reason + r.fix).lower(), r.reason
print("OK step 6 rejects /code-review-only without bugbot")
PY

cat > "${TMP}/STATE2.md" <<'EOF'
## CHECKPOINT
| field | value |
| review_round | 2 |
| code_changed | yes |
| review_changed_files | pwa/src/foo.ts |
| review_status | pending |
## REVIEW_FINDINGS
| id | severity | finding | source | action | backlog_ref | status |
| wr-r2-000 | low | Bugbot: no issues | round-2 bugbot | closed | — | closed |
EOF

python3 - <<PY
import sys
sys.path.insert(0, "${SCRIPTS}")
import ritual_step as rs
text = open("${TMP}/STATE2.md").read()
cp = __import__("ritual_phase").parse_checkpoint_table(text)
r = rs.validate_step_exit(
    "6-review", cp, text,
    project_root=__import__("pathlib").Path("${TMP}"),
    loop_id="worker-relay",
    state_file="STATE2.md",
    archetype="engineer",
)
assert r.ok, f"should pass with bugbot source: {r.reason}"
print("OK step 6 accepts bugbot sentinel")
PY

OUT="$(bash "${SCRIPTS}/prepare_bugbot_review.sh" "$TMP" \
  --state-file STATE.md --loop-id worker-relay 2>&1 || true)"
echo "$OUT" | grep -q "MANDATORY_SUBAGENT=bugbot" || {
  echo "FAIL: prepare_bugbot_review missing MANDATORY_SUBAGENT"
  exit 1
}
echo "$OUT" | grep -q "AGENT_INSTRUCTION=" || {
  echo "FAIL: prepare_bugbot_review missing AGENT_INSTRUCTION"
  exit 1
}
echo "OK prepare_bugbot_review emits bugbot directive"

echo "OK bugbot review gate segment"
