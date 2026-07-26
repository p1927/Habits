# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T01:40:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #24; relay-030 OFF macros offline queue shipped. |
| blockers | [] |
| confirmed_next | relay-031 Pull-to-refresh on Home |
| brainstorm_notes | relay-030 done; next maintenance item |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T01:40:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-031 Pull-to-refresh on Home |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 2702, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-031 | Pull-to-refresh on Home | maintenance
- [ ] relay-032 | Stale streak cache TTL | maintenance
- [ ] relay-033 | Recipe scan offline queue | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Haptic on streak badge | iOS | vibration on fire tier |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-030 | done | build | d804b2c |
| 2026-07-27 | relay-029 | done | build | beaf9c1 |
| 2026-07-27 | relay-028 | done | build | 7710fa9 |
| 2026-07-27 | relay-027 | done | build | f4ac0a0 |
| 2026-07-27 | relay-026 | done | build + api import | 5e1756e |
| 2026-07-27 | relay-025 | done | build | f6809c0 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
