# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T01:50:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #29; relay-035 desktop refresh button on Home shipped. |
| blockers | [] |
| confirmed_next | relay-036 Recipe scan queue dismiss button |
| brainstorm_notes | relay-035 done; next maintenance item |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T01:50:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-036 Recipe scan queue dismiss button |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-036 | Recipe scan queue dismiss button | maintenance
- [ ] relay-037 | Per-metric fire streak haptic | maintenance
- [ ] relay-038 | Home refresh keyboard shortcut | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Refresh icon instead of text | — | Compact header button |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-035 | done | build | pending |
| 2026-07-27 | relay-034 | done | build | 4dcb101 |
| 2026-07-27 | relay-033 | done | build | 1cb16cb |
| 2026-07-27 | relay-032 | done | build | cf359c8 |
| 2026-07-27 | relay-031 | done | build | e9b67a1 |
| 2026-07-27 | relay-030 | done | build | d804b2c |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
