# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T02:49:00Z |
| git_branch | main |
| uncommitted_files | maintenance docs |
| where_we_are | Loop tick #74; relay-081 Home per-item queue list shipped (includes relay-082 prune). |
| blockers | [] |
| confirmed_next | relay-083 Log Plan empty hint only when meal plan loaded |
| brainstorm_notes | relay-081 done; relay-082 stale failed prune included in flush finally |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T02:49:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-083 Log Plan empty hint only when meal plan loaded |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-083 | Log Plan empty hint only when meal plan loaded | maintenance
- [ ] relay-084 | Shared meal plan queue panel component | feature
- [ ] relay-085 | Home/Day/Log queue keyboard shortcuts | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| — | — | — |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-081 | done | build | 4210522 |
| 2026-07-27 | relay-082 | done | build | 4210522 |
| 2026-07-27 | relay-080 | done | build | 79fac2e |
| 2026-07-27 | relay-079 | done | build | 0439596 |
| 2026-07-27 | relay-078 | done | build | 8f80018 |
| 2026-07-27 | relay-077 | done | build | 9846db0 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
