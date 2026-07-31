# Hermes Loop

Drive multiple Hermes sub-agents as **window instances** — each with its own contract, state, identity, and ritual. From your seat, the observable behavior matches "four persistent terminals working in parallel"; the underlying mechanism is **one scheduled tick per worker**, scheduled natively by `hermes cron`.

This sits alongside `tools/cursor-loop/` during transition. Both can run at once.

See [`docs/hermes-loop/PLAN.md`](../../docs/hermes-loop/PLAN.md) and [`docs/hermes-loop/DECISIONS-SLICE-B.md`](../../docs/hermes-loop/DECISIONS-SLICE-B.md) for the full plan + slice defaults.

## What's wired up

  * `python -m hermes_loop tick <id> [--dry-run]` — invokes `hermes chat` against a fresh wake bundle, captures the agent's response, updates scratchpad + heartbeat.
  * `python -m hermes_loop status` — heartbeat + scratchpad + cron-job state per worker.
  * `python -m hermes_loop logs <id> [--tail N]` — tail scratchpad.
  * `python -m hermes_loop install <id>|--all [--dry-run]` — `hermes cron create ...` to register a worker.
  * `python -m hermes_loop uninstall <id>|--all [--dry-run]` — `hermes cron remove ...` to deregister.
  * `python -m hermes_loop list` — list installed hermes-loop cron jobs.
  * `python -m hermes_loop stop <id> [--reason]` — log-only stop.
  * `python -m hermes_loop doctor` — non-zero exit if any heartbeat is stale.

## Slice A → Slice B → Slice B-fix → Slice C — at a glance

| What                                   | Slice A       | Slice B (simulator)         | **Slice B-fix (current)**                        | Slice C (next)                          |
|----------------------------------------|---------------|------------------------------|---------------------------------------------------|------------------------------------------|
| Real LLM tick                          | no            | simulated                    | **yes — `hermes chat` is invoked**                | yes (same path)                          |
| Worker executor field                 | `none`        | shell-template string        | **`"hermes"` enum value**                          | same                                     |
| Subagent launcher                      | n/a           | `run_subagent.sh` stub       | **`hermes_loop.executor` calls `hermes chat`**    | same                                     |
| Scheduler integration                 | none          | launchd plists (custom)      | **`hermes cron` (native)**                         | same                                     |
| Per-worker scratchpad + heartbeat      | yes           | yes                          | yes                                               | yes                                      |
| Supervisor worker (`supervisor`)      | n/a           | n/a                          | **Slice C: added with 2h cadence**                | fully wired                              |
| Other 5 windows defined                | only worker   | all five                     | all six (5 + supervisor)                          | same                                     |

## Files

  * `hermes_loop/` — Python package (stdlib only)
    * `cli.py` — argparse CLI
    * `config.py` — worker config loader
    * `executor.py` — Slice B-fix: builds and runs `hermes chat`
    * `prompt.py` — wake-prompt builder
    * `scheduler.py` — Slice B-fix: `hermes cron create / remove / list`
    * `scratchpad.py` — log + heartbeat helpers
    * `tick.py` — dispatch executor based on `cfg.executor`
  * `workers/<id>.json` — one config per worker (`executor: "hermes"` for real)
  * `logs/<id>.log` — append-only scratchpad
  * `state/<id>.heartbeat` — heartbeat file (mtime = last tick)
  * `bundles/<id>/<ts>.md` — the wake prompt each tick produces

## Cadences (defaults)

| Worker        | cadence_minutes |
|---------------|------------------|
| worker-relay  | 30               |
| ux-relay      | 30               |
| code-health   | 45               |
| ux-critic     | 60               |
| po-relay      | 60               |
| supervisor    | 120              |

Edit `workers/<id>.json` to change a single worker's cadence. New cadence_minutes × 60s becomes the `hermes cron` schedule (`30m` / `every 2h` / cron expression).

## Slice B-fix exit shape

The executor is `bash -lc "cd <repo> && hermes chat --quiet --no-restore-cwd --max-turns 60 -q <bundle-path>"`. The bundle is passed via `-q`; the agent consumes the bundle, walks the 9-phase ritual per the bundled RITUAL.md, mutates STATE via `tools/cursor-loop/scripts/state_api.sh`, commits code on its worktree, and exits.

The scratchpad captures:

```
[tick]     tick-start  executor=hermes bundle=…
[tick]     tick-end    executor=hermes returncode=0 elapsed=…s stdout_tail='…' stderr_tail='…'
[hermes-loop] doctor OK / stale-heartbeat
```

## Slice C — supervisor

`tools/hermes-loop/workers/supervisor.json` defines a sixth worker that runs every 120 minutes. Its contract files live at `docs/window-instances/supervisor/{INSTANCE,IDENTITY,RITUAL,STATE}.md`. The supervisor is **read-only** outside its own STATE.md — it runs `hermes_loop status`, `hermes_loop doctor`, and `hermes_loop logs` and writes one `digest-supervisor-<ts>` row to its DIGEST table per tick. No commits, no code edits.

## Run from anywhere

`python -m hermes_loop` walks up looking for a directory with `docs/window-instances/` + `pwa/`, so it works whether invoked from the repo root or a few levels deep.

## Prerequisites

  1. `hermes` CLI installed at `~/.local/bin/hermes` (or set `HERMES_BIN`).
  2. For automatic scheduling: `hermes gateway install` (user service) and `hermes cron status` shows the gateway running.

## What's NOT in Slice B-fix

  * Real LLM ticks are still billed per-tick to whatever provider you configure. A 30-minute cadence × 5 workers = 240/day; budget accordingly.
  * Cross-worker handoffs (PO → Worker, etc.) still rely on the cursor-loop `state_api.sh` get/set/append surface — we don't reimplement that.
