# Hermes Loop — Implementation Plan

> Goal: multiple Hermes sub-agents, each behaving like a Cursor "window instance" with its own ritual, backlog, and identity. Each advances its own work autonomously while the user is away.

This document is the durable spec. Re-read at start of every slice.

## Honest scope statement

Hermes CLI today is interactive; a process doesn't keep itself alive across wakes. So "four terminals each running a long-lived Hermes agent that wakes itself on a sentinel" is **not literally possible**. What IS possible — and what this plan builds — is:

  • N scheduled ticks, one per worker. Each tick is a fresh Hermes session that reads the worker's contract + state, walks the ritual, does one backlog item, commits, and exits.
  • From the user's seat, the observable behavior matches the "four persistent terminals" idea: progress every N minutes, per-worker commits landing, summaries delivered. The mechanism (cron + fresh session per tick) is different; the feel is the same.

Reference: existing `tools/cursor-loop/` system that this replaces. We keep the contract + STATE files (`docs/window-instances/<id>/`) untouched; we replace the wake/sentinel + agent-loop machinery with a much smaller scheduler.

## Constraints (do not violate)

  • **Slice A first.** Don't ship B/C until A is approved.
  • **Hermes-loop sits alongside cursor-loop**, not over it. Both must work in parallel during Slice B/C.
  • **No rewriting of contracts / rituals / state files** (`docs/window-instances/worker-relay/{INSTANCE,IDENTITY,RITUAL}.md`).
  • **Reuse cursor-loop scripts where possible** (`state_api.sh`, `instance_worktree.sh`, `advance_ritual_step.sh`, etc.) by shelling out. Don't reimplement.
  • **Single Python package**, no extra build steps. Installed via `python -m hermes_loop ...` from anywhere in the repo.

## Architecture

```
┌──────────────────┐
│ cron / launchd    │   (Slice B/C; for Slice A user runs manually)
└────────┬─────────┘
         │ every N minutes per worker
         ▼
┌──────────────────┐
│ hermes_loop tick │   Python CLI — load worker config + build wake prompt
│  <worker_id>     │
└────────┬─────────┘
         │ spawns a fresh Hermes session with prompt body = contract bundle + snapshot + ritual reminder
         ▼
┌──────────────────┐
│ Hermes session    │  tick walks the 9-phase ritual, edits files, commits inside .worktrees/<id>/
└────────┬─────────┘
         │ on exit, scratchpad log + summary delivered to configured channel
         ▼
┌──────────────────┐
│ scratchpad log    │  tools/hermes-loop/logs/<id>.log (append-only)
└──────────────────┘
```

## Slices

### Slice A — MVP, one worker end-to-end (THIS SLICE)

**Deliverables:**

  1. `tools/hermes-loop/hermes_loop/` — Python package, entry point `python -m hermes_loop`.
  2. `tools/hermes-loop/hermes_loop/cli.py` — subcommands:
     - `tick <worker_id> [--dry-run]` — run one tick. `--dry-run` skips spawning the agent and only emits the prompt that would have been sent.
     - `status` — show heartbeat + last-tick-at + last-error per worker.
     - `logs <worker_id> [--tail N]` — show scratchpad log.
     - `install <worker_id>` — print instructions for wiring to cron/launchd.
     - `doctor` — show stale workers.
  3. `tools/hermes-loop/hermes_loop/config.py` — load `workers/*.yaml`.
  4. `tools/hermes-loop/hermes_loop/tick.py` — build wake prompt + spawn agent + log.
  5. `tools/hermes-loop/hermes_loop/scratchpad.py` — heartbeat + log helpers.
  6. `tools/hermes-loop/workers/worker-relay.yaml` — only worker config; mirrors the existing INSTANCE.md loop config.
  7. `tools/hermes-loop/README.md` — usage.
  8. `docs/hermes-loop/PLAN.md` — this file.
  9. Update top-level `SETUP.md` with a short Hermes Loop section.

