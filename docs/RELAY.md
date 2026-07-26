# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T02:02:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #35; relay-041 Log tab keyboard shortcuts hint shipped. |
| blockers | [] |
| confirmed_next | relay-042 Habit queue dismiss on Day banner |
| brainstorm_notes | relay-041 done; next maintenance item |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T02:02:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-042 Habit queue dismiss on Day banner |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-042 | Habit queue dismiss on Day banner | maintenance
- [ ] relay-043 | Recipes tab — browse/log Save Reciepe sheet | feature
- [ ] relay-044 | VoiceStatusOrb postMessage real mic state | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Streak tier legend on Day | — | Explain warm/hot/fire colors |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-041 | done | build | pending |
| 2026-07-27 | relay-040 | done | build | 058303e |
| 2026-07-27 | relay-039 | done | build | 3bf363d |
| 2026-07-27 | relay-038 | done | build | 84eba76 |
| 2026-07-27 | relay-037 | done | build | f26753c |
| 2026-07-27 | relay-036 | done | build | d60da47 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
