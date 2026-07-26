# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T02:10:00Z |
| git_branch | main |
| uncommitted_files | Log undo toast WIP, maintenance docs |
| where_we_are | Loop tick #39; relay-045 meal plan quick-add shipped. |
| blockers | [] |
| confirmed_next | relay-046 Streak tier legend on Day |
| brainstorm_notes | relay-045 done; per-meal log from WEEK MEALS |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T02:10:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-046 Streak tier legend on Day |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-046 | Streak tier legend on Day | maintenance
- [ ] relay-047 | Food log undo toast polish | maintenance
- [ ] relay-048 | Meal plan offline queue | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Log meal plan from Home | — | Quick breakfast log widget |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-045 | done | build+import | pending |
| 2026-07-27 | relay-044 | done | build | 0128f6f |
| 2026-07-27 | relay-043 | done | build | d530f03 |
| 2026-07-27 | relay-042 | done | build | c417b7a |
| 2026-07-27 | relay-041 | done | build | b7b5857 |
| 2026-07-27 | relay-040 | done | build | 058303e |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
