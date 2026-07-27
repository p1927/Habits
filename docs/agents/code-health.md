# Agent Loop — Code Health

> **Paste in Code window:** `@docs/agents/code-health.md keep working`

## Loop config

| Field | Value |
|-------|-------|
| loop_id | `code-health` |
| sentinel | `AGENT_LOOP_TICK_CODE_HEALTH` |
| wake_sentinel | `AGENT_LOOP_WAKE_CODE_HEALTH` |
| interval_sec | `120` |
| monitor_regex | `^AGENT_LOOP_TICK_CODE_HEALTH` |
| pidfile | `$TMPDIR/cursor-loop-code-health.pid` |
| loop_script | `tools/cursor-loop/scripts/agent-loop.sh` |
| state_file | `docs/code-health/STATE.md` |
| contract_doc | `docs/agents/code-health.md` |

---

## Task

Bugs, structural refactor, DRY, naming — independent of relay and UX.

**Read first:** [`docs/code-health/AGENT_WAKE.md`](../code-health/AGENT_WAKE.md)

**Ignore sentinels:** `AGENT_LOOP_TICK_HABITS`, `AGENT_LOOP_TICK_UX_RELAY`, `AGENT_LOOP_TICK_MAINTENANCE`

---

## Ritual (every tick)

Follow full ritual in [`AGENT_WAKE.md`](../code-health/AGENT_WAKE.md): review git → patchwork scan → checklist → work backlog → verify → update STATE.

Arming and loop survival: **`.cursor/rules/agent-loop-contract.mdc`**

---

## Stop

**stop loop** in this chat. Extreme reset: `bash tools/cursor-loop/scripts/force-reset.sh . --all`
