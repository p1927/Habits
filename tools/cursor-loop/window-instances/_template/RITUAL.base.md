# Universal 9-Phase Ritual (base)

All Window Instances run phases **1–9** in **strict order** — advance one phase at a time; no jumps.

**Phase line:** `1-wake → 2-orient → 3-select → 4-execute → 5-verify → 6-review → 7-triage → 8-close → 9-arm`

Every wake starts at **Phase 1**. `validate_ritual_gate.py` blocks arm if the line is incomplete.

All Window Instances run phases **1–9** with the same names. Phases **4–6** vary by `archetype`.

## Phase overview

| Phase | Name | All windows |
|-------|------|-------------|
| 1 | **Wake** | **Run `advance_ritual_step.sh --apply` first** (advances `9-arm → 1-wake`, resets flags); then read INSTANCE → IDENTITY → RITUAL; use wake JSON `state_snapshot` (or `state_api get snapshot`); confirm `loop_id` |
| 2 | **Orient** | `prepare_orient_tick.sh`; update LAST_REVIEW via `state_api set last-review`; do **not** Read STATE.md |
| 3 | **Select** | Resume `IN_PROGRESS` or pick top backlog item; **create worktree** when item touches code |
| 4 | **Execute** | Archetype-specific (see table) |
| 5 | **Verify** | Archetype-specific (see table) + change detection (below) |
| 6 | **Code review** | `/code-review` Round N (see below) |
| 7 | **Receive review** | `/receiving-code-review` Round N (see below) |
| 8 | **Close** | Merge worktree to `main`, remove worktree, HISTORY row, clear IN_PROGRESS |
| 9 | **Arm** | `checkpoint-loop.py --product` + `arm-wake.sh` per agent-loop-contract |

## Phase 1 — Wake

**First action on every wake — before reading any file:**

```bash
bash tools/cursor-loop/scripts/advance_ritual_step.sh . \
  --state-file <STATE.md path> \
  --loop-id <loop_id> \
  --apply
```

This advances `CHECKPOINT.phase` from `9-arm → 1-wake` and resets per-tick flags. It is the only supported way to begin a new tick. Once `phase=1-wake` is written, the arm gate (`validate_ritual_gate.py`) blocks any re-arm until phases 2–8 complete. **If this step is skipped, the gate sees stale `phase=9-arm` and passes immediately — the agent re-arms without doing any work.**

After advancing:

1. Read `INSTANCE.md` → `IDENTITY.md` → `RITUAL.md`
2. Read wake JSON `state_snapshot` (or `state_api get snapshot`) — **never read `STATE.md` directly**
3. Confirm `loop_id` matches INSTANCE

---

## Phases 4–6 by archetype

| Phase | engineer | designer | product | qa |
|-------|----------|----------|---------|-----|
| 4 Execute | Ship feature code | Ship UI diff | Brainstorm + backlog mutate | Run test plan / automation |
| 5 Verify | `npm run build` (pwa/) | build + 390px check | lens sessions logged | tests pass + repro steps |
| 6 Code review | `/code-review` bugs/regressions | `/code-review` + visual | Product code review template | `/code-review` + coverage gaps |

## Phase 5 end — change detection (required)

After archetype-specific verify steps, **always** run:

```bash
bash tools/cursor-loop/scripts/prepare_review_tick.sh . \
  --state-file <STATE.md path> \
  --loop-id <loop_id> \
  --apply
```

**Important:** `prepare_review_tick.sh` completes **Phase 5 only**. It does **not** invoke `/code-review`. When output shows `PHASE_6_REQUIRED=yes`, you must still run Phase 6 as a separate Cursor command.

Phase 5 **MUST**:

1. Run `prepare_review_tick.sh --apply` (writes `review_changed_files`, `review_fingerprint`, `code_changed`, `review_round`)
2. If `code_changed=yes` → set `review_status=pending`, record `review_diff_range`
3. Cannot enter Phase 8 with stale manifest or `review_status=done` from a prior tick while git diff is non-empty
4. On Phase 7 completion → set `last_reviewed_round` to the round just triaged

Manual fallback (if script unavailable):

```bash
bash tools/cursor-loop/scripts/detect_code_changed.sh . --loop-id <loop_id> --state-file <STATE.md>
```

Then update via `state_api` — **never edit STATE.md directly**:

```bash
# code_changed=no
state_api.sh . --loop-id <loop_id> set checkpoint code_changed=no

# code_changed=yes (increment N from current review_round value)
state_api.sh . --loop-id <loop_id> set checkpoint \
  code_changed=yes \
  review_round=<N+1> \
  review_diff_range=uncommitted \
  review_status=pending
```

