# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T01:42:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #25; relay-031 pull-to-refresh on Home shipped. |
| blockers | [] |
| confirmed_next | relay-032 Stale streak cache TTL |
| brainstorm_notes | relay-031 done; next maintenance item |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T01:42:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-032 Stale streak cache TTL |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-032 | Stale streak cache TTL | maintenance
- [ ] relay-033 | Recipe scan offline queue | maintenance
- [ ] relay-034 | Haptic on streak badge fire tier | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Desktop refresh button on Home | — | Fallback when no touch |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-031 | done | build | e9b67a1 |
| 2026-07-27 | relay-030 | done | build | d804b2c |
| 2026-07-27 | relay-029 | done | build | beaf9c1 |
| 2026-07-27 | relay-028 | done | build | 7710fa9 |
| 2026-07-27 | relay-027 | done | build | f4ac0a0 |
| 2026-07-27 | relay-026 | done | build + api import | 5e1756e |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
