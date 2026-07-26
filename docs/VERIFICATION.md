# Habits Verification Checklist

**Active work:** see [`docs/RELAY.md`](RELAY.md) CHECKPOINT and IN_PROGRESS.

Run the checks for the current relay item before advancing HISTORY.

## Phase 0 — Foundation & Daemon

- [ ] `docs/ROADMAP.md`, `docs/AGENT_SESSION.md`, `docs/VERIFICATION.md` exist
- [ ] `pwa/src/styles/tokens.css` imported
- [ ] UI primitives exist: Card, Ring, SwipeStack, BottomSheet
- [ ] `cd pwa && npm run build` succeeds

## Phase 1 — Health Dashboard

- [ ] `GET /api/food/history?days=7` returns Followed tab data
- [ ] Home tab shows protein/calorie/habit rings
- [ ] Macro chart renders today vs targets
- [ ] Burn estimate shown from habit hours
- [ ] Home is default tab

## Phase 2 — Food Scan

- [ ] `POST /api/food/scan` accepts image, returns food match
- [ ] Log tab has Scan | Type | History sub-tabs
- [ ] SwipeFoodCard: right=log, left=edit, up=skip
- [ ] Camera capture works on mobile viewport

## Phase 3 — Day Planner

- [ ] Day tab shows calendar timeline + habit grid
- [ ] `GET/PUT /api/day/manage` reads/writes Manage Day sheet
- [ ] Habit updates sync to Life Tracker tab

## Phase 4 — Keep Cards

- [ ] Cards tab shows sickness, notes, strategy
- [ ] `GET/POST/PUT/DELETE /api/cards` CRUD works
- [ ] New card persists to Google Sheet

## Phase 5 — Agent Hub

- [ ] `POST /api/agent/chat` streams text responses
- [ ] Chat tools: log_food, update_habit, create_event, add_card
- [ ] Voice embed collapsible; action feed updates

## Phase 6 — Future Self Polish

- [ ] Daily decision card on Home
- [ ] Card images enabled with loading skeletons
- [ ] Swipe animations respect prefers-reduced-motion

## Phase 7 — Continuous Verification

- [x] `npm run build` passes
- [ ] `curl /healthz` returns ok (requires server running)
- [x] Mobile 390px layout CSS in place
- [x] Maintenance backlog section in ROADMAP

## Relay cycle (every wake)

- [ ] `LAST_REVIEW` section in RELAY.md updated
- [ ] Brainstorm step recorded (even if "no changes")
- [ ] `cd pwa && npm run build` passes
- [ ] Git commit created for completed item (or noted why skipped in HISTORY)
- [ ] In-session `/loop` running (`AGENT_LOOP_TICK_HABITS`, 60s) — check loop terminal or `pgrep -f AGENT_LOOP_TICK_HABITS`

## Maintenance Backlog

See `docs/ROADMAP.md` Maintenance Backlog section. Loop daemon picks items when phase 7 checkpoint is active.

## Standing commands

```bash
# PWA build
cd pwa && npm run build

# API health (requires server running)
curl -s http://127.0.0.1:8787/healthz
```