If `no`: may skip Phase 6/7 with `review_status=skipped` and non-empty `review_skip_reason`.

## Phase 3 — Worktree (code items)

**Mandatory prep** (engineer / designer / qa archetypes when item touches code):

```bash
bash tools/cursor-loop/scripts/prepare_select_tick.sh . \
  --state-file <STATE.md path> \
  --loop-id <loop_id> \
  --apply
```

When `requires_worktree=yes`, create before Phase 4 (or use `--apply` to auto-create):

```bash
bash tools/cursor-loop/scripts/instance_worktree.sh create . \
  --loop-id <loop_id> \
  --item-id <backlog-id> \
  --state-file <STATE.md path>
```

`create --state-file` auto-patches CHECKPOINT: `worktree_status=active`, `worktree_path`, `worktree_branch`, `worktree_item_id`, `current_item_id`.

**PO default:** docs-only ticks skip worktree (`worktree_status=none`).

**Anti-idle detection (all archetypes):** If `idle_mode=true` appears in the wake JSON `state_snapshot`:

1. **Phase 1** — immediately run: `state_api.sh . --loop-id <loop_id> set checkpoint idle_mode_triggered=yes idle_rescue_done=no`
2. **Phase 3** — archetype-specific self-rescue is the FIRST mandatory action before item selection; create ≥3 new backlog items
3. **Phase 3** — after creating ≥3 items: `state_api.sh . --loop-id <loop_id> set checkpoint idle_rescue_done=yes idle_mode_triggered=no`
4. `validate_ritual_gate.py` blocks arm when `idle_mode_triggered=yes` AND `idle_rescue_done != yes`

**Phases 4–7:** `cd` to `WORKTREE_PATH` (or set git cwd there). Run builds, commits, and `prepare_review_tick.sh --apply` inside the worktree. Never commit app code on `main` while `worktree_status=active`.

## Phase 8 — Worktree merge + cleanup (after review)

When `worktree_status=active` and review is complete:

```bash
bash tools/cursor-loop/scripts/instance_worktree.sh merge . --loop-id <loop_id>
bash tools/cursor-loop/scripts/instance_worktree.sh remove . --loop-id <loop_id>
```

Merge policy: **rebase onto `main`, then `--ff-only` merge** (linear history). On conflict: fix in worktree, `git rebase --continue`, retry merge.

Reset CHECKPOINT: `worktree_status=none`, clear `worktree_path` / `worktree_branch` / `worktree_item_id`.

## Phase 6 — Code review (Round N)

**Required when `code_changed=yes`.**

Phase 6 = **Bugbot subagent** + **`/code-review` window lens**.

1. Run `prepare_bugbot_review.sh` — read **review-bugbot** skill; launch `Task(subagent_type=bugbot)`.
2. Log Bugbot findings with `source=round-{N} bugbot`.
3. Invoke [`/code-review`](../../../.cursor/commands/code-review.md) for supplemental window lens.
4. Bugbot zero-issue sentinel: `source=round-{N} bugbot`.
5. Run `prepare_review_phase.sh --apply`.

## Phase 7 — Receive + backlog reflect (Round N)

**Required when `code_changed=yes`.** Two mandatory sub-steps:

### Phase 7a — Receive (skill + command)

**Mandatory skill:** Read Superpowers **receiving-code-review** skill first.  
**Mandatory command:** Invoke [`/receiving-code-review`](../../../.cursor/commands/receiving-code-review.md).

Process **only** rows where `source=round-{N}`:

1. READ → VERIFY → EVALUATE → RESPOND → IMPLEMENT (fix-now only).
2. Set `action` on every round-N row: `fix-now` | `backlog` | `closed` | `pushback`.
3. Append HISTORY note for pushbacks.

### Phase 7b — Backlog reflect (mandatory)

**Always run after 7a** — reflection step so deferred work is never lost.

For every round-N row with `action=backlog` (and any low-priority finding not fix-now):

1. Create backlog item with id, priority, acceptance criteria, notes → finding id.
2. Set `REVIEW_FINDINGS.backlog_ref` to that id; finding `status=open`.
3. PO: route to target window backlog per `/receiving-code-review` routing table.

Cannot enter Phase 8 until every round-N row is triaged and every `backlog` row has a real `backlog_ref`.

4–6. Update CHECKPOINT via `state_api` — **never edit STATE.md directly**:

```bash
# all closed/pushback:
state_api.sh . --loop-id <loop_id> set checkpoint \
  review_status=done \
  last_reviewed_round=<N> \
  phase=7-triage

# backlog items remain open: use review_status=triaged instead
```

If `code_changed=no`, Phase 7 may triage backlog/handoffs only; set `review_status=skipped`.

## Phase 7 — Triage rules (all ticks)

