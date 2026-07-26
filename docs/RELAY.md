# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T02:14:00Z |
| git_branch | main |
| uncommitted_files | maintenance docs |
| where_we_are | Loop tick #41; relay-047 food log undo toast polish shipped. |
| blockers | [] |
| confirmed_next | relay-048 Meal plan offline queue |
| brainstorm_notes | relay-047 done; undo toast for scan/manual/recipe logs |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T02:14:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-048 Meal plan offline queue |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-048 | Meal plan offline queue | maintenance
- [ ] relay-049 | Home meal plan widget | feature
- [ ] relay-050 | OFF log undo support | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Collapsible streak legend | — | Hide after first visit |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-047 | done | build | 340fdcc |
| 2026-07-27 | relay-046 | done | build | 092973a |
| 2026-07-27 | relay-045 | done | build+import | ccde35c |
| 2026-07-27 | relay-044 | done | build | 0128f6f |
| 2026-07-27 | relay-043 | done | build | d530f03 |
| 2026-07-27 | relay-042 | done | build | c417b7a |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
