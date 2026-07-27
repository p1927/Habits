# Agent Loop — UX Relay

> **Paste in UX window:** `@docs/agents/ux-relay.md keep working`

## Loop config

| Field | Value |
|-------|-------|
| loop_id | `ux-relay` |
| sentinel | `AGENT_LOOP_TICK_UX_RELAY` |
| wake_sentinel | `AGENT_LOOP_WAKE_UX_RELAY` |
| interval_sec | `300` |
| monitor_regex | `^AGENT_LOOP_TICK_UX_RELAY` |
| pidfile | `$TMPDIR/cursor-loop-ux-relay.pid` |
| loop_script | `tools/cursor-loop/scripts/agent-loop.sh` |
| state_file | `docs/maintenance/STATE.md` |
| contract_doc | `docs/agents/ux-relay.md` |

---

## Task

UI/UX polish — web research, backlog, ship modern UI matching reference apps.

**Read first:** [`docs/maintenance/UX_RELAY_AGENT.md`](../maintenance/UX_RELAY_AGENT.md)

**Do NOT:** relay features, code-health refactors, PO brainstorm.

**Ignore sentinels:** `AGENT_LOOP_TICK_HABITS`, `AGENT_LOOP_TICK_CODE_HEALTH`, `AGENT_LOOP_TICK_MAINTENANCE`

---

## Ritual (every tick)

1. Read this file + [`UX_RELAY_AGENT.md`](../maintenance/UX_RELAY_AGENT.md)
2. CHARTER → STATE → check `CHECKPOINT.next_mode`
3. Web research before UI changes
4. Ship one `UI_POLISH_BACKLOG` item (Mode C) or brainstorm (Mode B)
5. Update STATE HISTORY; verify build + 390px visual

Arming and loop survival: **`.cursor/rules/agent-loop-contract.mdc`**

---

## Stop

**stop loop** in this chat. Extreme reset: `bash tools/cursor-loop/scripts/force-reset.sh . --all`
