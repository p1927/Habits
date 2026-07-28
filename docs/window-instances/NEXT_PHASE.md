# Next phase — after v0.7.0 wake revert

## Done (v0.7.0)

- Background notify primary; v0.6.2 regression reverted
- preToolUse notify enforcement; SPIN stop-hook recovery
- `cwin status` TIMER/SPIN; `cwin prove-wake|watch|rearm`
- `tick_daemon.sh` for macOS SPIN alerts
- All 4 loops **ARMED** per `prove_wake.sh` (2026-07-28)

## Your verification (required)

1. In each of the 4 Composer chats, confirm the **last Phase 9** used `notify_on_output` (re-paste `keep working` if unsure)
2. Leave one chat **unfocused** for its full interval — confirm it wakes without manual paste
3. If unfocused wake fails → run `bash tools/cursor-loop/scripts/tick_daemon.sh .` in a dedicated terminal tab

## Operator commands

```bash
cwin status          # TIMER / SPIN / INT
cwin prove-wake      # exit 0 = all ready
cwin watch --json    # idle + unhealthy instances
cwin rearm --force   # rearm DOWN/SPIN sleepers (does not add notify — agents must)
bash scripts/window-instance-watchdog.sh .   # optional persistent rearm when code idle
bash tools/cursor-loop/scripts/tick_daemon.sh .   # SPIN macOS notifications
```

## Deferred until unfocused wake proven

- Ritual micro-step hard gates in arm hook
- STATE edit lock expansion

## Commit

Ship `tools/cursor-loop/` v0.7.0 + `docs/window-instances/REGRESSION.md` + `NEXT_PHASE.md` on `main` so fixes do not evaporate again.
