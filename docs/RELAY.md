# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T01:16:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #12; relay-018 streak badge animations shipped. |
| blockers | [] |
| confirmed_next | relay-019 Notification click opens Log tab |
| brainstorm_notes | relay-018 done; next maintenance item |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T01:16:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-019 Notification click opens Log tab |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 2702, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-019 | Notification click opens Log tab | maintenance
- [ ] relay-020 | Habit ring share card PNG export | feature

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Barcode Open Food Facts lookup | MyFitnessPal | External API for unknown barcodes |
| Meal photo lightbox on Home | Apple Photos | Tap thumbnail for full view |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-018 | done | build | pending |
| 2026-07-27 | relay-017 | done | build | 90dbb9f |
| 2026-07-27 | relay-016 | done | build | 822b082 |
| 2026-07-27 | relay-015 | done | build | 73030fe |
| 2026-07-27 | relay-014 | done | build + api import | 51ef13d |
| 2026-07-27 | relay-013 | done | build | 6bb3973 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