Sort findings into:

- **Fix now** — blocks closing current item; implement in 7a before Phase 8
- **Backlog** — deferred; **must** complete 7b with backlog id + AC
- **Pushback** — finding rejected with documented technical reason
- **Closed** — resolved, N/A, or zero-finding sentinel

Do not leave findings as untriaged `open` at Phase 8.

## Phase 8 — Close checklist

- [ ] Round-N findings triaged in 7a; every `backlog` row has `backlog_ref` + backlog entry (7b)
- [ ] Worktree merged to `main` and removed (when `worktree_status=active`)
- [ ] HISTORY row appended via `state_api append history --item-id <id> --outcome <...> --evidence <commit>`
- [ ] IN_PROGRESS cleared or updated
- [ ] CHECKPOINT updated via `state_api set checkpoint phase=8-close review_status=<status> worktree_status=none`
- [ ] Backlog checkboxes updated via `state_api mark backlog-done --id <id>`

## Phase 9 — Arm (dynamic mode)

**Cannot arm if:**

- `CHECKPOINT.phase < 8-close`
- `review_status=pending`
- `worktree_status=active` (unmerged worktree)
- `code_changed=yes` and round-N findings untriaged

**Allowed skip:** `review_status=skipped` with `review_skip_reason` (docs-only ticks).

### Dynamic wake lifecycle

| When | `verify-wake` | Meaning |
|------|---------------|---------|
| End of a healthy turn | **ARMED** | Fresh sleeper running — target steady state |
| After old sleeper fired (mid-turn) | **DOWN** | Normal — re-arm before ending turn |
| End of turn with DOWN | **FAIL** | Gate not met — run `arm-wake.sh` again |
| Follow-up turn with DOWN | **FAIL** | Still must re-arm |

One arm = one sleep cycle. DOWN after sentinel is **not** "job done" unless a **new** arm is live (`verify-wake` exit 0).

### Phase 9 checklist

1. `checkpoint-loop.py --product --evidence <item-id>` (or `--blocker`)
2. **Commit gate** — run before any `git add / commit` for STATE.md:

```bash
bash tools/cursor-loop/scripts/check_commit_gate.sh . \
  --state-file <STATE.md path> --loop-id <loop_id>
```

- `COMMIT_GATE=commit` → `git add -A && git commit -m "worker-relay: <summary>"` as normal.
- `COMMIT_GATE=skip` → only bookkeeping fields changed (`last_wake`, `phase`, `ritual_step`, etc.); **do not commit** — those fields will ride in the next real commit. Proceed directly to arm.

3. Prep arm (prints `EXEC_COMMAND`, `SHELL_BLOCK_UNTIL_MS`):

```bash
bash tools/cursor-loop/scripts/prepare_arm_wake.sh . \
  --state-file <STATE.md> --loop-id <loop_id>
```

4. **Preferred:** run `ARM_COMMAND` with **`block_until_ms=0`** and **`notify_on_output`** on `SHELL_NOTIFY_ON_OUTPUT`. End turn while `verify-wake` shows ARMED. Process wake when sentinel fires in a later turn.
5. **Recovery only:** `prepare_arm_wake.sh --exec --recovery-foreground` with **`block_until_ms` = `SHELL_BLOCK_UNTIL_MS`** — same turn only (stop hook / SPIN).
6. **Alternate:** background `ARM_COMMAND` + **`Await`** on shell `task_id` with `pattern=monitor_regex` before ending the turn.
7. Verify fresh — **never** trust old terminal `WAKE_ARMED` output:

```bash
bash tools/cursor-loop/scripts/verify-wake.sh <loop_id>   # must exit 0
```

### External inject (v0.8.0+)

When Phase 9 uses **notify-armed** sleepers, operators can wake bound instances without paste:

```bash
cwin trigger-all              # inject all unhealthy bound instances
bash tools/cursor-loop/scripts/tick_daemon.sh .   # auto-inject on cooldown
```

`arm-wake.sh` polls `$TMPDIR/cursor-loop-{loop_id}.inject.json` every 5s and fires the wake sentinel early. Requires `NOTIFY=yes` (notify attached at arm). Orphan rearm (`cwin rearm`) does **not** enable inject.

4. Advance to `9-arm` — **never set phase directly** — only after step 7 passes:

```bash
bash tools/cursor-loop/scripts/advance_ritual_step.sh . \
  --state-file <STATE.md path> --loop-id <loop_id> --apply
```

5. If verify fails or shell aborted: re-run step 4 once; record in STATE if still DOWN — stop hook will recovery-wake

Full arming rules: [`.cursor/rules/agent-loop-contract.mdc`](../../../.cursor/rules/agent-loop-contract.mdc).
