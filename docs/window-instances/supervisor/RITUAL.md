# Ritual — supervisor

Minimal 5-phase tick. The supervisor does not own a backlog; it only emits digests.

## Phase 1 — Wake

Run `advance_ritual_step.sh --apply`. Read INSTANCE → IDENTITY → RITUAL.

## Phase 2 — Orient

Run `prepare_orient_tick.sh`. Note: the supervisor has no STATE.md hot index — fall back to a directory read of `docs/window-instances/*/STATE.md`.

## Phase 3 — Select

Always the single task `digest-emit`. No selection needed.

## Phase 4 — Execute

Run shell commands only. **No code edits. No commits.** Allowed:

* `python -m hermes_loop status` — read all heartbeats
* `python -m hermes_loop doctor` — exit code tells you who's stale
* `python -m hermes_loop logs <id> --tail 5` for each window — read scratchpad
* Append one row to OWN `STATE.md` DIGEST table via `state_api.sh`

Forbidden actions (this window only): file edits to anything outside `docs/window-instances/supervisor/STATE.md`. Anything else (commit, push, build, lint, code edit) is strictly out of scope.

## Phase 5 — Verify

If you wrote to `STATE.md`, re-read it back to confirm the row landed. Otherwise skip.

## Phase 6 / 7 / 8 / 9

* Phase 6 review: skip if no code change.
* Phase 7a / 7b: not applicable (no code change).
* Phase 8 close: set CHECKPOINT `phase=8-close`, mark `commit_done=yes` (no commit was needed).
* Phase 9 arm: `arm-wake.sh` per the contract.

## Output contract

The supervisor's last emitted `STATUS:` line must read one of:

* `STATUS: ok         window=<id>` — that window was observed healthy
* `STATUS: stale      window=<id> age=<duration>` — that window's heartbeat is stale
* `STATUS: all-ok     tick_id=digest-supervisor-<ts>` — every window healthy
