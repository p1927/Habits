# Agent Loop — Worker Relay

> **Paste in Worker window:** `@docs/agents/worker-relay.md keep working`

## Loop config

| Field | Value |
|-------|-------|
| loop_id | `worker-relay` |
| sentinel | `AGENT_LOOP_TICK_HABITS` |
| wake_sentinel | `AGENT_LOOP_WAKE_HABITS` |
| interval_sec | `60` |
| monitor_regex | `^AGENT_LOOP_TICK_HABITS` |
| pidfile | `$TMPDIR/cursor-loop-worker-relay.pid` |
| loop_script | `tools/cursor-loop/scripts/agent-loop.sh` |
| state_file | `docs/RELAY.md` |
| contract_doc | `docs/agents/worker-relay.md` |

---

## Task

Ship Habits features from the relay backlog. Full engineer ritual on every tick.

**Read first:** [`docs/AGENT_SESSION.md`](../AGENT_SESSION.md) (wake ritual, commit protocol, architecture).

**State:** [`docs/RELAY.md`](../RELAY.md) — CHECKPOINT, IN_PROGRESS, BACKLOG, HISTORY.

**Ignore sentinels:** `AGENT_LOOP_TICK_UX_RELAY`, `AGENT_LOOP_TICK_CODE_HEALTH`, `AGENT_LOOP_TICK_MAINTENANCE`

---

## Ritual (every tick)

Follow [`docs/AGENT_SESSION.md`](../AGENT_SESSION.md) seven steps:

Review RELAY + git → Brainstorm → Execute top backlog → Verify build → Commit → Update RELAY.

Chain backlog items within the same wake when possible. User is unavailable — do not ask questions unless impossible.

Arming and loop survival: **`.cursor/rules/agent-loop-contract.mdc`** (mandatory every turn).

---

## Stop

**stop loop** in this chat. Extreme reset: `bash tools/cursor-loop/scripts/force-reset.sh . --all`
