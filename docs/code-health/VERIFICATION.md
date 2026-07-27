# Code Health Verification

## Build (required every tick with code changes)

```bash
cd pwa && npm run build
```

## Server (when Python touched)

```bash
cd server && python -m compileall habits_api
```

## Regression spot-checks (when touching listed areas)

| Area | Check |
|------|--------|
| Meal plan queue | Dismiss all clears failed ids; remote banner navigates |
| Log swipe | Swipe directions + undo toast |
| Cards | Search/filter + FAB create |
| Offline | Queue banners when server offline |

## Loop health

- [ ] `AGENT_LOOP_TICK_CODE_HEALTH` PID alive
- [ ] STATE `LAST_REVIEW.reviewed_at` updated this tick
