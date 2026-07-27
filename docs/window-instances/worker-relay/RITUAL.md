# Ritual — worker-relay

**extends:** `engineer`  
**base:** [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md)

## Phase 2 — Review

STATE CHECKPOINT, IN_PROGRESS, BACKLOG; `git status`; `git log -3`; update `LAST_REVIEW`.

## Phase 3 — Select

Top BACKLOG item or resume IN_PROGRESS. If BACKLOG < 3, refill from BRAINSTORM first.

## Phase 4 — Execute

Ship `relay-*` feature code. Chain items in same wake when possible.

## Phase 5 — Verify

```bash
cd pwa && npm run build
python3 -c "import habits_api.main"   # if server/ changed
curl -s http://127.0.0.1:8787/healthz   # optional, server running
```

Area-specific checks when touching: Home rings, Log swipe/scan, Day timeline, Cards CRUD, Agent chat.

## Phase 6 — Review

`/code-review` on diff — bugs, regressions, missing tests.

## Phase 7 — Triage

Fix-now | REVIEW_FINDINGS `rf-*` | new `relay-*` backlog.

## Phase 8 — Close

HISTORY, CHECKPOINT (`phase=8-close`, `review_status`), clear IN_PROGRESS, commit.

## Phase 9 — Arm

`checkpoint-loop.py --product --evidence <item-id>` + `arm-wake.sh`.
