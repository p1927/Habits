# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T02:41:00Z |
| git_branch | main |
| uncommitted_files | maintenance docs |
| where_we_are | Loop tick #66; relay-073 Day failed queue item highlight shipped. |
| blockers | [] |
| confirmed_next | relay-074 Home queue banner when pending but no meal plan today |
| brainstorm_notes | relay-073 done; failed items get err banner, count, and row styling |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T02:41:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-074 Home queue banner when pending but no meal plan today |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-074 | Home queue banner when pending but no meal plan today | maintenance
- [ ] relay-075 | Log Plan badge tooltip on queue count | feature
- [ ] relay-076 | Clear Day failed highlights on successful Sync all | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| — | — | — |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-073 | done | build | — |
| 2026-07-27 | relay-072 | done | build | ce5cea3 |
| 2026-07-27 | relay-071 | done | build | 86d7c4a |
| 2026-07-27 | relay-070 | done | build | 535f7a2 |
| 2026-07-27 | relay-069 | done | build | a6a3c50 |
| 2026-07-27 | relay-068 | done | build | fb08e83 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
