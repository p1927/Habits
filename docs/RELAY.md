# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T01:10:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #9; relay-015 meal photo gallery on Home shipped. Backlog refilled. |
| blockers | [] |
| confirmed_next | relay-016 Push notification meal reminders |
| brainstorm_notes | Added relay-016, relay-017, relay-018 from BRAINSTORM |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T01:10:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-016 Push notification meal reminders |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 2702, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-016 | Push notification meal reminders | maintenance
- [ ] relay-017 | Export week PDF report | feature
- [ ] relay-018 | Streak badge animations on Day | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Barcode Open Food Facts lookup | MyFitnessPal | External API for unknown barcodes |
| Habit ring share card | Apple Fitness | PNG export from Home |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-015 | done | build | pending |
| 2026-07-27 | relay-014 | done | build + api import | 51ef13d |
| 2026-07-27 | relay-013 | done | build | 6bb3973 |
| 2026-07-27 | relay-012 | done | build + api import | 3fdd7ce |
| 2026-07-27 | relay-011 | done | build | 4c5dbb0 |
| 2026-07-27 | relay-010 | done | build | 95a100c |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
