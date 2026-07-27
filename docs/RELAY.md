# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T04:41:00Z |
| git_branch | main |
| uncommitted_files | maintenance docs |
| where_we_are | Loop tick #110; relay-115 shared scrollToMealPlanQueue helper shipped. |
| blockers | [] |
| confirmed_next | relay-116 meal plan queue banner aria-live while syncing |
| brainstorm_notes | relay-115 done; useMealPlanQueueScroll hook consolidates badge scroll navigation |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T04:40:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-115 shared scrollToMealPlanQueue helper in App |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-116 | Meal plan queue banner aria-live while syncing | maintenance
- [ ] relay-117 | navigateMealPlanSyncSource scroll to queue | feature

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| — | — | — |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-115 | done | build | — |
| 2026-07-27 | relay-114 | done | build | cf3ce9e |
| 2026-07-27 | relay-113 | done | build | 967f3e8 |
| 2026-07-27 | relay-111 | done | build | 6a97b84 |
| 2026-07-27 | relay-110 | done | build | 17c9484 |
| 2026-07-27 | relay-109 | done | build | be01dfe |
| 2026-07-27 | relay-108 | done | build | cb2d7e2 |
| 2026-07-27 | relay-107 | done | build | ca1b156 |
| 2026-07-27 | relay-106 | done | build | 9b3209e |
| 2026-07-27 | relay-105 | done | build | 56d94a8 |
| 2026-07-27 | relay-104 | done | build | 9d3232a |
| 2026-07-27 | relay-103 | done | build | ab8f112 |
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
