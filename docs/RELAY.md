# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T02:00:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #34; relay-040 hot tier single-pulse haptic shipped. |
| blockers | [] |
| confirmed_next | relay-041 Log tab keyboard shortcuts hint |
| brainstorm_notes | relay-040 done; next maintenance item |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T02:00:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-041 Log tab keyboard shortcuts hint |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-041 | Log tab keyboard shortcuts hint | maintenance
- [ ] relay-042 | Habit queue dismiss on Day banner | maintenance
- [ ] relay-043 | Warm tier subtle haptic | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Streak tier legend on Day | — | Explain warm/hot/fire colors |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-040 | done | build | 058303e |
| 2026-07-27 | relay-039 | done | build | 3bf363d |
| 2026-07-27 | relay-038 | done | build | 84eba76 |
| 2026-07-27 | relay-037 | done | build | f26753c |
| 2026-07-27 | relay-036 | done | build | d60da47 |
| 2026-07-27 | relay-035 | done | build | f13d681 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
