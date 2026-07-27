# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T03:25:00Z |
| git_branch | main |
| uncommitted_files | maintenance docs |
| where_we_are | Loop tick #85; relay-090 tab badge failed count shipped. |
| blockers | [] |
| confirmed_next | relay-091 Log offline enqueue refresh queue UI |
| brainstorm_notes | relay-090 done; failed syncs show red badge count on tabs |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T03:25:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-091 Log offline enqueue refresh queue UI immediately |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-090 | Tab badge show failed meal plan count | feature
- [ ] relay-091 | Log offline enqueue refresh queue UI immediately | maintenance
- [ ] relay-092 | Meal plan sync success haptic | feature

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| — | — | — |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
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
