# Regression guards — window instances

Why autonomous wake broke (v0.6.1–v0.6.2) and how to prevent similar regressions.

## What went wrong

1. **Fixed the wrong layer** — ritual gates, review compliance, and worktree rules expanded while **wake delivery** regressed.
2. **Inverted the working model** — v0.6.0 used background `arm-wake.sh` + `notify_on_output`. v0.6.1 made foreground `--exec` primary; v0.6.2 blocked bare `arm-wake.sh`. Agents end turns in seconds, so foreground sleep never completes with a listener.
3. **Trusted misleading status** — `ARMED` only means a bash sleeper PID is alive, not that Cursor will wake this chat.
4. **Assumed hooks replace notify** — `afterShellExecution` does not support `followup_message`; stop hook is silent while ARMED; idle unfocused chats stay idle after SPIN.
5. **Shipped in session, not in git** — large fixes were lost when uncommitted; disk stayed on broken v0.6.2.

## Non-negotiable wake contract (do not change without E2E proof)

| Rule | Why |
|------|-----|
| Phase 9 primary = `prepare_arm_wake.sh` → `ARM_COMMAND` with `block_until_ms: 0` + `notify_on_output` | Only reliable autonomous wake primitive |
| Steady-state `--exec` forbidden unless `--recovery-foreground` | Agents cannot hold Shell for full interval |
| `prove_wake.sh` must pass per loop before merging cursor-loop wake changes | Prevents repeat regressions |
| No new hook “auto-wake” without Cursor docs proving `followup_message` on that hook | afterShell/postToolUse were dead paths |

## Before merging any cursor-loop change

1. Run `bash tools/cursor-loop/tests/run-all.sh`
2. Run `bash tools/cursor-loop/scripts/prove_wake.sh .` — all loops `ready_for_autonomous_tick` or documented SPIN recovery
3. Bump `tools/cursor-loop/VERSION` + `CHANGELOG.md` in the **same commit** as behavior changes
4. Run `bash tools/cursor-loop/install.sh . --preset habits-pwa --symlink`
5. Re-paste `@INSTANCE.md keep working` in each chat after install or `refresh-loops.sh`

## Agent checklist (every Phase 9)

- [ ] `prepare_arm_wake.sh` (no `--exec`)
- [ ] `ARM_COMMAND` with `block_until_ms: 0` and `notify_on_output` on monitor_regex
- [ ] `verify-wake.sh` exit 0 before ending turn
- [ ] Do **not** claim wake success from ARMED alone — SPIN means sentinel fired without tick

## Preserved features (must not break during wake fixes)

- 9-phase ritual + `ritual_phase.py` gates
- Mandatory review cycle (Phase 6–7, REVIEW_FINDINGS)
- Git worktree isolation for code items
- Window-scoped review paths (`review_scope.py`)
- `hook_bind` missed-tick on user prompt
- Stop hook recovery when wake DOWN / SPIN

## Operator signals

| `cwin status` | Meaning | Action |
|---------------|---------|--------|
| ARMED + timer | Sleeper alive; notify must have been set when armed | Wait for interval |
| SPIN | Sentinel fired; tick not consumed | Focus chat → keep working |
| DOWN | No sleeper | Focus chat → keep working → re-arm with notify |
