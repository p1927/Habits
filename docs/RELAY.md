# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T02:44:00Z |
| git_branch | main |
| uncommitted_files | maintenance docs |
| where_we_are | Loop tick #69; relay-076 Day failed highlight clear on Sync all shipped. |
| blockers | [] |
| confirmed_next | relay-077 Home failed sync error on meal plan queue flush |
| brainstorm_notes | relay-076 done; failed state + error banner clear when queue empties |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T02:44:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-077 Home failed sync error on meal plan queue flush |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-077 | Home failed sync error on meal plan queue flush | feature
- [ ] relay-078 | Tab badge tooltips on Home and Day queue counts | maintenance
- [ ] relay-079 | Day prune stale failed ids after partial sync | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| — | — | — |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-076 | done | build | — |
| 2026-07-27 | relay-075 | done | build | d1f3c59 |
| 2026-07-27 | relay-074 | done | build | 9622126 |
| 2026-07-27 | relay-073 | done | build | 2eea036 |
| 2026-07-27 | relay-072 | done | build | ce5cea3 |
| 2026-07-27 | relay-071 | done | build | 86d7c4a |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
