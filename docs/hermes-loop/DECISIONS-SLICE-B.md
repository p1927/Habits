# Hermes Loop — Slice B defaults

The user gave the green light for Slice B without answering the three clarifier questions. Below are the defaults I picked, with rationale.

## B1 — Executor

**Picked: `subprocess` running a small driver script `tools/hermes-loop/scripts/run_subagent.sh`.**

Rationale:

  • Hermes has an internal `delegate_task` tool but it's a function of the running agent's tool registry, not an external CLI. It is not exposed to scripts from the host shell.
  • The most pragmatic approach for Slice B is a subprocess-driven driver that:
      (1) writes the bundle to disk
      (2) shells a single command string (configurable per worker, default = a fixed launcher that loads the bundle into a new Hermes session)
      (3) returns the subagent's stdout / status to the scratchpad
  • The launcher command for Slice B will be a no-op dry-run wrapper (`scripts/run_subagent.sh --bundle <path>`) that just echoes "would invoke:" and exits 0 — because we still don't have a documented external way to spawn a real Hermes session from shell.
  • Slice C will replace `--bundle` with the actual `hermes ...` invocation once you (the user) confirm which Hermes binary / CLI subcommand is the right entry point.

**Default executor string per worker config:** `bash tools/hermes-loop/scripts/run_subagent.sh --bundle <bundle-path>`

This way, the tick pipeline works end-to-end (bundle → executor → scratchpad) without needing a live LLM session in CI. Real LLM execution happens by editing one line in the per-worker config.

## B2 — Delivery channel

**Picked: `local` for all five workers.**

The user said earlier "default answers are fine". I made these decisions explicitly so they live in docs:

  • All five workers default to `delivery.mode = local` (logged to scratchpad only).
  • To get pushes, set `delivery.mode = cli-session` (auto-deliver to your current terminal session — works only when your CLI session is open) or `delivery.mode = telegram:<chat_id>:<topic>` (uses the `cronjob` tool's `deliver` field at registration time).
  • Slice B has infra to send a digest via Telegram for anyone who wants it, but doesn't enable it by default.

## B3 — Cron mechanism

**Picked: launchd on macOS (via `launchctl load -w <plist>`).**

Rationale:

  • macOS-only target (Habits runs on the user's Mac per SETUP.md §1).
  • launchd survives reboots without explicit `crontab` setup, and is the conventional macOS scheduler.
  • launchd plists can be uninstalled with `launchctl unload` (clean lifecycle, replaces a misleading `crontab` cron entry).
  • launchctl handles missed ticks via `StartCalendarInterval` semantics — simpler than cron's machine boot semantics.

**Default cadence per worker:** copied from current cursor-loop interval_sec, multiplied by 10 to account for cold-start cost:

| Worker        | Old interval | New cadence_minutes |
|---------------|--------------|---------------------|
| worker-relay  | 120 s        | 30 |
| ux-relay      | 300 s        | 30 |
| code-health   | 600 s        | 45 |
| ux-critic     |              | 60 |
| po-relay      |              | 60 |

Rationale: a fresh Hermes session costs ~10–30s of cold-start + LLM thinking time; intervals < 5 min would starve the agent.

## B4 — Install mechanism

**Picked: `python -m hermes_loop install --all` registers plists via `launchctl bootstrap`.**

  • Idempotent: re-running is a no-op if the same label is already loaded.
  • Easy to undo: `python -m hermes_loop uninstall --all`.
  • Lives in `~/.hermes/launchd/<worker_id>.plist` so it's visible in `~/Library/LaunchAgents`.

**`hermes-loop launchd` subcommands (new):**

  * `install <worker_id>` — write plist + `launchctl load -w` it.
  * `install --all` — bulk variant.
  * `uninstall <worker_id>` — `launchctl unload` + remove plist.
  * `list` — show currently loaded plists we own.

## B5 — Sub-agent invocation refinement

For Slice B, the `run_subagent.sh` driver is a **simulation shell**: it reads the bundle file, prints its size, then exits 0. Slice C will replace this with the actual Hermes invocation once a confirmed CLI entry point exists.

This is honest: the user gets a working pipeline that doesn't claim to invoke an LLM when it can't, and the swap from simulation → real is a one-line config change.

## Open for follow-up

If the user disagrees with any of these defaults, they should edit `docs/hermes-loop/DECISIONS-SLICE-B.md` (or tell me directly) before Slice B is finalized.
