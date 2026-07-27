# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T12:36:00Z |
| git_branch | main |
| uncommitted_files | none |
| where_we_are | relay-153–159 shipped; loops verified (worker 60s, code-health 120s). |
| blockers | [] |
| confirmed_next | relay-160 Lighthouse PWA score run |
| brainstorm_notes | Worker 60s / Code 120s — both UP with confirmed ticks |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T12:36:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-160 Lighthouse PWA score baseline |
| blockers | [] |
| loops | **Worker** PID 90274 (60s `AGENT_LOOP_TICK_HABITS`). **Code-health** PID 88459 (120s `AGENT_LOOP_TICK_CODE_HEALTH` — tick confirmed). Verify: `bash tools/cursor-loop/scripts/loop-status.sh`. |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-160 | Lighthouse PWA score baseline | maintenance

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Queue sort parity | relay-130 | done — all queues use `sortQueueByCreatedAt` oldest-first |
| Lighthouse PWA score > 90 | ROADMAP | relay-160 |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-153–158 | done | build | be39deb |
| 2026-07-27 | relay-152 | done | build | 4dfc101 |
| 2026-07-27 | relay-151 | done | build | 0220ba7 |
| 2026-07-27 | relay-149 | done | build | 3bf2d18 |
| 2026-07-27 | relay-150 | done | build | 4e10f9b |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **cursor-loop** — one chat per contract; paste from `docs/START_LOOPS.md`
5. BACKLOG < 3: refill from BRAINSTORM + web research
