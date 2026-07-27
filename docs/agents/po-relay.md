# Agent Loop — PO Relay

> **Paste in PO window:** `@docs/agents/po-relay.md keep working`

## Loop config

| Field | Value |
|-------|-------|
| loop_id | `po-relay` |
| sentinel | `AGENT_LOOP_TICK_MAINTENANCE` |
| wake_sentinel | `AGENT_LOOP_WAKE_MAINTENANCE` |
| interval_sec | `120` |
| monitor_regex | `^AGENT_LOOP_TICK_MAINTENANCE` |
| pidfile | `$TMPDIR/cursor-loop-po-relay.pid` |
| loop_script | `tools/cursor-loop/scripts/agent-loop.sh` |
| state_file | `docs/maintenance/STATE.md` |
| contract_doc | `docs/agents/po-relay.md` |

---

## Task

Product owner / business brainstorm — 3-lens sessions, mutate backlogs, feed RELAY. No UI/code shipping.

**Read first:** [`docs/maintenance/PO_RELAY_AGENT.md`](../maintenance/PO_RELAY_AGENT.md)

**Ignore sentinels:** `AGENT_LOOP_TICK_HABITS`, `AGENT_LOOP_TICK_UX_RELAY`, `AGENT_LOOP_TICK_CODE_HEALTH`

---

## Ritual (every tick)

1. Read this file + [`PO_RELAY_AGENT.md`](../maintenance/PO_RELAY_AGENT.md)
2. STATE → BRAINSTORM → APP_INSPIRATION
3. Run UX / PO / business lens session
4. Mutate backlogs; feed feature items to [`docs/RELAY.md`](../RELAY.md)

Arming and loop survival: **`.cursor/rules/agent-loop-contract.mdc`**

---

## Stop

**stop loop** in this chat. Extreme reset: `bash tools/cursor-loop/scripts/force-reset.sh . --all`
