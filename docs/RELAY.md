# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T02:39:00Z |
| git_branch | main |
| uncommitted_files | maintenance docs |
| where_we_are | Loop tick #64; relay-071 Log badge opens Plan sub-tab shipped. |
| blockers | [] |
| confirmed_next | relay-072 Home empty queue hint only when meal plan visible |
| brainstorm_notes | relay-071 done; tapping Log queue badge jumps to Plan tab |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T02:38:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-071 Tap Log tab badge opens Plan sub-tab |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-071 | Tap Log tab badge opens Plan sub-tab | feature
- [ ] relay-072 | Home empty queue hint only when meal plan visible | maintenance
- [ ] relay-073 | Day queue failed-item highlight on sync error | feature

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| — | — | — |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-070 | done | build | 535f7a2 |
| 2026-07-27 | relay-069 | done | build | a6a3c50 |
| 2026-07-27 | relay-068 | done | build | fb08e83 |
| 2026-07-27 | relay-067 | done | build | f7772b4 |
| 2026-07-27 | relay-066 | done | build | ee334bd |
| 2026-07-27 | relay-065 | done | build | f53b3b5 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
