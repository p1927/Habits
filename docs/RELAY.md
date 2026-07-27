# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T02:48:00Z |
| git_branch | main |
| uncommitted_files | maintenance docs |
| where_we_are | Loop tick #73; relay-080 Log Plan failed queue highlight shipped. |
| blockers | [] |
| confirmed_next | relay-081 Home queue per-item list like Day |
| brainstorm_notes | relay-080 done; Plan tab shows queue list with failed rows + retry |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T02:48:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-081 Home queue per-item list like Day |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-081 | Home queue per-item list like Day | feature
- [ ] relay-082 | Home prune stale failed ids after partial sync | maintenance
- [ ] relay-083 | Log Plan empty hint only when meal plan loaded | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| — | — | — |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-080 | done | build | — |
| 2026-07-27 | relay-079 | done | build | 0439596 |
| 2026-07-27 | relay-078 | done | build | 8f80018 |
| 2026-07-27 | relay-077 | done | build | 9846db0 |
| 2026-07-27 | relay-076 | done | build | d049090 |
| 2026-07-27 | relay-075 | done | build | d1f3c59 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
