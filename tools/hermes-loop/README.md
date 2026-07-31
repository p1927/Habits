# Hermes Loop

Drive multiple Hermes sub-agents as **window instances** — each with its own contract, state, identity, and ritual. From your seat, the observable behavior matches "four persistent terminals working in parallel"; the underlying mechanism is one scheduled tick per worker.

This sits alongside `tools/cursor-loop/` during transition. Both can run at once.

See [`docs/hermes-loop/PLAN.md`](../../docs/hermes-loop/PLAN.md) for the full plan and the slice scope.

## Slice A — what's wired up

  * `python -m hermes_loop --help`
  * `python -m hermes_loop tick worker-relay --dry-run` — builds the wake bundle but does NOT spawn an LLM (executor=none).
  * `python -m hermes_loop status` — heartbeat + scratchpad size per worker.
  * `python -m hermes_loop logs worker-relay --tail N` — tail the worker's scratchpad.
  * `python -m hermes_loop install worker-relay` — print cron-style invocation.
  * `python -m hermes_loop stop worker-relay` — log-only stop.
  * `python -m hermes_loop doctor` — non-zero if any heartbeat is stale.

The actual LLM tick (Slice B) will swap `executor: none` for `executor: <command>` and call that via `subprocess.run` with the bundle as the prompt.

## What's NOT in Slice A

  * No cron registration. Use `python -m hermes_loop install` for instructions.
  * No real LLM executor. Defaults to `none`.
  * Only one worker is configured (`worker-relay`).
  * No supervisor cron.
  * The four other window instances (ux-relay, ux-critic, code-health, po-relay) are not migrated yet.

## Files

  * `hermes_loop/` — Python package (stdlib only)
    * `cli.py` — argparse CLI
    * `config.py` — worker config loader
    * `prompt.py` — wake-prompt builder
    * `tick.py` — tick driver
    * `scratchpad.py` — log + heartbeat helpers
  * `workers/<id>.json` — one config per worker
  * `logs/<id>.log` — append-only scratchpad
  * `state/<id>.heartbeat` — heartbeat file (mtime = last tick)
  * `bundles/<id>/<ts>.md` — the wake prompt each tick produces

## Run from anywhere

`python -m hermes_loop` walks up looking for a directory with `docs/window-instances/` + `pwa/`, so it works whether invoked from the repo root or a few levels deep.

## Next slices

Slice B wires real executors + cron; Slice C adds a supervisor worker that periodically reads all STATE files and sends a digest.
