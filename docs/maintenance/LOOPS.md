# Habits — Four Chat Windows (Loop Architecture)

> **User cheat sheet:** [`docs/START_LOOPS.md`](../START_LOOPS.md) — one paste per window.  
> **Package:** [`tools/cursor-loop/`](../../tools/cursor-loop/) — standalone git submodule.  
> Fresh clone: `git submodule update --init tools/cursor-loop` then `bash tools/cursor-loop/install.sh . --symlink`  
> **Contracts:** [`docs/agents/`](../agents/) — per-window loop docs.

> **Read this when arming or debugging loops.** One chat window = one loop = one PID. Never stack duplicates in the same window.

## Overview

| # | Window | Role | Wake doc | Sentinel | Script | Interval | PID file |
|---|--------|------|----------|----------|--------|----------|----------|
| 1 | **Worker** | Ship features (relay) | [`docs/agents/worker-relay.md`](../agents/worker-relay.md) | `AGENT_LOOP_TICK_HABITS` | `tools/cursor-loop/scripts/agent-loop.sh` | 60s | `$TMPDIR/cursor-loop-worker-relay.pid` |
| 2 | **UX** | UI design + polish | [`docs/agents/ux-relay.md`](../agents/ux-relay.md) | `AGENT_LOOP_TICK_UX_RELAY` | `tools/cursor-loop/scripts/agent-loop.sh` | 300s | `$TMPDIR/cursor-loop-ux-relay.pid` |
| 3 | **Code** | Bugs, refactor, structure | [`docs/agents/code-health.md`](../agents/code-health.md) | `AGENT_LOOP_TICK_CODE_HEALTH` | `tools/cursor-loop/scripts/agent-loop.sh` | 120s | `$TMPDIR/cursor-loop-code-health.pid` |
| 4 | **PO** | Product owner / business brainstorm | [`docs/agents/po-relay.md`](../agents/po-relay.md) | `AGENT_LOOP_TICK_MAINTENANCE` | `tools/cursor-loop/scripts/agent-loop.sh` | 120s | `$TMPDIR/cursor-loop-po-relay.pid` |

**Not four loops in one chat.** Each window runs **exactly one** background shell with **its own sentinel** and **its own PID**. Shared state lives in docs (`STATE.md`, `docs/code-health/STATE.md`, `RELAY.md`) — windows coordinate via files, not shared processes.

---

## What each window does (no overlap)

| Window | Does | Does NOT |
|--------|------|----------|
| **Worker** | RELAY backlog, features, commits | UI polish, PO brainstorm, code-health refactors |
| **UX** | Web research, `UI_POLISH_BACKLOG`, ship CSS/components (21st + ui-ux-pro-max) | Relay features, structural refactors, PO backlog scoring |
| **Code** | `REFACTOR_BACKLOG`, line scan, DRY, naming, bug fixes in structure | UI polish, product brainstorm, relay features |
| **PO** | 3-lens brainstorm (UX / PO / business), mutate `UX_BACKLOG`, `QUALITY_BACKLOG`, feed `RELAY.md` | Ship UI (→ UX window), ship features (→ Worker), refactor (→ Code) |

Legacy name: PO window uses sentinel `AGENT_LOOP_TICK_MAINTENANCE` and folder `docs/maintenance/` — treat **maintenance = PO relay**, not a combined A/B/C worker.

---

## Arming a loop (every window)

1. **Check existing PID** — do not spawn if already running:

```bash
bash tools/cursor-loop/scripts/loop-status.sh
# or per window:
test -f "${TMPDIR:-/tmp}/cursor-loop-worker-relay.pid" && kill -0 "$(cat "${TMPDIR:-/tmp}/cursor-loop-worker-relay.pid")" && echo "WORKER UP" || echo "WORKER DOWN"
test -f "${TMPDIR:-/tmp}/cursor-loop-ux-relay.pid" && kill -0 "$(cat "${TMPDIR:-/tmp}/cursor-loop-ux-relay.pid")" && echo "UX UP" || echo "UX DOWN"
test -f "${TMPDIR:-/tmp}/cursor-loop-code-health.pid" && kill -0 "$(cat "${TMPDIR:-/tmp}/cursor-loop-code-health.pid")" && echo "CODE UP" || echo "CODE DOWN"
test -f "${TMPDIR:-/tmp}/cursor-loop-po-relay.pid" && kill -0 "$(cat "${TMPDIR:-/tmp}/cursor-loop-po-relay.pid")" && echo "PO UP" || echo "PO DOWN"
```

2. **Start one shell** with output monitoring on the sentinel regex (required for chat wake).
3. **Run the ritual once immediately** when arming; first automated tick fires after the first `sleep`.
4. **Record PID + shell id** in the relevant `STATE.md` → `CHECKPOINT.loops` (each doc tracks its own loop only).

### Cursor session stability

Background loops may abort when Cursor cleans up agent shells. The **stop hook** + **loop survival** rule re-arm automatically. If a loop stays down, paste the contract line again from [`START_LOOPS.md`](../START_LOOPS.md).

---

## Monitor regex (notify_on_output)

| Window | Pattern |
|--------|---------|
| Worker | `^AGENT_LOOP_TICK_HABITS` |
| UX | `^AGENT_LOOP_TICK_UX_RELAY` |
| Code | `^AGENT_LOOP_TICK_CODE_HEALTH` |
| PO | `^AGENT_LOOP_TICK_MAINTENANCE` |

---

## Stop one loop without killing others

Say **stop loop** in that chat, or:

```bash
kill "$(cat "${TMPDIR:-/tmp}/cursor-loop-worker-relay.pid")"   # Worker
kill "$(cat "${TMPDIR:-/tmp}/cursor-loop-ux-relay.pid")"     # UX
kill "$(cat "${TMPDIR:-/tmp}/cursor-loop-code-health.pid")"  # Code
kill "$(cat "${TMPDIR:-/tmp}/cursor-loop-po-relay.pid")"     # PO
```

Remove stale pidfiles under `$TMPDIR/cursor-loop-*.pid` or legacy `$TMPDIR/habits-*-loop.pid` if the process died.

---

## Shared vs per-window state

| Doc | Owner |
|-----|-------|
| [`docs/RELAY.md`](../RELAY.md) | Worker writes; PO/UX feed backlog items |
| [`docs/maintenance/STATE.md`](STATE.md) | PO + UX read; PO mutates backlogs; UX closes `ui-*` |
| [`docs/code-health/STATE.md`](../code-health/STATE.md) | Code window only |

When two windows might touch the same file, PO updates backlog only; UX or Code implements; Worker only if it's a user-facing feature.
