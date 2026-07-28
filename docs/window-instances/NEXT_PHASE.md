# Autonomous loop provisioning — v0.9.1

## One command (agent-run, zero manual steps)

```bash
cwin migrate-autonomous --force
```

Opens four dedicated Cursor windows, binds each loop, records `SLOT` metadata, triggers first ticks, verifies `prove-wake`, starts `tick_daemon`.

## Commands

```bash
cwin status                    # SLOT + OP_WAKE columns
cwin migrate-autonomous --force
cwin provision-all --force     # provision only (no prove-wake poll)
cwin trigger-all --force       # ladder: inject (NOTIFY=yes) → ui_push by SLOT
cwin bind-hint worker-relay     # slot, conversation_id metadata
bash tools/cursor-loop/scripts/tick_daemon.sh .
```

## Steady state

- Each loop has `ui_window_slot` in binding (1-based Cursor window index)
- `ui_push` targets window slot — no manual tab rename required
- Phase 9 notify arm → `OP_WAKE=ready` / `NOTIFY=yes`

## Recovery (SPIN / orphan / STALE)

```bash
cwin migrate-autonomous --force
# or
cwin trigger-all --force
```
