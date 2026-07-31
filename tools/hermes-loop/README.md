# Hermes Loop

Drive multiple Hermes sub-agents as **window instances** — each with its own contract, state, identity, and ritual. From your seat, the observable behavior matches "four persistent terminals working in parallel"; the underlying mechanism is one scheduled tick per worker.

This sits alongside `tools/cursor-loop/` during transition. Both can run at once.

See [`docs/hermes-loop/PLAN.md`](../../docs/hermes-loop/PLAN.md) and [`docs/hermes-loop/DECISIONS-SLICE-B.md`](../../docs/hermes-loop/DECISIONS-SLICE-B.md) for the full plan + slice defaults.

## What's wired up

  * `python -m hermes_loop tick <id> [--dry-run]` — build + write the wake bundle; with a real executor (`<command>`), invoke it via `subprocess.run` and capture stdout.
  * `python -m hermes_loop status` — heartbeat + scratchpad size + `launchd` load state per worker.
  * `python -m hermes_loop logs <id> [--tail N]` — tail scratchpad.
  * `python -m hermes_loop install <id>|--all [--dry-run]` — write a `~/.hermes/launchd/ai.habits.hermes-loop.<id>.plist` and `launchctl load -w` it.
  * `python -m hermes_loop uninstall <id>|--all [--dry-run]` — `launchctl unload` and remove the plist.
  * `python -m hermes_loop list` — list installed launchd labels.
  * `python -m hermes_loop stop <id> [--reason]` — log-only stop; tells you how to remove the scheduler.
  * `python -m hermes_loop doctor` — non-zero exit if any heartbeat is stale.

## Slice A (committed) vs. Slice B (this build)

| What                             | Slice A       | Slice B                                     |
|----------------------------------|---------------|---------------------------------------------|
| Real executor dispatch           | no            | yes (`subprocess.run` of executor string)    |
| Subagent simulator               | n/a           | `scripts/run_subagent.sh` (replaceable)      |
| Worker configs in `workers/`     | `worker-relay` only | all five                                |
| `install` CLI                    | print-only    | writes plist + `launchctl load -w`           |
| `uninstall` / `list` CLI         | n/a           | added                                       |
| Status shows launchd label       | n/a           | added                                       |

The simulator (`scripts/run_subagent.sh`) emits deterministic "would invoke" output and exits 0 so the pipeline works end-to-end without spending LLM tokens. Slice C will swap one line in each worker config to point at a real Hermes launcher.

## Files

  * `hermes_loop/` — Python package (stdlib only)
    * `cli.py` — argparse CLI
    * `config.py` — worker config loader
    * `launchd.py` — plist generation + `launchctl` integration
    * `prompt.py` — wake-prompt builder
    * `tick.py` — tick driver (writes bundle, dispatches executor, touches heartbeat, appends to scratchpad)
    * `scratchpad.py` — log + heartbeat helpers
  * `scripts/run_subagent.sh` — Slice B subagent simulator
  * `workers/<id>.json` — one config per worker
  * `logs/<id>.log` — append-only scratchpad
  * `state/<id>.heartbeat` — heartbeat file (mtime = last tick)
  * `bundles/<id>/<ts>.md` — the wake prompt each tick produces
  * `~/.hermes/launchd/ai.habits.hermes-loop.<id>.plist` — macOS scheduling plist
  * `~/.hermes/launchd/logs/<id>.{out,err}` — launchd job stdout/stderr

## Cadences (Slice B defaults)

| Worker        | cadence_minutes |
|---------------|------------------|
| worker-relay  | 30               |
| ux-relay      | 30               |
| code-health   | 45               |
| ux-critic     | 60               |
| po-relay      | 60               |

Edit `workers/<id>.json` to change a single worker's cadence.

## Run from anywhere

`python -m hermes_loop` walks up looking for a directory with `docs/window-instances/` + `pwa/`, so it works whether invoked from the repo root or a few levels deep.

## Slice C (next)

Adds a supervisor worker that periodically reads every window-instance STATE file and posts a digest to a configurable channel (Telegram topic-by-topic is the natural default), plus replaces the simulator with a real Hermes launcher.
