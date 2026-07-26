# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T02:16:00Z |
| git_branch | main |
| uncommitted_files | maintenance docs |
| where_we_are | Loop tick #42; relay-048 meal plan offline queue shipped. |
| blockers | [] |
| confirmed_next | relay-049 Home meal plan widget |
| brainstorm_notes | relay-048 done; meal plan cache + queue on Day |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T02:16:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-049 Home meal plan widget |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-049 | Home meal plan widget | feature
- [ ] relay-050 | OFF log undo support | maintenance
- [ ] relay-051 | Meal plan queue retry UI | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Collapsible streak legend | — | Hide after first visit |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-048 | done | build | pending |
| 2026-07-27 | relay-047 | done | build | 340fdcc |
| 2026-07-27 | relay-046 | done | build | 092973a |
| 2026-07-27 | relay-045 | done | build+import | ccde35c |
| 2026-07-27 | relay-044 | done | build | 0128f6f |
| 2026-07-27 | relay-043 | done | build | d530f03 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
