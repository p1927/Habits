# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T00:58:00Z |
| git_branch | main |
| uncommitted_files | docs/RELAY.md checkpoint only |
| where_we_are | Loop tick #3; relay-007 Lighthouse pass — perf 99, a11y/SEO/best-practices 100 on preview. |
| blockers | [] |
| confirmed_next | relay-010 Weekly habit sparklines on Home |
| brainstorm_notes | Backlog at 3 items; refill from BRAINSTORM on next odd cycle |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T00:58:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | odd (next: maintenance) |
| next_action | relay-010 Weekly habit sparklines on Home |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (PID 2702, running) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-010 | Weekly habit sparklines on Home | feature
- [ ] relay-011 | Offline food log queue | feature

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Streak badges on Day tab | Apple Fitness | Consecutive days hitting targets |
| Barcode scan | MyFitnessPal | BarcodeDetector API |
| Sickness timeline | Google Keep + Health | Chart from Sickness sheet |
| Meal photo gallery | Apple Health | Thumbnails for today's log |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-007 | done | lighthouse preview 99–100 | 523b01f |
| 2026-07-27 | relay-006 | done | build | 708aa91 |
| 2026-07-27 | relay-005 | done | build | b661c4b |
| 2026-07-27 | relay-004 | done | build | 2a395cc |
| 2026-07-27 | relay-v2 | done | build | bd0cc1f + ritual docs |
| 2026-07-27 | relay-003 | done | build | meal plan API + Day tab |
| 2026-07-27 | git-catchup | done | — | 004a76f, 73adfe1, 11e1f3f, livekit rm |
| 2026-07-27 | relay-002 | done | build | recipes API + Log tab |
| 2026-07-27 | relay-001 | done | build | voice postMessage orb |

---

## Cycle rules

1. Every wake: **Review → Brainstorm → Execute → Verify → Commit → Update RELAY**
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. **In-session `/loop`** — 60s `AGENT_LOOP_TICK_HABITS`; chain items while chat is open
5. BACKLOG < 3: refill from BRAINSTORM + web research
