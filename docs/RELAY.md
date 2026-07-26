# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T01:32:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #20; relay-026 OFF direct log shipped. |
| blockers | [] |
| confirmed_next | relay-027 Habit queue retry UI |
| brainstorm_notes | relay-026 done; next maintenance item |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T01:32:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-027 Habit queue retry UI |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 2702, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-027 | Habit queue retry UI | maintenance
- [ ] relay-028 | Cache streak for offline share PNG | maintenance
- [ ] relay-029 | Recipe scan + log from photo | feature

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| OFF log offline queue | food queue | Queue macros log when server offline |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-026 | done | build + api import | 5e1756e |
| 2026-07-27 | relay-025 | done | build | f6809c0 |
| 2026-07-27 | relay-024 | done | build | 0e44f8e |
| 2026-07-27 | relay-023 | done | build | 054db1f |
| 2026-07-27 | relay-022 | done | build | 7f68d35 |
| 2026-07-27 | relay-021 | done | build | ad69715 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