**Acceptance:**

  • `python -m hermes_loop --help` works.
  • `python -m hermes_loop tick worker-relay --dry-run` prints a non-empty prompt that contains INSTANCE + IDENTITY references, the 9-phase ritual reminder, and the state snapshot call.
  • `python -m hermes_loop status` shows worker-relay with a fresh heartbeat within seconds of a dry-run.
  • Existing `tools/cursor-loop/` state_api / worktree scripts remain functional (no regressions).
  • `python -m hermes_loop tick worker-relay` *attempts to* run a real tick via the configured executor. For Slice A the executor is `none` (we don't actually spawn a subagent yet — instead we print a clear message: "executor=none: no LLM was called; bundle is ready at <path>"). This keeps Slice A hermetic and reviewable.
  • `pwa lint / build` still passes; the cursor-loop scripts are unchanged.

**Non-goals for Slice A:**

  • No cron entries installed anywhere.
  • No actual LLM invocation (executor = none, prints bundle path).
  • No migration of the other four loops.
  • No supervisor cron.

### Slice B — all five loops + cron wiring

**Deliverables:**

  • `workers/{worker-relay,ux-relay,ux-critic,code-health,po-relay}.yaml` config files.
  • Per-worker `executor` resolution: by default `claude-code` or whatever the user has — see Slice B decisions.
  • `python -m hermes_loop install` — register cron jobs via the Hermes `cronjob` tool (managed).
  • Worker config inherit + override.
  • Per-worker delivery channel.

**Acceptance:**

  • Each worker tick runs end-to-end (one full LLM tick) at least once during the Slice B build session.
  • `cronjob action=list` shows the registered jobs.
  • Each worker has its own scratchpad log.
  • Stopping one worker doesn't disturb the others.

### Slice C — supervisor + polish

**Deliverables:**

  • Supervisor YAML config + cron entry (every 2h).
  • Supervisor reads all STATE files, builds a digest.
  • Doctor with auto-recover for stale heartbeats.
  • `hermes-loop status --watch` terminal UI (optional).

## Worker config schema (YAML)

```yaml
id: worker-relay                    # matches loop_id in INSTANCE.md
contract_dir: docs/window-instances/worker-relay
state_file: docs/window-instances/worker-relay/STATE.md   # relative to repo root
executor: none                       # for Slice A; Slice B will set to a real one
cadence_minutes: 30                  # min interval between ticks
stop_phrases:                        # user-typed phrases that halt this worker
  - "stop worker"
  - "halt worker-relay"
delivery:
  mode: local                         # local | telegram:<chat_id>:<topic> | cli-session
scratchpad: tools/hermes-loop/logs/worker-relay.log
heartbeat: tools/hermes-loop/state/worker-relay.heartbeat
worktree:
  enabled: true                      # Slice A: read but unused when executor=none
  path: .worktrees/worker-relay
  branch_prefix: loop/worker-relay/
```

## Design decisions (locked for Slice A)

  1. **No new build dep.** Pure Python 3.11+ stdlib only. PyYAML is the only third-party; if not present, fall back to JSON. (Actually: use Python's pure stdlib — use JSON for the YAML-equivalent to avoid the dep.)
     **Resolved**: use JSON for the worker config. Keeps dep footprint at zero.
  2. **No actual agent spawn in Slice A.** Executor defaults to `none` so the tick is reviewable without LLM cost. Slice B swaps the executor default to `claude-code` (or whatever the user confirms).
  3. **Scratchpad log is plain text, append-only.** No DB. Let tail -f be the UI.
  4. **Heartbeat is a file with the last-tick timestamp.** `os.path.getmtime` is enough — no need for atomic mtime + content for Slice A.
  5. **Worker stop phrases** use substring match in `python -m hermes_loop stop <worker>`; for cron-driven ticks, "stop loop" semantics live in Slice B via manual cron removal.

## Open questions for Slice A review

  • Confirm "executor=none prints bundle, doesn't spawn" is the right MVP (vs. running a real LLM tick for Slice A).
  • Confirm worker-relay is the right first worker (vs. ux-critic which has the lightest backlog).

## Open questions for Slice B

  • Default executor name and how to discover it.
  • Default delivery channel for each worker.
  • Whether to keep `instance_worktree.sh` from cursor-loop or write a smaller hermes-loop equivalent.

## Open questions for Slice C

  • Supervisor delivery format — topic-per-worker digest vs. flat message.
  • Doctor's auto-recover policy (which actions count as "recover" vs. "alert").

## Risk register

  • **R1:** If `tools/cursor-loop/scripts/state_api.sh` is not on PATH or misbehaves, hermes-loop fails silently. Mitigation: Slice A does not call state_api; only validates config.
  • **R2:** Exec-as-subprocess in Slice B could leak tokens/secrets into the spawned Hermes session. Mitigation: redaction helper in the wake prompt; documented in README.
  • **R3:** cron-spawned Hermes sessions may have stale `~/.hermes` config (e.g. rotated tokens). Mitigation: doctor checks token presence.

## Out of scope (this plan)

  • Building a true long-lived chat per worker. Not possible in current Hermes.
  • Replacing the RITUAL.md / IDENTITY.md content. Preserved verbatim.
  • Migrating off the cursor-loop scripts in Slice B; deferred to a later cleanup slice.
