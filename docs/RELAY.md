# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T01:48:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #28; relay-034 fire-tier streak haptic shipped. |
| blockers | [] |
| confirmed_next | relay-035 Desktop refresh button on Home |
| brainstorm_notes | relay-034 done; next maintenance item |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T01:48:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-035 Desktop refresh button on Home |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-035 | Desktop refresh button on Home | maintenance
- [ ] relay-036 | Recipe scan queue dismiss button | maintenance
- [ ] relay-037 | Per-metric fire streak haptic | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Hot tier single pulse haptic | — | Lighter feedback at 7d |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-034 | done | build | pending |
| 2026-07-27 | relay-033 | done | build | 1cb16cb |
| 2026-07-27 | relay-032 | done | build | cf359c8 |
| 2026-07-27 | relay-031 | done | build | e9b67a1 |
| 2026-07-27 | relay-030 | done | build | d804b2c |
| 2026-07-27 | relay-029 | done | build | beaf9c1 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
