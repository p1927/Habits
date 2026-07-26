# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T02:08:00Z |
| git_branch | main |
| uncommitted_files | Log undo toast WIP, maintenance docs |
| where_we_are | Loop tick #38; relay-044 VoiceStatusOrb postMessage wiring shipped. |
| blockers | [] |
| confirmed_next | relay-045 Meal plan quick-add from WEEK MEALS |
| brainstorm_notes | relay-044 done; orb driven by VoiceEmbed onStatusChange |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T02:08:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-045 Meal plan quick-add from WEEK MEALS |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-045 | Meal plan quick-add from WEEK MEALS | feature
- [ ] relay-046 | Streak tier legend on Day | maintenance
- [ ] relay-047 | Food log undo toast polish | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Orb click opens voice sheet | — | Quick mic access |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-044 | done | build | pending |
| 2026-07-27 | relay-043 | done | build | d530f03 |
| 2026-07-27 | relay-042 | done | build | c417b7a |
| 2026-07-27 | relay-041 | done | build | b7b5857 |
| 2026-07-27 | relay-040 | done | build | 058303e |
| 2026-07-27 | relay-039 | done | build | 3bf363d |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
