# Ritual — code-health

**extends:** `engineer` (refactor variant)  
**base:** [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md)

## Phase 1 — Wake

Read INSTANCE → IDENTITY → RITUAL. If `idle_mode=true` in the wake JSON `state_snapshot`: immediately run:

```bash
state_api.sh . --loop-id code-health set checkpoint idle_mode_triggered=yes idle_rescue_done=no
```

This arms the anti-idle gate in `validate_ritual_gate.py`. Arm is blocked until Phase 3 self-rescue sets `idle_rescue_done=yes`.

## Phase 2 — Orient

Snapshot own state — **do not open STATE.md directly**:

```bash
bash tools/cursor-loop/scripts/prepare_orient_tick.sh . \
  --state-file docs/window-instances/code-health/STATE.md \
  --loop-id code-health
```

`git status`; `git log -10 --oneline`; `git diff --stat`; patchwork clusters; update `LAST_REVIEW` via `state_api set last-review`.

```bash
python3 tools/cursor-loop/scripts/check_module_sizes.py . --threshold 500
python3 tools/cursor-loop/scripts/patchwork_detector.py . --commits 20 --threshold 3
```

Files reported as oversized → add `ch-oversize-*` items to `REFACTOR_BACKLOG` if not already present.
Patchwork signals → add `ch-patchwork-*` items to `REFACTOR_BACKLOG` if not already present.

## Phase 3 — Select

**ANTI-IDLE MANDATE** — If `idle_mode_triggered=yes` in CHECKPOINT, self-rescue is the FIRST mandatory action before any item selection. Run module size scan and patchwork detection to generate ≥3 new items:

```bash
python3 tools/cursor-loop/scripts/check_module_sizes.py . --threshold 500
python3 tools/cursor-loop/scripts/patchwork_detector.py . --commits 20 --threshold 3
```

Append new `ch-oversize-*` and `ch-patchwork-*` items via `state_api`. After creating ≥3 new items:

```bash
state_api.sh . --loop-id code-health set checkpoint idle_rescue_done=yes idle_mode_triggered=no
```

`validate_ritual_gate.py` blocks arm until `idle_rescue_done=yes`.

Resume `IN_PROGRESS` OR top `REFACTOR_BACKLOG` / `BUG_BACKLOG` OR next `SCAN_COVERAGE` row.

**Worktree (code items):** mandatory prep then create before Phase 4:

```bash
bash tools/cursor-loop/scripts/prepare_select_tick.sh . \
  --state-file docs/window-instances/code-health/STATE.md \
  --loop-id code-health
bash tools/cursor-loop/scripts/instance_worktree.sh create . \
  --loop-id code-health \
  --item-id <backlog-id> \
  --state-file docs/window-instances/code-health/STATE.md
```

Phases 4–7 run inside `WORKTREE_PATH` (create auto-patches CHECKPOINT).

## Phase 4 — Execute (refactor subcheckpoints)

Set `CHECKPOINT.refactor_subphase` and advance **plan → smell → execute** inside this phase (do not skip ritual phase numbers).

| Subphase | Skill | Action |
|----------|-------|--------|
| `plan` | `improve-code-quality` → `request-refactor-plan` + `HABITS.md` | Run `improve-code-quality` checklist first; write `REFACTOR_PLAN` rows via `state_api append refactor-plan`; set `refactor_plan_id`, `refactor_step_n=1` |
| `smell` | `refactoring-expert` | Name smell + technique on current step row; **no app edits** |
| `execute` | `refactoring-specialist` | **One plan step only**; allowlisted files only |

Resume: if `IN_PROGRESS` + incomplete plan → continue at last subphase.

**Python file changes (before `execute` subphase):** Invoke `python-fact-grounded-coding` skill — ground changes in verified Pylance type facts before editing. Then invoke `pylance-refactoring` skill — check for unused imports and infer type annotations on modified functions.

Brainstorm 2 approaches only when subphase=`plan`. Line-by-line checklist below = self-check after expert pass.

### Line-by-line checklist (score pass / warn / fail)

**Correctness:** null guards, error paths, races, offline/queue consistency, no stray `any`

