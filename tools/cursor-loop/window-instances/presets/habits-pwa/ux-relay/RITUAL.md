# Ritual — ux-relay

**extends:** `designer`  
**base:** [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md)

## Phase 1 — Wake

**First action — before reading any file:**

```bash
bash tools/cursor-loop/scripts/advance_ritual_step.sh . \
  --state-file docs/window-instances/ux-relay/STATE.md \
  --loop-id ux-relay \
  --apply
```

Read INSTANCE → IDENTITY → RITUAL; read wake JSON `state_snapshot` — **never read `STATE.md` directly**; confirm `loop_id`.

## Phase 2 — Orient

Read po-relay UI_PROPOSALS and own CRITIQUE_BACKLOG via handoff — never open STATE.md files directly:

```bash
# po-relay proposals (UI_PROPOSALS_ACTIVE)
state_api.sh . --loop-id ux-relay get handoff --target po-relay
```

Triage **≥1** `CRITIQUE_BACKLOG` row with `status=proposed` from ux-critic (mandatory SLA); update `LAST_REVIEW`; `git status`.

## Phase 3 — Select

Top agreed `ui-*` from `UI_POLISH_BACKLOG`; resume `IN_PROGRESS` if set.

**Worktree (code items):** mandatory prep then create before Phase 4:

```bash
bash tools/cursor-loop/scripts/prepare_select_tick.sh . \
  --state-file docs/window-instances/ux-relay/STATE.md \
  --loop-id ux-relay
bash tools/cursor-loop/scripts/instance_worktree.sh create . \
  --loop-id ux-relay \
  --item-id <backlog-id> \
  --state-file docs/window-instances/ux-relay/STATE.md
```

Phases 4–7 run inside `WORKTREE_PATH` (create auto-patches CHECKPOINT).

## Phase 4 — Execute

1. Web research how reference app implements the target pattern
2. ui-ux-pro-max design-system search
3. 21st-cache / 21st-cli before hand-writing components
4. Ship UI diff for selected `ui-*`
5. **Component state coverage:** Invoke `interaction-design` skill — confirm component covers all 5 states: hover, focus, error, loading, empty. Missing states must be added before Phase 5.

**Refactor subcheckpoints** when item touches hooks/lib (CSS-only: set `refactor_subphase=none`):

| Subphase | Skill | Action |
|----------|-------|--------|
| `plan` | `request-refactor-plan` + `HABITS.md` | `REFACTOR_PLAN` rows |
| `smell` | `refactoring-expert` | Smell + technique; no edits |
| `execute` | `refactoring-specialist` | One step; allowlisted files |

## Phase 5 — Verify

```bash
python3 tools/cursor-loop/scripts/validate_refactor_step.py . \
  --loop-id ux-relay \
  --state-file docs/window-instances/ux-relay/STATE.md
cd pwa && npm run build
cd pwa && npm run lint        # oxlint — zero errors required
bash tools/cursor-loop/scripts/prepare_review_tick.sh . \
  --state-file docs/window-instances/ux-relay/STATE.md \
  --loop-id ux-relay \
  --apply
```

**Journey test (mandatory for any `feat:` or `ui-` commit):**
Run the end-to-end check-in journey so we know the user can actually
get from Home through every main tab without crashing.

```bash
cd pwa && npm run test:journey
```

The journey test mounts `<App />` under jsdom, stubs the network,
polyfills `matchMedia`, and walks Home -> Log -> Day -> Cards -> Home.
A `feat:`/`ui-` commit that breaks this test is a regression even if
every unit test still passes. Attach the journey-run output to the
commit body in the form:

```
test:journey: 2 passed, 1.05s
```

Apply script output: set `code_changed`, increment `review_round` if yes, set `review_status=pending`, record `review_diff_range` — always via `state_api`:

```bash
state_api.sh . --loop-id ux-relay set checkpoint \
  code_changed=yes \
  review_round=<N+1> \
  review_diff_range=uncommitted \
  review_status=pending
# or code_changed=no:
state_api.sh . --loop-id ux-relay set checkpoint code_changed=no
```

**API (if server touched):**

```bash
python3 -c "import habits_api.main"
```

**Live checks (when area touched):**

| Area | Steps |
|------|-------|
| Home | Rings; pull-to-refresh; decision card |
| Log | Swipe right=log; scan flow; queue banner |
| Day | Timeline + habit grid |
| Cards | CRUD persists |
| Agent | Chat streams; voice sheet |
| Settings | Server status |

**UI polish checklist:**

- [ ] ui-ux-pro-max `--design-system` run noted in HISTORY
- [ ] 21st search logged
- [ ] Visual check at **390px**
- [ ] `prefers-reduced-motion` not broken
- [ ] `harden` skill invoked — error/loading/empty states, text overflow, and edge cases verified
- [ ] `normalize` skill invoked — design tokens, spacing, and component variants match design system

## Phase 6 — Code review (Round N)

Required when `code_changed=yes`.

**Mandatory:** Invoke [`/code-review`](../../../.cursor/commands/code-review.md) — read the full command file first. Announce: "Using /code-review to review Round N."

1. Run `/code-review` on UI diff + 390px visual parity vs IDENTITY matrix
2. Log findings as `ux-r{N}-{seq}` with `source=round-{N}`
3. Zero issues → sentinel `ux-r{N}-000`

## Phase 7 — Receive + backlog reflect (Round N)

Required when `code_changed=yes`.

### Phase 7a — Receive (mandatory skill + command)

Read Superpowers **receiving-code-review** skill, then invoke [`/receiving-code-review`](../../../.cursor/commands/receiving-code-review.md).

1. Triage every round-N row: `fix-now` | `backlog` | `closed` | `pushback`
2. Implement fix-now in worktree / `pwa/`; re-verify build + 390px if needed
3. Also triage `UI_PROPOSALS` and `CRITIQUE_BACKLOG`; log `UX_GAPS` for PO if new gaps found

### Phase 7b — Backlog reflect (mandatory)

Every deferred finding → backlog row with id, priority, AC. Set `backlog_ref` on the REVIEW_FINDINGS row. Create `ui-*` items in UI_POLISH_BACKLOG for deferred findings. Cannot close until complete.

**Fresh-eye pass (mandatory before Phase 8):** Re-read the full diff as if encountering it for the first time. Check visual consistency, token usage, missing states, and regressions not visible in implementation mode. Log new finds as `ux-r{N}-fresh-{seq}` and triage before close.

**CRITIQUE_BACKLOG:** every `rejected` row must have non-empty `ux_response` before Phase 8 close. Mark `shipped` when linked `ui-*` merges.

## Phase 8 — Close

When `worktree_status=active`:

```bash
bash tools/cursor-loop/scripts/instance_worktree.sh merge . --loop-id ux-relay \
  --apply
bash tools/cursor-loop/scripts/instance_worktree.sh remove . --loop-id ux-relay \
  --apply
```

Then set `worktree_status=none` and clear worktree path/branch/item fields.

HISTORY, CHECKPOINT, backlog checkboxes.

## Phase 9 — Arm

Follow [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md) Phase 9 checklist.

**This window:** `loop_id=ux-relay`, env from [INSTANCE.md](INSTANCE.md) Loop config table.  
**Evidence:** `--evidence <ui-id>` on checkpoint.
