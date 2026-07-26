# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T01:30:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #19; relay-025 recipe photo in Log tab shipped. |
| blockers | [] |
| confirmed_next | relay-026 OFF product direct log without sheet match |
| brainstorm_notes | relay-025 done; next feature item |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T01:30:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-026 OFF product direct log without sheet match |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 2702, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-026 | OFF product direct log without sheet match | feature
- [ ] relay-027 | Habit queue retry UI | maintenance
- [ ] relay-028 | Cache streak for offline share PNG | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Recipe scan + log | MyFitnessPal | AI identify prepared recipe from photo |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-025 | done | build | f6809c0 |
| 2026-07-27 | relay-024 | done | build | 0e44f8e |
| 2026-07-27 | relay-023 | done | build | 054db1f |
| 2026-07-27 | relay-022 | done | build | 7f68d35 |
| 2026-07-27 | relay-021 | done | build | ad69715 |
| 2026-07-27 | relay-020 | done | build | 0735602 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
