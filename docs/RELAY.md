# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.  
> Phase archive: [`ROADMAP.md`](ROADMAP.md).

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | *(updated each wake)* |
| git_branch | *(current branch)* |
| uncommitted_files | *(count)* |
| where_we_are | Phases 0–7 done. Relay v2 in progress. relay-003 meal plan quick-add next. |
| blockers | [] |
| confirmed_next | relay-003 Meal plan quick-add |
| brainstorm_notes | Backlog healthy; no reprioritization needed |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T00:32:00Z |
| status | in_progress |
| current_item_id | relay-003 |
| cycle_parity | odd (maintenance) |
| next_action | Meal plan quick-add on Day/Home |
| blockers | [] |
| loops | `agent-relay-loop.sh` (60s) + `agent-relay-fallback.sh` (300s) |

---

## IN_PROGRESS

| Field | Value |
|-------|-------|
| item_id | relay-003 |
| title | Meal plan quick-add from WEEK MEALS |
| type | maintenance |
| acceptance_criteria | Show today's meals; one-tap log all |

---

## BACKLOG (priority ordered)

- [ ] relay-004 | Accessibility pass on new tabs | maintenance
- [ ] relay-005 | Agent chat camera attach | maintenance
- [ ] relay-006 | Optimistic food log + retry | maintenance
- [ ] relay-007 | Lighthouse PWA score > 90 | maintenance
- [ ] relay-010 | Weekly habit sparklines on Home | feature
- [ ] relay-011 | Offline food log queue | feature

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Streak badges on Day tab | Apple Fitness | Consecutive days hitting targets |
| Barcode scan | MyFitnessPal | BarcodeDetector API |
| Sickness timeline | Google Keep + Health | Chart from Sickness sheet |
| Meal photo gallery | Apple Health | Thumbnails for today's log |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-v2 | in_progress | — | Loop 60s + ritual docs |
| 2026-07-27 | relay-002 | done | build | recipes API + Log tab |
| 2026-07-27 | relay-loop-fix | done | running | persistent loop scripts |
| 2026-07-27 | relay-001 | done | build | voice postMessage orb |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. Persistent loops only — never one-shot sleepers
5. BACKLOG < 3: refill from BRAINSTORM + web research
