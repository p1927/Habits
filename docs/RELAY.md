# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T02:46:00Z |
| git_branch | main |
| uncommitted_files | maintenance docs |
| where_we_are | Loop tick #71; relay-078 Home/Day badge tooltips shipped. |
| blockers | [] |
| confirmed_next | relay-079 Day prune stale failed ids after partial sync |
| brainstorm_notes | relay-078 done; all three queue tab badges have hover tooltips |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T02:46:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-079 Day prune stale failed ids after partial sync |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 76081, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-079 | Day prune stale failed ids after partial sync | maintenance
- [ ] relay-080 | Log Plan queue failed-item highlight on sync error | feature
- [ ] relay-081 | Home queue per-item list like Day | feature

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| — | — | — |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-078 | done | build | 8f80018 |
| 2026-07-27 | relay-077 | done | build | 9846db0 |
| 2026-07-27 | relay-076 | done | build | d049090 |
| 2026-07-27 | relay-075 | done | build | d1f3c59 |
| 2026-07-27 | relay-074 | done | build | 9622126 |
| 2026-07-27 | relay-073 | done | build | 2eea036 |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
