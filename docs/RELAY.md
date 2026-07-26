# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T01:38:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #23; relay-029 recipe scan + log shipped. |
| blockers | [] |
| confirmed_next | relay-030 OFF macros log offline queue |
| brainstorm_notes | relay-029 done; next maintenance item |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T01:38:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-030 OFF macros log offline queue |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 2702, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-030 | OFF macros log offline queue | maintenance
- [ ] relay-031 | Pull-to-refresh on Home | maintenance
- [ ] relay-032 | Stale streak cache TTL | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Recipe scan offline queue | food queue | Queue scan result for later log |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-029 | done | build | pending |
| 2026-07-27 | relay-028 | done | build | 7710fa9 |
| 2026-07-27 | relay-027 | done | build | f4ac0a0 |
| 2026-07-27 | relay-026 | done | build + api import | 5e1756e |
| 2026-07-27 | relay-025 | done | build | f6809c0 |
| 2026-07-27 | relay-024 | done | build | 0e44f8e |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
