# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T02:42:00Z |
| git_branch | main |
| uncommitted_files | maintenance docs |
| where_we_are | Loop tick #67; relay-074 Home orphan queue banner shipped. |
| blockers | [] |
| confirmed_next | relay-075 Log Plan badge tooltip on queue count |
| brainstorm_notes | relay-074 done; pending queue banner when no plan + queue change listener |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T02:42:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-075 Log Plan badge tooltip on queue count |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-075 | Log Plan badge tooltip on queue count | feature
- [ ] relay-076 | Clear Day failed highlights on successful Sync all | maintenance
- [ ] relay-077 | Home failed sync error on meal plan queue flush | feature

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| — | — | — |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-074 | done | build | — |
| 2026-07-27 | relay-073 | done | build | 2eea036 |
| 2026-07-27 | relay-072 | done | build | ce5cea3 |
| 2026-07-27 | relay-071 | done | build | 86d7c4a |
| 2026-07-27 | relay-070 | done | build | 535f7a2 |
| 2026-07-27 | relay-069 | done | build | a6a3c50 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
