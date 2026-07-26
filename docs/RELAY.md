# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T02:37:00Z |
| git_branch | main |
| uncommitted_files | maintenance docs |
| where_we_are | Loop tick #62; relay-069 Home empty queue hint shipped. |
| blockers | [] |
| confirmed_next | relay-070 Queue badge hide when on active tab |
| brainstorm_notes | relay-069 done; Home shows empty queue hint like Day/Log Plan |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T02:36:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-069 Home meal plan empty queue hint |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-069 | Home meal plan empty queue hint | maintenance
- [ ] relay-070 | Queue badge hide when on active tab | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| — | — | — |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-068 | done | build | fb08e83 |
| 2026-07-27 | relay-067 | done | build | f7772b4 |
| 2026-07-27 | relay-066 | done | build | ee334bd |
| 2026-07-27 | relay-065 | done | build | f53b3b5 |
| 2026-07-27 | relay-064 | done | build | ccbef45 |
| 2026-07-27 | relay-063 | done | build | 14e1376 |
| 2026-07-27 | relay-062 | done | build | b24bd2e |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
