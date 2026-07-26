# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T02:04:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #36; relay-042 habit queue dismiss on Day banner shipped. |
| blockers | [] |
| confirmed_next | relay-043 Recipes tab browse/log Save Reciepe sheet |
| brainstorm_notes | relay-042 done; next feature item |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T02:04:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-043 Recipes tab browse/log Save Reciepe sheet |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-043 | Recipes tab — browse/log Save Reciepe sheet | feature
- [ ] relay-044 | VoiceStatusOrb postMessage real mic state | maintenance
- [ ] relay-045 | Meal plan quick-add from WEEK MEALS | feature

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Streak tier legend on Day | — | Explain warm/hot/fire colors |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-042 | done | build | pending |
| 2026-07-27 | relay-041 | done | build | b7b5857 |
| 2026-07-27 | relay-040 | done | build | 058303e |
| 2026-07-27 | relay-039 | done | build | 3bf363d |
| 2026-07-27 | relay-038 | done | build | 84eba76 |
| 2026-07-27 | relay-037 | done | build | f26753c |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
