# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T05:02:00Z |
| git_branch | main |
| uncommitted_files | maintenance docs, Log.tsx WIP |
| where_we_are | Loop tick #131; relay-137 recipe scan queue sort by created_at shipped. |
| blockers | [] |
| confirmed_next | relay-138 food log queue empty hint on sync clear |
| brainstorm_notes | all offline queues now use sortQueueByCreatedAt |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T05:02:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: feature) |
| next_action | relay-138 food log queue empty hint on sync clear |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-138 | Food log queue empty hint on sync clear | feature
- [ ] relay-139 | Revert or finish Log.tsx WIP blocking build | maintenance
- [ ] relay-140 | Recipe scan queue relative timestamps | feature

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Log tab "Plan" label | UX | align badge title with queue sub-tab |
| Queue sort parity | relay-130 | habit + food queues oldest-first |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-135 | done | build | 6c27112 |
| 2026-07-27 | relay-134 | done | build | 2f35cdb |
| 2026-07-27 | relay-133 | done | build | 9551e3c |
| 2026-07-27 | relay-132 | done | build | 65e1755 |
| 2026-07-27 | relay-131 | done | build | 194ae02 |
| 2026-07-27 | relay-130 | done | build | cbbbc5e |
| 2026-07-27 | relay-129 | done | build | f1f65f6 |
| 2026-07-27 | relay-128 | done | build | 96f6f3e |
| 2026-07-27 | relay-127 | done | build | 745e1fd |
| 2026-07-27 | relay-126 | done | build | e2b7b12 |
| 2026-07-27 | relay-125 | done | build | 49e36b5 |
| 2026-07-27 | relay-124 | done | build | f1d6a05 |
| 2026-07-27 | relay-123 | done | build | e99dc96 |
| 2026-07-27 | relay-122 | done | build | 6c5e958 |
| 2026-07-27 | relay-121 | done | build | a605006 |
| 2026-07-27 | relay-120 | done | build | 15492bc |
| 2026-07-27 | relay-119 | done | build | 850df2e |
| 2026-07-27 | relay-118 | done | build | 4cb5108 |
| 2026-07-27 | relay-117 | done | build | 3383ae4 |
| 2026-07-27 | relay-116 | done | build | acbc27e |
| 2026-07-27 | relay-115 | done | build | 42580ec |
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
