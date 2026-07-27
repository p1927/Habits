# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T03:30:00Z |
| git_branch | main |
| uncommitted_files | maintenance docs |
| where_we_are | Loop tick #86; relay-091 Log enqueue queue UI refresh shipped. |
| blockers | [] |
| confirmed_next | relay-092 meal plan sync success haptic |
| brainstorm_notes | relay-091 done; Log calls syncMealPlanQueue after offline enqueue |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T03:30:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-092 meal plan sync success haptic |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-092 | Meal plan sync success haptic | feature
- [ ] relay-093 | Queue panel focus on first failed item | maintenance
- [ ] relay-094 | Home queue banner when sync in progress on other tab | feature

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| — | — | — |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-091 | done | build | — |
| 2026-07-27 | relay-090 | done | build | 68b6136 |
| 2026-07-27 | relay-089 | done | build | a11a247 |
| 2026-07-27 | relay-088 | done | build | b63a49f |
| 2026-07-27 | relay-087 | done | build | 4d623e3 |
| 2026-07-27 | relay-086 | done | build | 39f4535 |
| 2026-07-27 | relay-085 | done | build | 2719131 |
| 2026-07-27 | relay-084 | done | build | 13dc88c |
| 2026-07-27 | relay-083 | done | build | 0b3e827 |
| 2026-07-27 | relay-082 | done | build | 4210522 |
| 2026-07-27 | relay-081 | done | build | 4210522 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
