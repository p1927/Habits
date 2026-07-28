# Window Instance — po-relay

> **Paste in PO window:** `@docs/window-instances/po-relay/INSTANCE.md keep working`

## Loop config

| Field | Value |
|-------|-------|
| loop_id | `po-relay` |
| loop_mode | `dynamic` |
| sentinel | `AGENT_LOOP_TICK_PO_RELAY` |
| wake_sentinel | `AGENT_LOOP_WAKE_PO_RELAY` |
| interval_sec | `120` |
| monitor_regex | `^AGENT_LOOP_WAKE_PO_RELAY` |
| pidfile | `$TMPDIR/cursor-loop-po-relay.pid` |
| loop_script | `tools/cursor-loop/scripts/agent-loop.sh` |
| state_file | `docs/window-instances/po-relay/STATE.md` |
| contract_doc | `docs/window-instances/po-relay/INSTANCE.md` |
| archetype | `product` |
| instance_version | `2` |

---

## Bundle

| File | Purpose |
|------|---------|
| [IDENTITY.md](IDENTITY.md) | Role, skills, forbidden |
| [RITUAL.md](RITUAL.md) | 9-phase tick |
| [STATE.md](STATE.md) | Backlog, checkpoint, history |

## Summary

Product owner — 3-lens brainstorm, mutate backlogs, feed Worker/UX/Code (see IDENTITY Handoffs).

Arming: [`.cursor/rules/agent-loop-contract.mdc`](../../../.cursor/rules/agent-loop-contract.mdc)

## Regression guards

- Phase 9: background `ARM_COMMAND` + `notify_on_output` — see [../REGRESSION.md](../REGRESSION.md)
- `cwin status`: SPIN = sentinel fired without tick; ARMED only means sleeper alive
- Do not use steady-state `--exec`; recovery only with `--recovery-foreground`

## Stop

**stop loop** in this chat.
