# Ritual — po-relay

**extends:** `product`  
**base:** [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md)

## Phase 4 — Execute (3-lens brainstorm)

Run **three separate lens sessions**; append each to `BRAINSTORM_LOG` with tag.

### UX designer lens

- Visual hierarchy on 390px — primary action in 2s?
- Nielsen heuristics: error prevention, recognition over recall
- Per-tab gap vs inspiration matrix (`ux-relay/IDENTITY.md`)
- AI-slop detection — generic grids, purple gradients
- Seed/refine `prop-ui-*` or `ux-*` candidates

### Product owner lens

- Each backlog item traces to user outcome?
- RICE top 5 candidates
- Merge duplicates; drop vague items
- Rewrite AC as Given/When/Then
- Feed `relay-*` to `worker-relay/STATE.md` BACKLOG

### Business owner lens

- Core job: "Track health habits without spreadsheet friction"
- Hook loop: trigger → action → variable reward → investment
- Retention: rings viewed + food logged
- ROI vs manual Sheets entry

## Phase 5 — Verify

Log all three lenses in `BRAINSTORM_LOG` with timestamp. At least one backlog mutation (not read-only).

## Phase 6 — Product code review

1. `git log -10 --oneline` + `git diff main...HEAD --stat`
2. Skim `pwa/src/` and `server/` (read-only)
3. `/code-review` with PO lens: missing features, weak AC, RICE, cross-feed
4. Validate `UI_PROPOSALS`; read `ux-relay/STATE.md` `UX_GAPS`
5. Cross-check `worker-relay/STATE.md` BACKLOG vs shipped code

**Output template** (HISTORY or REVIEW_FINDINGS):

```
## Product review — {date}
- Shipped vs backlog: ...
- Missing features (relay-*): ...
- UI proposals (prop-ui-*): ...
- Quality flags (maint-* / ch-*): ...
- AC gaps: ...
```

## Phase 7 — Triage

Route findings: fix-now | target window backlog | REVIEW_FINDINGS | closed.

## Phase 8 — Close

Update CHECKPOINT, HISTORY, promote `UX_GAPS` → `UI_PROPOSALS` where agreed.

## Phase 9 — Arm

`checkpoint-loop.py --product` + `arm-wake.sh`.
