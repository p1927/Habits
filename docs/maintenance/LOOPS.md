# Habits — Four Chat Windows (Loop Architecture)

> **User cheat sheet:** [`docs/START_LOOPS.md`](../START_LOOPS.md) — one paste per window.  
> **Package:** [`tools/cursor-loop/`](../../tools/cursor-loop/) v0.4+ — **dynamic wake** default.  
> Install/upgrade: `bash tools/cursor-loop/install.sh . --symlink`

> **One chat = one loop_id.** Default mode **`dynamic`**: each turn ends with `arm-wake.sh` (one monitored `sleep && echo`), not a persistent `while true`.

## Overview

| # | Window | loop_id | Wake sentinel | Interval | Wake check |
|---|--------|---------|---------------|----------|------------|
| 1 | **Worker** | `worker-relay` | `AGENT_LOOP_WAKE_HABITS` | 60s | `verify-wake.sh worker-relay` |
| 2 | **UX** | `ux-relay` | `AGENT_LOOP_WAKE_UX_RELAY` | 300s | `verify-wake.sh ux-relay` |
| 3 | **Code** | `code-health` | `AGENT_LOOP_WAKE_CODE_HEALTH` | 120s | `verify-wake.sh code-health` |
| 4 | **PO** | `po-relay` | `AGENT_LOOP_WAKE_MAINTENANCE` | 120s | `verify-wake.sh po-relay` |

Contracts: [`docs/agents/`](../agents/). Rule: [`.cursor/rules/agent-loop-contract.mdc`](../../.cursor/rules/agent-loop-contract.mdc).

---

## Arming (dynamic — default)

After `@docs/agents/<contract>.md keep working`, the agent each turn:

1. Runs **Ritual deliverable** (ship work — not infra-only)
2. Runs `checkpoint-loop.sh --product --evidence <id>`
3. Starts **`arm-wake.sh`** with `notify_on_output` on `^AGENT_LOOP_WAKE_*`

Status:

```bash
bash tools/cursor-loop/scripts/loop-status.sh
bash tools/cursor-loop/scripts/doctor.sh .
```

---

## Refresh after cursor-loop upgrade

Stops legacy persistent shells; keeps bindings:

```bash
bash tools/cursor-loop/scripts/refresh-loops.sh .
```

Then in **each** chat: `@docs/agents/<contract>.md keep working`

---

## Monitor regex (notify_on_output)

| Window | Pattern |
|--------|---------|
| Worker | `^AGENT_LOOP_WAKE_HABITS` |
| UX | `^AGENT_LOOP_WAKE_UX_RELAY` |
| Code | `^AGENT_LOOP_WAKE_CODE_HEALTH` |
| PO | `^AGENT_LOOP_WAKE_MAINTENANCE` |

---

## Stop one loop

Say **stop loop** in that chat, or:

```bash
bash tools/cursor-loop/scripts/refresh-loops.sh . --loop-id ux-relay
```

---

## Extreme reset

```bash
bash tools/cursor-loop/scripts/force-reset.sh . --all --yes
bash tools/cursor-loop/scripts/validate_contracts.py .
```

Scoped: `force-reset.sh . --loop-id worker-relay --yes`

---

## Cursor session stability

Persistent `while true` shells often SIGTERM ~20–40s. **Dynamic wake** avoids that. Recovery wakes must still **ship Ritual work** before re-arm (see agent-loop-contract).

---

## Shared vs per-window state

| Doc | Owner |
|-----|-------|
| [`docs/RELAY.md`](../RELAY.md) | Worker |
| [`docs/maintenance/STATE.md`](STATE.md) | PO + UX |
| [`docs/code-health/STATE.md`](../code-health/STATE.md) | Code |
