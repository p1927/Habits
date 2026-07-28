# Window Instance — ux-critic

> **Paste in window:** `@docs/window-instances/ux-critic/INSTANCE.md keep working`

## Loop config

| Field | Value |
|-------|-------|
| loop_id | `ux-critic` |
| loop_mode | `dynamic` |
| sentinel | `AGENT_LOOP_TICK_UX_CRITIC` |
| wake_sentinel | `AGENT_LOOP_WAKE_UX_CRITIC` |
| interval_sec | `300` |
| monitor_regex | `^AGENT_LOOP_WAKE_UX_CRITIC` |
| pidfile | `$TMPDIR/cursor-loop-ux-critic.pid` |
| loop_script | `tools/cursor-loop/scripts/agent-loop.sh` |
| state_file | `docs/window-instances/ux-critic/STATE.md` |
| contract_doc | `docs/window-instances/ux-critic/INSTANCE.md` |
| archetype | `product` |
| instance_version | `2` |

### Phase 9 arm (copy env from table above)

```bash
LOOP_ID=ux-critic \
WAKE_SENTINEL=AGENT_LOOP_WAKE_UX_CRITIC \
INTERVAL=300 \
CONTRACT_DOC=docs/window-instances/ux-critic/INSTANCE.md \
STATE_FILE=docs/window-instances/ux-critic/STATE.md \
bash tools/cursor-loop/scripts/arm-wake.sh

bash tools/cursor-loop/scripts/verify-wake.sh ux-critic   # must exit 0 before ending turn
```

After notify-armed sleepers are running, operators can inject wakes without paste: `cwin trigger-all` (see RITUAL Phase 9).

See [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md) Phase 9 and agent-loop-contract.mdc.

---

## Bundle

| File | Purpose |
|------|---------|
| [IDENTITY.md](IDENTITY.md) | Role, skills, forbidden |
| [RITUAL.md](RITUAL.md) | 9-phase tick |
| [STATE.md](STATE.md) | Backlog, checkpoint, history |

## Summary

UX critic — brainstorm, web research, app teardown; feeds ux-relay CRITIQUE_BACKLOG (no code)

Arming and loop survival: [`.cursor/rules/agent-loop-contract.mdc`](../../../.cursor/rules/agent-loop-contract.mdc) (mandatory every turn).

## Stop

**stop loop** in this chat. Extreme reset: `bash tools/cursor-loop/scripts/force-reset.sh . --all`
