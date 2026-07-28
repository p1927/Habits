# Autonomous loop provisioning — v0.9.3

## One command (reuse existing Habits window + Agent tabs)

```bash
cwin migrate-autonomous
```

Finds your existing Habits Cursor window, focuses each loop's Agent tab (by `loop_id` / binding), pastes bind **only when unbound**, records `SLOT` metadata, triggers first ticks, verifies `prove-wake`, starts `tick_daemon`.

Nuclear rebinding (wipes locks first):

```bash
cwin migrate-autonomous --reset-locks
```

If Habits window is not open:

```bash
cwin migrate-autonomous --create-window
```

## Commands

```bash
cwin status                    # SLOT + OP_WAKE columns (shared Habits window slot)
cwin migrate-autonomous        # reuse-first (default)
cwin migrate-autonomous --reset-locks   # force-reset + rebind
cwin provision-all             # provision only (no prove-wake poll)
cwin trigger-all --force       # inject when NOTIFY=yes only
cwin bind-hint worker-relay    # slot, conversation_id metadata
bash tools/cursor-loop/scripts/tick_daemon.sh .
```

## Steady state

- All four loops share one `ui_window_slot` (Habits window index)
- Each loop differs by `chat_title` / Agent tab match (`loop_id`)
- Unhealthy loops without NOTIFY → macOS notify; focus chat and paste manually
- Phase 9 notify arm → `OP_WAKE=ready` / `NOTIFY=yes`

## Recovery (SPIN / orphan / STALE)

```bash
cwin migrate-autonomous
# or
cwin trigger-all --force
```
