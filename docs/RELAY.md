# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T04:30:00Z |
| git_branch | main |
| uncommitted_files | maintenance docs |
| where_we_are | Loop tick #98; relay-103 badge clear pulse on dismiss shipped. |
| blockers | [] |
| confirmed_next | relay-104 cards tab meal plan queue awareness |
| brainstorm_notes | relay-103 done; tab badge pulses when queue or failed count clears |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T04:30:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-104 cards tab meal plan queue awareness |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-104 | Cards tab meal plan queue awareness | feature
- [ ] relay-105 | Meal plan sync banner reduced motion | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| — | — | — |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-103 | done | build | — |
| 2026-07-27 | relay-102 | done | build | c4e149d |
| 2026-07-27 | relay-101 | done | build | ddb3d3a |
| 2026-07-27 | relay-100 | done | build | 8db3dae |
| 2026-07-27 | relay-099 | done | build | 8f1cd97 |
| 2026-07-27 | relay-098 | done | build | 74dfcaf |
| 2026-07-27 | relay-097 | done | build | e1d9f29 |
| 2026-07-27 | relay-096 | done | build | 8f5cb6b |
| 2026-07-27 | relay-095 | done | build | 2557202 |
| 2026-07-27 | relay-094 | done | build | 1cab646 |
| 2026-07-27 | relay-093 | done | build | 9345536 |
| 2026-07-27 | relay-092 | done | build | 8d6c73f |
| 2026-07-27 | relay-091 | done | build | 18f7be6 |
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
