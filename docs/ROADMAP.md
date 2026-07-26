# Habits Development Roadmap

> **Active agent work:** read [`docs/RELAY.md`](RELAY.md) (CHECKPOINT, BACKLOG, IN_PROGRESS, HISTORY).  
> This file is the phase archive and feature map.

## CURRENT_CHECKPOINT (archive)
- phase: 7
- task: "Maintenance mode — continuous verification and polish"
- status: done
- last_verified: 2026-07-27
- next_action: "Pick highest-impact item from Maintenance Backlog"
- blockers: []

## Phase Status
| Phase | Name | Status | Verified |
|-------|------|--------|----------|
| 0 | Foundation & Daemon | done | 2026-07-27 |
| 1 | Health Dashboard | done | 2026-07-27 |
| 2 | Food Scan & Tinder Confirm | done | 2026-07-27 |
| 3 | Day Planner & Timetable | done | 2026-07-27 |
| 4 | Keep-Style Cards | done | 2026-07-27 |
| 5 | Gemini-Style Agent Hub | done | 2026-07-27 |
| 6 | Future Self Polish | done | 2026-07-27 |
| 7 | Continuous Verification | done | 2026-07-27 |

## Maintenance Backlog (priority order)
1. Wire VoiceStatusOrb to local-voice-ai postMessage for real mic state
2. Recipes tab (`Save Reciepe` sheet) — browse and log from saved recipes
3. Meal plan quick-add from WEEK MEALS sheet
4. Accessibility audit (ARIA, focus rings, contrast)
5. Optimistic UI + retry on food log failures
6. Lighthouse PWA score > 90

## Session Log (append only)
- 2026-07-26: Plan approved. Checkpoint at Phase 0.
- 2026-07-27: Phase 0 complete — docs, tokens, UI primitives, loop armed.
- 2026-07-27: Phases 1–7 implemented — Home/Log/Day/Cards/Agent tabs, all backend routes, PWA build passes.

## Implemented Features Summary

### Navigation
- Home (default), Log, Day, Cards, Coach (agent), Settings (header gear)

### Backend routes added
- `GET /api/food/history`, `GET /api/food/targets`, `POST /api/food/scan`
- `GET/PUT /api/day/manage`
- `GET/POST/DELETE /api/cards`
- `POST /api/agent/chat`

### Key files
- `pwa/src/sections/Home.tsx` — rings, macros, sparkline, daily decision card
- `pwa/src/sections/Log.tsx` — scan/type/history with swipe confirm
- `pwa/src/sections/Day.tsx` — timeline + habit grid
- `pwa/src/sections/Cards.tsx` — Keep-style pinboard
- `pwa/src/sections/Agent.tsx` — Gemini-style chat + voice sheet
- `pwa/src/components/ui/` — Card, Ring, SwipeStack, BottomSheet
- `docs/AGENT_SESSION.md` — wake prompt for loop daemon
