# Ritual — code-health

**extends:** `engineer` (refactor variant)  
**base:** [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md)

## Phase 2 — Review

`git status`; `git log -10 --oneline`; `git diff --stat`; patchwork clusters; update `LAST_REVIEW`.

## Phase 3 — Select

Resume `IN_PROGRESS` OR top `REFACTOR_BACKLOG` / `BUG_BACKLOG` OR next `SCAN_COVERAGE` row.

## Phase 4 — Execute

Brainstorm 2 approaches; pick minimal structural fix. Evaluate touched code against checklist below.

### Line-by-line checklist (score pass / warn / fail)

**Correctness:** null guards, error paths, races, offline/queue consistency, no stray `any`

**Robustness:** no patchwork; business rules in lib/hooks once; side effects isolated

**Structure:** sections orchestrate; components present; hooks subscribe; routes thin

**Readability:** intent names; functions ≤ ~40 lines; no mystery booleans; import order

**File naming:** one export per file; filename matches export; hooks `use*`; no `utils.ts` maze

**DRY:** repeated JSX/conditionals (≥2) → component or hook; shared types in `lib/`

**Patchwork signals:** 3+ fixes same file; per-tab banners → shared awareness component; queue state scattered → centralize

## Phase 5 — Verify

```bash
cd pwa && npm run build
cd server && python -m compileall habits_api   # when Python touched
```

**Regression spot-checks (when area touched):**

| Area | Check |
|------|--------|
| Meal plan queue | Dismiss clears failed ids; remote banner navigates |
| Log swipe | Directions + undo toast |
| Cards | Search/filter + FAB create |
| Offline | Queue banners when server offline |

## Phase 6 — Review

`/code-review` — structure, DRY, naming, patchwork vs root-cause.

## Phase 7 — Triage

REVIEW_FINDINGS or BUG_BACKLOG; feed Worker if cross-cutting.

## Phase 8 — Close

HISTORY, SCAN_COVERAGE, CHECKPOINT, backlogs. No warn/fail on touched files without backlog entry.

## Phase 9 — Arm

`checkpoint-loop.py --product` + `arm-wake.sh`.