**Robustness:** no patchwork; business rules in lib/hooks once; side effects isolated

**Structure:** sections orchestrate; components present; hooks subscribe; routes thin

**Readability:** intent names; functions ≤ ~40 lines; no mystery booleans; import order

**File naming:** one export per file; filename matches export; hooks `use*`; no `utils.ts` maze

**DRY:** repeated JSX/conditionals (≥2) → component or hook; shared types in `lib/`

**Patchwork signals:** 3+ fixes same file; per-tab banners → shared awareness component; queue state scattered → centralize

## Phase 5 — Verify

```bash
python3 tools/cursor-loop/scripts/validate_refactor_step.py . \
  --loop-id code-health \
  --state-file docs/window-instances/code-health/STATE.md
cd pwa && npm run build
cd pwa && npm run lint        # oxlint — zero errors required
cd server && python -m compileall habits_api   # when Python touched
bash tools/cursor-loop/scripts/prepare_review_tick.sh . \
  --state-file docs/window-instances/code-health/STATE.md \
  --loop-id code-health \
  --apply
```

Apply script output via `state_api` — never edit STATE.md directly:

```bash
# code_changed=yes
state_api.sh . --loop-id code-health set checkpoint \
  code_changed=yes \
  review_round=<N+1> \
  review_diff_range=uncommitted \
  review_status=pending
# code_changed=no
state_api.sh . --loop-id code-health set checkpoint code_changed=no
```

**Regression spot-checks (when area touched):**

| Area | Check |
|------|--------|
| Meal plan queue | Dismiss clears failed ids; remote banner navigates |
| Log swipe | Directions + undo toast |
| Cards | Search/filter + FAB create |
| Offline | Queue banners when server offline |

## Phase 6 — Code review (Round N)

Required when `code_changed=yes`. Phase 4 checklist = self-check; Phase 6 = formal review.

**Mandatory:** Invoke [`/code-review`](../../../.cursor/commands/code-review.md) — read the full command file first. Announce: "Using /code-review to review Round N."

1. Run `/code-review` — structure, DRY, naming, patchwork vs root-cause
2. Log findings as `ch-r{N}-{seq}` with `source=round-{N}`
3. Zero issues → sentinel `ch-r{N}-000`

## Phase 7 — Receive + backlog reflect (Round N)

Required when `code_changed=yes`.

### Phase 7a — Receive (mandatory skill + command)

Read Superpowers **receiving-code-review** skill, then invoke [`/receiving-code-review`](../../../.cursor/commands/receiving-code-review.md).

1. Triage every round-N row: `fix-now` | `backlog` | `closed` | `pushback`
2. Implement fix-now in worktree; re-verify build if needed
3. Route cross-cutting items to Worker BACKLOG; else REVIEW_FINDINGS or BUG_BACKLOG

### Phase 7b — Backlog reflect (mandatory)

Every deferred finding → backlog row with id, priority, AC. Set `backlog_ref` on the REVIEW_FINDINGS row. Create `ch-*` / BUG_BACKLOG / REFACTOR_BACKLOG items for deferred findings. Cannot close until complete.

**Fresh-eye pass (mandatory before Phase 8):** Re-read the changed files as if reviewing a colleague’s PR — not as the author. Check for patchwork signals, missed DRY opportunities, and new code smells introduced. Log new finds as `ch-r{N}-fresh-{seq}` and triage before close.

## Phase 8 — Close

When `worktree_status=active`:

```bash
bash tools/cursor-loop/scripts/instance_worktree.sh merge . --loop-id code-health \
  --apply
bash tools/cursor-loop/scripts/instance_worktree.sh remove . --loop-id code-health \
  --apply
```

Then set `worktree_status=none` and clear worktree path/branch/item fields.

HISTORY, SCAN_COVERAGE, CHECKPOINT, backlogs. No warn/fail on touched files without backlog entry.

## Phase 9 — Arm

Follow [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md) Phase 9 checklist.

**This window:** `loop_id=code-health`, env from [INSTANCE.md](INSTANCE.md) Loop config table.  
**Evidence:** `--evidence <ch-id>` on checkpoint.
