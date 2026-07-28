#!/usr/bin/env bash
# Segment: state snapshot API + sidecar
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPTS="${ROOT}/scripts"
PROJECT="$(mktemp -d)"
trap 'rm -rf "$PROJECT"' EXIT
export PYTHONPATH="${SCRIPTS}:${PYTHONPATH:-}"

mkdir -p "${PROJECT}/docs/window-instances/worker-relay"
cat > "${PROJECT}/docs/window-instances/instances.manifest.json" <<'EOF'
{"version":1,"instances":[{"loop_id":"worker-relay","state_file":"docs/window-instances/worker-relay/STATE.md","backlog_sections":["BACKLOG"]}]}
EOF

# 50 done + 3 open backlog rows
{
  echo '# STATE — worker-relay'
  echo '## CHECKPOINT'
  echo '| field | value |'
  echo '| phase | `1-wake` |'
  echo '| review_round | `0` |'
  echo '## IN_PROGRESS'
  echo '## BACKLOG'
  for i in $(seq 1 50); do echo "- [x] relay-${i} | done item"; done
  for i in 51 52 53; do echo "- [ ] relay-${i} | open item"; done
  echo '## REVIEW_FINDINGS'
  echo '| id | severity | finding | source | action | backlog_ref | status |'
  echo '## HISTORY'
  echo '| completed_at | item_id | phase | outcome | evidence |'
} > "${PROJECT}/docs/window-instances/worker-relay/STATE.md"

OPEN=$(bash "${SCRIPTS}/state_api.sh" "${PROJECT}" --loop-id worker-relay get backlog --open | \
  python3 -c "import sys,re; t=sys.stdin.read(); m=re.search(r'STATE_API_JSON_BEGIN\n(.*)\nSTATE_API_JSON_END', t, re.S); import json; d=json.loads(m.group(1)); print(len(d))")
[[ "$OPEN" == "3" ]] || { echo "FAIL: expected 3 open backlog, got $OPEN"; exit 1; }
echo "OK open backlog count"

bash "${SCRIPTS}/state_api.sh" "${PROJECT}" --loop-id worker-relay set checkpoint phase=2-orient >/dev/null
grep -q 'phase.*2-orient' "${PROJECT}/docs/window-instances/worker-relay/STATE.md" || {
  echo "FAIL: checkpoint not updated"
  exit 1
}
[[ -f "${PROJECT}/docs/window-instances/worker-relay/STATE.hot.json" ]] || {
  echo "FAIL: sidecar missing after set"
  exit 1
}
echo "OK set checkpoint + sidecar"

# After write, done [x] items must be pruned to ≤10
DONE_COUNT=$(grep -c '^- \[x\]' "${PROJECT}/docs/window-instances/worker-relay/STATE.md" || true)
[[ "$DONE_COUNT" -le 10 ]] || { echo "FAIL: expected ≤10 done items after prune, got $DONE_COUNT"; exit 1; }
# Open items must all survive pruning
OPEN_AFTER=$(bash "${SCRIPTS}/state_api.sh" "${PROJECT}" --loop-id worker-relay get backlog --open | \
  python3 -c "import sys,re; t=sys.stdin.read(); m=re.search(r'STATE_API_JSON_BEGIN\n(.*)\nSTATE_API_JSON_END', t, re.S); import json; d=json.loads(m.group(1)); print(len(d))")
[[ "$OPEN_AFTER" == "3" ]] || { echo "FAIL: expected 3 open items after prune, got $OPEN_AFTER"; exit 1; }
# Explicit prune command must succeed
bash "${SCRIPTS}/state_api.sh" "${PROJECT}" --loop-id worker-relay prune | grep -q 'STATE_API_OK verb=prune' || {
  echo "FAIL: prune command did not emit OK"
  exit 1
}
echo "OK backlog prune on write"

PAYLOAD=$(python3 "${SCRIPTS}/build_wake_prompt.py" \
  --loop-id worker-relay \
  --contract-doc docs/window-instances/worker-relay/INSTANCE.md \
  --state-file docs/window-instances/worker-relay/STATE.md \
  --project "${PROJECT}")
python3 -c "import json,sys; p=json.loads(sys.argv[1]); assert 'state_snapshot' in p; assert 'STATE.md' not in p.get('read_order',[])" "$PAYLOAD" || {
  echo "FAIL: wake payload missing state_snapshot or still reads STATE.md"
  exit 1
}
echo "OK wake payload state_snapshot"

bash "${SCRIPTS}/migrate_state_sidecar.sh" "${PROJECT}" | grep -q 'migrate_state_sidecar END' || {
  echo "FAIL: migrate script"
  exit 1
}
echo "OK migrate_state_sidecar"

echo "OK test_state_snapshot"
