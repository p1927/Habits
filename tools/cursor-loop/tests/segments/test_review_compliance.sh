#!/usr/bin/env bash
# Segment: review compliance gates + prepare_review Phase 6 output
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPTS="${ROOT}/scripts"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

export PYTHONPATH="${SCRIPTS}:${PYTHONPATH:-}"

# prepare_review_tick must not imply Phase 6 complete
GIT_PR="$(mktemp -d)"
(
  cd "$GIT_PR"
  git init -q
  git config user.email test@test.com
  git config user.name Test
  mkdir -p pwa
  echo "v1" > pwa/review.ts
  git add .
  git commit -q -m init
  echo "v2" >> pwa/review.ts
)
cat > "${GIT_PR}/STATE.md" <<'EOF'
## CHECKPOINT
| Field | Value |
| review_round | 0 |
| review_status | pending |
| code_changed | no |
EOF

OUT="$(bash "${SCRIPTS}/prepare_review_tick.sh" "$GIT_PR" \
  --state-file STATE.md --loop-id worker-relay 2>&1 || true)"
echo "$OUT" | grep -q "PHASE_6_NOT_SATISFIED_BY_THIS_SCRIPT=yes" || {
  echo "FAIL: prepare_review missing PHASE_6_NOT_SATISFIED"
  exit 1
}
echo "$OUT" | grep -q "RUN=/code-review" && {
  echo "FAIL: prepare_review still prints misleading RUN=/code-review"
  exit 1
} || true
echo "OK prepare_review Phase 6 output"
rm -rf "$GIT_PR"

# code_changed=no with git diff fails arm
GIT_TMP="$(mktemp -d)"
(
  cd "$GIT_TMP"
  git init -q
  git config user.email test@test.com
  git config user.name Test
  mkdir -p pwa
  echo "v1" > pwa/foo.ts
  git add .
  git commit -q -m init
  echo "v2" >> pwa/foo.ts
)
cat > "${GIT_TMP}/STATE.md" <<'EOF'
## CHECKPOINT
| Field | Value |
| phase | `8-close` |
| review_status | skipped |
| review_skip_reason | lied |
| code_changed | no |
EOF

if python3 "${SCRIPTS}/validate_ritual_gate.py" \
  --project "$GIT_TMP" --loop-id worker-relay --state-file STATE.md --mode arm 2>/dev/null; then
  echo "FAIL: gate should reject code_changed=no with git diff"
  exit 1
fi
echo "OK gate rejects code_changed=no with git diff"

# Generic finding without file citation fails
python3 - <<PY
import review_scope as rs
from pathlib import Path

root = Path("${GIT_TMP}")
live = rs.list_changed_files(root, ["pwa/"])
fp = rs.files_fingerprint(live)
state = f"""## CHECKPOINT
| Field | Value |
| phase | \`8-close\` |
| review_status | done |
| review_round | \`1\` |
| last_reviewed_round | \`1\` |
| code_changed | yes |
| review_changed_files | \`{' '.join(live)}\` |
| review_fingerprint | \`{fp}\` |

## REVIEW_FINDINGS
| id | severity | finding | source | action | backlog_ref | status |
| wr-r1-001 | low | build pass only | round-1 /code-review | closed | — | closed |
"""
Path("${GIT_TMP}/STATE.md").write_text(state)
PY

if python3 "${SCRIPTS}/validate_ritual_gate.py" \
  --project "$GIT_TMP" --loop-id worker-relay --state-file STATE.md --mode arm 2>/dev/null; then
  echo "FAIL: gate should reject generic finding without file citation"
  exit 1
fi
echo "OK gate rejects uncited generic findings"

# Valid finding with path citation passes (commit diff so main-branch worktree gate passes)
(
  cd "$GIT_TMP"
  git add pwa/foo.ts
  git commit -q -m "feat: relay-test"
)
python3 - <<PY
import review_scope as rs
from pathlib import Path

root = Path("${GIT_TMP}")
live = rs.list_changed_files(root, ["pwa/"])
fp = rs.files_fingerprint(live)
path = live[0]
state = f"""## CHECKPOINT
| Field | Value |
| phase | \`8-close\` |
| review_status | done |
| review_round | \`1\` |
| last_reviewed_round | \`1\` |
| code_changed | yes |
| review_changed_files | \`{' '.join(live)}\` |
| review_fingerprint | \`{fp}\` |

## REVIEW_FINDINGS
| id | severity | finding | source | action | backlog_ref | status |
| wr-r1-001 | low | note {path}:1 ok | round-1 /code-review | closed | — | closed |
"""
Path("${GIT_TMP}/STATE.md").write_text(state)
PY

python3 "${SCRIPTS}/validate_ritual_gate.py" \
  --project "$GIT_TMP" --loop-id worker-relay --state-file STATE.md --mode arm
echo "OK gate accepts finding with file citation"

# Transition 5-verify -> 7-triage blocked when code_changed=yes
if python3 "${SCRIPTS}/validate_ritual_gate.py" \
  --project "$GIT_TMP" --loop-id worker-relay --state-file STATE.md \
  --mode transition --from-phase 5-verify --to-phase 7-triage 2>/dev/null; then
  echo "FAIL: transition should require Phase 6 when code_changed=yes"
  exit 1
fi
echo "OK transition blocks skip of Phase 6"

rm -rf "$GIT_TMP"
echo "OK review compliance segment"
