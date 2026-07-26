# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T01:20:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #14; relay-020 habit ring share PNG shipped. |
| blockers | [] |
| confirmed_next | relay-021 Meal photo lightbox on Home |
| brainstorm_notes | relay-020 done; next maintenance item |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T01:20:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-021 Meal photo lightbox on Home |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 2702, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-021 | Meal photo lightbox on Home | maintenance
- [ ] relay-022 | Barcode Open Food Facts lookup | feature
- [ ] relay-023 | Offline habit log queue | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Share card with streak count | Strava | Add streak to ring PNG |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-020 | done | build | pending |
| 2026-07-27 | relay-019 | done | build | 45514a1 |
| 2026-07-27 | relay-018 | done | build | 3fe40e3 |
| 2026-07-27 | relay-017 | done | build | 90dbb9f |
| 2026-07-27 | relay-016 | done | build | 822b082 |
| 2026-07-27 | relay-015 | done | build | 73030fe |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
