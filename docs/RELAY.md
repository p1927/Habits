# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T01:24:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #16; relay-022 Open Food Facts barcode lookup shipped. |
| blockers | [] |
| confirmed_next | relay-023 Offline habit log queue |
| brainstorm_notes | relay-022 done; next maintenance item |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T01:24:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-023 Offline habit log queue |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 2702, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-023 | Offline habit log queue | maintenance
- [ ] relay-024 | Streak count on ring share PNG | maintenance
- [ ] relay-025 | Recipe photo in Log tab | feature

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| OFF product direct log | MyFitnessPal | Server endpoint to log OFF macros without sheet match |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-022 | done | build | pending |
| 2026-07-27 | relay-021 | done | build | ad69715 |
| 2026-07-27 | relay-020 | done | build | 0735602 |
| 2026-07-27 | relay-019 | done | build | 45514a1 |
| 2026-07-27 | relay-018 | done | build | 3fe40e3 |
| 2026-07-27 | relay-017 | done | build | 90dbb9f |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
