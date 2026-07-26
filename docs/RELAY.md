# Habits Relay — Canonical Agent State

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T00:52:00Z |
| git_branch | main |
| uncommitted_files | 0 (excluding .env.development, cursor metadata) |
| where_we_are | `/loop` 60s armed. relay-004 accessibility pass complete — aria, keyboard swipe actions, live regions on all main tabs. |
| blockers | [] |
| confirmed_next | relay-005 Agent chat camera attach |
| brainstorm_notes | Backlog healthy; no reprioritization |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T00:52:00Z |
| status | ready |
| current_item_id | — |
| cycle_parity | even (next: feature) |
| next_action | relay-005 Agent chat camera attach |
| blockers | [] |
| loops | `/loop` 60s `AGENT_LOOP_TICK_HABITS` (this chat tab) |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [ ] relay-005 | Agent chat camera attach | maintenance
- [ ] relay-006 | Optimistic food log + retry | maintenance
- [ ] relay-007 | Lighthouse PWA score > 90 | maintenance
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
