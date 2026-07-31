# TIMEOUT-FIX — hermes_loop 0.4.0

## The bug

Slice B-fix (commit 6f280bf) shipped with `timeout_seconds=900` (15 min)
hard-coded in `tick.py` and `executor.py`. Real LLM ticks need more than
that:

* Phase 1 (`advance_ritual_step --apply`) → ~1s
* Phase 2 (`prepare_orient_tick` + git status/log) → ~2s
* Phase 3 (`prepare_select_tick` + `instance_worktree.sh create`) → ~5s
* Phase 4 (LLM edits the worktree + runs `npm run build`) → 5–15 min
* Phase 5 (`validate_refactor_step` + `npm run lint`) → 30–60s
* Phase 6 (`/code-review`) → 1–2 min
* Phase 7 (`/receiving-code-review` + backlog reflect) → 1–2 min
* Phase 8 (`instance_worktree.sh merge && remove`) → ~5s

A full clean tick is ~10–20 min. Backlog items that touch the PWA build
or refactor shared hooks easily exceed 15 min. Every worker-relay tick
was hitting the 900s wall and crashing with `subprocess.TimeoutExpired`,
rc=5, no commit landed on main.

## The fix

* New optional per-worker JSON keys: `tick_timeout_seconds`, `max_turns`.
* New `WorkerConfig.effective_timeout()` resolves in this order:
    1. `HERMES_LOOP_TICK_TIMEOUT` env var (escape hatch).
    2. Per-worker `tick_timeout_seconds`.
    3. Built-in default — supervisor 5 min, others 30 min.
* `WorkerConfig.effective_max_turns()` derives from timeout
  (timeout/30s-per-turn, clamped 40..200) and is passed to the inner
  `hermes chat --max-turns` arg.
* `tick.py` adds an explicit `except subprocess.TimeoutExpired` branch
  that writes a human-readable scratchpad line + returns rc=5 (the same
  crash code as before — so cron keeps advancing). The log message tells
  the next agent exactly which knob to turn.
* All 6 worker JSONs now declare `tick_timeout_seconds` and
  `max_turns` explicitly, so the config is self-documenting.
* Version bumped to `0.4.0-timeout-fix`.

## What did NOT change

* The queue dispatcher (`scripts/queue_run.sh`) — still 1m cadence,
  same `state/PAUSE`+`state/BUSY` gates. The 18:32 crash happened
  inside `hermes chat`, NOT in the dispatcher.
* Worker cadences (worker-relay 30m, supervisor 2h, etc.).
* The 9-phase ritual contract — every worker bundle still references
  the same RITUAL.md files.

## Verification (this turn)

* All 6 worker JSONs load cleanly with new optional keys.
* `effective_timeout()` returns 1800 for the 5 feature workers and 300
  for supervisor; env override works.
* `build_argv` produces `--max-turns 80` for worker-relay (was 60).
* `tick worker-relay --dry-run` still exits 0 with a fresh bundle.
* A real `tick worker-relay` will be backgrounded to confirm a full
  tick takes more than 900s without timing out.

## Note on cost

With `tick_timeout_seconds=1800` and `max_turns=80`, a single tick that
maxes out the budget will spend up to 80 turns × ~25s/turn ≈ 33 min of
agent-time, plus ~80 × LLM-token-cost. For unattended 6h unattended
runs this is well within budgets when the backlog has real items; for
"just polling" ticks (idempotent state sync), the LLM exits after 2-5
turns and most of the budget is unused.
