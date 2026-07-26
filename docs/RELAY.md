# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T01:26:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #17; relay-023 offline habit log queue shipped. |
| blockers | [] |
| confirmed_next | relay-024 Streak count on ring share PNG |
| brainstorm_notes | relay-023 done; next maintenance item |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T01:26:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-024 Streak count on ring share PNG |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 2702, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-024 | Streak count on ring share PNG | maintenance
- [ ] relay-025 | Recipe photo in Log tab | feature
- [ ] relay-026 | OFF product direct log without sheet match | feature

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Habit queue retry UI | food log pattern | Dismiss/retry failed habit syncs |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-023 | done | build | 054db1f |
| 2026-07-27 | relay-022 | done | build | 7f68d35 |
| 2026-07-27 | relay-021 | done | build | ad69715 |
| 2026-07-27 | relay-020 | done | build | 0735602 |
| 2026-07-27 | relay-019 | done | build | 45514a1 |
| 2026-07-27 | relay-018 | done | build | 3fe40e3 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
