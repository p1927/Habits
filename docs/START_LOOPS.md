# Start Agent Loops

> **One paste per Cursor window.** Package: [`tools/cursor-loop`](../../tools/cursor-loop) (submodule).

Fresh clone:

```bash
git submodule update --init tools/cursor-loop
bash tools/cursor-loop/install.sh . --symlink
```

## Habits — four windows

Open one **Agent chat** per row. Paste the message into that chat. Walk away.

| Window | Paste this message |
|--------|-------------------|
| **Worker** (features, 60s) | `@docs/agents/worker-relay.md keep working` |
| **UX** (UI polish, 5m) | `@docs/agents/ux-relay.md keep working` |
| **Code** (refactor, 2m) | `@docs/agents/code-health.md keep working` |
| **PO** (brainstorm, 2m) | `@docs/agents/po-relay.md keep working` |

## Custom task

1. Copy [`tools/cursor-loop/template/AGENT_LOOP_TEMPLATE.md`](../../tools/cursor-loop/template/AGENT_LOOP_TEMPLATE.md) → `docs/agents/my-task.md`
2. Fill **Loop config** (unique `sentinel`) + **Task** + **interval_sec**
3. Paste: `@docs/agents/my-task.md keep working`

## Stop

Say **stop loop** in that chat, or close the Cursor window.

## Upgrade / refresh (cursor-loop 0.4+)

After pulling cursor-loop changes:

```bash
bash tools/cursor-loop/install.sh . --symlink
bash tools/cursor-loop/scripts/refresh-loops.sh .
```

Then paste the contract line again in **each** window (bindings preserved).

## Extreme reset (stuck / duplicate chat / corrupt state)

```bash
bash tools/cursor-loop/scripts/force-reset.sh . --all --yes
bash tools/cursor-loop/scripts/validate_contracts.py .
```

Then paste the contract line again in the **correct** window only.

## After Cursor restart

Paste the same line again in that window.

## Status (optional debug)

```bash
bash tools/cursor-loop/scripts/loop-status.sh
```

## Install cursor-loop in another project

See [`tools/cursor-loop/README.md`](../../tools/cursor-loop/README.md).
