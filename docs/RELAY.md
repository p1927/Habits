# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T01:54:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #31; relay-037 per-metric fire streak haptic shipped. |
| blockers | [] |
| confirmed_next | relay-038 Home refresh keyboard shortcut |
| brainstorm_notes | relay-037 done; next maintenance item |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T01:54:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-038 Home refresh keyboard shortcut |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-038 | Home refresh keyboard shortcut | maintenance
- [ ] relay-039 | Food log queue dismiss on banner | maintenance
- [ ] relay-040 | Hot tier single-pulse haptic | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Metric name in haptic toast | — | "Work streak on fire!" |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-037 | done | build | pending |
| 2026-07-27 | relay-036 | done | build | d60da47 |
| 2026-07-27 | relay-035 | done | build | f13d681 |
| 2026-07-27 | relay-034 | done | build | 4dcb101 |
| 2026-07-27 | relay-033 | done | build | 1cb16cb |
| 2026-07-27 | relay-032 | done | build | cf359c8 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
