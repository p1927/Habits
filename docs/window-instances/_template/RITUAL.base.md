# Universal 9-Phase Ritual (base)

All Window Instances run phases **1–9** with the same names. Phases **4–6** vary by `archetype`.

## Phase overview

| Phase | Name | All windows |
|-------|------|-------------|
| 1 | **Wake** | Read INSTANCE → IDENTITY → STATE → RITUAL; confirm `loop_id` from wake JSON |
| 2 | **Review** | Update `LAST_REVIEW`; read CHECKPOINT + git status |
| 3 | **Select** | Resume `IN_PROGRESS` or pick top backlog item |
| 4 | **Execute** | Archetype-specific (see table) |
| 5 | **Verify** | Archetype-specific (see table) |
| 6 | **Review** | Archetype-specific (see table) |
| 7 | **Triage** | Fix blockers now OR log to REVIEW_FINDINGS / backlog |
| 8 | **Close** | HISTORY row, clear IN_PROGRESS, update CHECKPOINT |
| 9 | **Arm** | `checkpoint-loop.py --product` + `arm-wake.sh` per agent-loop-contract |

## Phases 4–6 by archetype

| Phase | engineer | designer | product | qa |
|-------|----------|----------|---------|-----|
| 4 Execute | Ship feature code | Ship UI diff | Brainstorm + backlog mutate | Run test plan / automation |
| 5 Verify | `npm run build` (pwa/) | build + 390px check | lens sessions logged | tests pass + repro steps |
| 6 Review | `/code-review` bugs/regressions | `/code-review` + visual | Product code review template | `/code-review` + coverage gaps |

## Phase 7 — Triage rules

Sort findings into:

- **Fix now** — blocks closing current item
- **REVIEW_FINDINGS** — non-blocking, stays in STATE until resolved
- **New backlog item** — with id, AC, target window

## Phase 8 — Close checklist

- [ ] HISTORY row appended
- [ ] IN_PROGRESS cleared or updated
- [ ] CHECKPOINT: `phase=8-close`, `review_status` set, `current_item_id` recorded
- [ ] Backlog checkboxes updated

## Phase 9 — Arm gate

**Cannot arm if:**

- `CHECKPOINT.phase < 8-close`
- `review_status=pending`

**Allowed skip:** `review_status=skipped` with `review_skip_reason` (docs-only ticks).

Set `CHECKPOINT.phase=9-arm` after successful arm.
