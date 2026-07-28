# Operator wake — v0.9.0 ladder

## Commands

```bash
cwin status                    # OP_WAKE column: ready | inject_ok | ui_push | queued | needs_bind
cwin trigger-all --force       # ladder: inject (NOTIFY=yes) → macOS ui_push
cwin trigger-all --mode inject-only
cwin trigger-all --mode ui-push-only --loop-id worker-relay
cwin bootstrap-wake --all      # unbound: clipboard + notify
cwin bind-hint worker-relay    # rename tab to loop_id for ui_push
bash tools/cursor-loop/scripts/tick_daemon.sh .
```

## One-time setup

1. Bind each chat: `@docs/window-instances/<loop_id>/INSTANCE.md keep working`
2. **Rename Composer tab to `loop_id`** (e.g. `worker-relay`) for ui_push focus
3. Grant **Accessibility** to Terminal for ui_push (System Settings → Privacy)
4. Phase 9 notify arm → `OP_WAKE=ready` / `NOTIFY=yes`

## Recovery (SPIN / orphan / STALE)

```bash
cwin trigger-all --force
```

Uses ui_push when NOTIFY is not attached — no manual paste if Accessibility + tab titles are set.
