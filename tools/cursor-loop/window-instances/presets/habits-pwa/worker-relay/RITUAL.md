# Ritual — worker-relay

**extends:** `engineer`  
**base:** [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md)

## Phase 1 — Wake

**First action — before reading any file:**

```bash
bash tools/cursor-loop/scripts/advance_ritual_step.sh . \
  --state-file docs/window-instances/worker-relay/STATE.md \
  --loop-id worker-relay \
  --apply
```

Read INSTANCE → IDENTITY → RITUAL. Read wake JSON `state_snapshot` — **never read `STATE.md` directly**. If `idle_mode=true` in the wake JSON `state_snapshot`: immediately run:

```bash
state_api.sh . --loop-id worker-relay set checkpoint idle_mode_triggered=yes idle_rescue_done=no
```

This arms the anti-idle gate in `validate_ritual_gate.py`. Arm is blocked until Phase 3 self-rescue sets `idle_rescue_done=yes`.

## Phase 2 — Orient

Snapshot own state — **do not open STATE.md directly**:

```bash
bash tools/cursor-loop/scripts/prepare_orient_tick.sh . \
  --state-file docs/window-instances/worker-relay/STATE.md \
  --loop-id worker-relay
```

`git status`; `git log -3`; update `LAST_REVIEW` via `state_api set last-review`.

## Phase 3 — Select

**ANTI-IDLE MANDATE** — If `idle_mode_triggered=yes` in CHECKPOINT (set during Phase 1 when wake JSON contained `idle_mode: true`), self-rescue is the FIRST action — before any item selection. Execute self-rescue steps 1–5 below immediately. After creating ≥3 new items:

```bash
state_api.sh . --loop-id worker-relay set checkpoint idle_rescue_done=yes idle_mode_triggered=no
```

`validate_ritual_gate.py` blocks arm until `idle_rescue_done=yes`. An idle-checkpoint-sync re-arm without this is FORBIDDEN.

Resume `IN_PROGRESS` if set. Otherwise pick top unchecked `- [ ]` item from BACKLOG.

**If BACKLOG has < 3 open items — mandatory self-rescue before Phase 4:**

1. Read `docs/window-instances/po-relay/STATE.md` → scan BRAINSTORM_LOG last 5 sessions + any `UI_PROPOSALS` rows with `status=refined` or `proposed` and no `relay-*` `backlog_ref`
2. Read `docs/window-instances/NEXT_PHASE.md` for any cross-instance relay signals
3. Derive next relay-N items (IDs continuing from last relay-* in HISTORY); validate then append via `state_api` — **never edit STATE.md directly**:

```bash
# Validate each row first; items failing validation are held as drafts, not written
python3 tools/cursor-loop/scripts/validate_handoff_item.py "- [ ] relay-N | <title> | <type> | Given X; When Y; Then Z"
state_api.sh . --loop-id worker-relay append backlog-row \
  --section BACKLOG \
  --id relay-N \
  --row "- [ ] relay-N | <title> | <type> | <AC one-liner>"
```

4. If po-relay has nothing actionable: scan `pwa/src/` + `server/` git log and open REVIEW_FINDINGS for accessibility gaps, polish issues, or quality items to convert to relay-* tasks
5. Also promote any REVIEW_FINDINGS rows with `action=backlog` and `backlog_ref=—` to new backlog items via `state_api` — **never edit STATE.md directly**:

```bash
state_api.sh . --loop-id worker-relay append backlog-row \
  --section BACKLOG \
  --id relay-N \
  --row "- [ ] relay-N | <title> | <type> | <AC one-liner>"
# Then update backlog_ref on the REVIEW_FINDINGS row:
state_api.sh . --loop-id worker-relay set review-finding \
  --id <rf-id> backlog_ref=relay-N status=backlog
```

6. **If BACKLOG is still empty after steps 1–5 — wake PO immediately:**

```bash
# Signal worker is starved; PO Phase 2 will seed ≥3 items on its next tick
state_api.sh . --loop-id worker-relay set checkpoint next_action=needs_po_backlog_seed
# Trigger PO loop if it is NOTIFY-armed
cwin trigger-all --loop-id po-relay --force --reason spin
```

Then append one self-derived placeholder item via `state_api` (see step 3 pattern) so this wake does not idle, and wait for PO to seed on its next tick.

**Never end Phase 3 with an empty or sub-3-item BACKLOG.** Every wake must exit this phase with ≥1 selected item to execute.

**Worktree (code items):** mandatory prep then create before Phase 4:

```bash
bash tools/cursor-loop/scripts/prepare_select_tick.sh . \
  --state-file docs/window-instances/worker-relay/STATE.md \
  --loop-id worker-relay
bash tools/cursor-loop/scripts/instance_worktree.sh create . \
  --loop-id worker-relay \
  --item-id <backlog-id> \
  --state-file docs/window-instances/worker-relay/STATE.md
```

Phases 4–7 run inside `WORKTREE_PATH` (create auto-patches CHECKPOINT).

## Phase 4 — Execute

Ship `relay-*` feature code. Chain items in same wake when possible.

**Refactor subcheckpoints** (maintenance / `fix()` / shared hooks — set `refactor_subphase`; pure feature adds may use `none`):

| Subphase | Skill | Action |
|----------|-------|--------|
| `plan` | `request-refactor-plan` + `HABITS.md` | `REFACTOR_PLAN` rows; one micro-step per later wake |
| `smell` | `refactoring-expert` | Log smell + technique; no edits |
| `execute` | `refactoring-specialist` | One step; allowlisted files only |

## Phase 5 — Verify

```bash
python3 tools/cursor-loop/scripts/validate_refactor_step.py . \
  --loop-id worker-relay \
  --state-file docs/window-instances/worker-relay/STATE.md
cd pwa && npm run build
cd pwa && npm run lint        # oxlint — zero errors required
python3 -c "import habits_api.main"   # if server/ changed
curl -s http://127.0.0.1:8787/healthz   # optional, server running
bash tools/cursor-loop/scripts/prepare_review_tick.sh . \
  --state-file docs/window-instances/worker-relay/STATE.md \
  --loop-id worker-relay \
  --apply
```

**Journey test (mandatory for any `feat:` or `ui-` commit):** Run the
end-to-end check-in journey — this is what proves the user can actually
get from Home through every main tab without crashing.

```bash
cd pwa && npm run test:journey
```

The journey test mounts `<App />` under jsdom, stubs the network,
polyfills `matchMedia`, and walks Home → Log → Day → Cards → Home.
A `feat:`/`ui-` commit that breaks this test is a regression even
if every unit test still passes. Attach the journey-run output to the
commit body in the form:

```
test:journey: 2 passed, 1.05s
```

If the journey fails, fix it before closing Phase 8 — or split the
change into smaller commits so the offending feature lands on its own
branch with a follow-up test.

Apply script output via `state_api` — never edit STATE.md directly:

```bash
# code_changed=yes
state_api.sh . --loop-id worker-relay set checkpoint \
  code_changed=yes \
  review_round=<N+1> \
  review_diff_range=uncommitted \
  review_status=pending
# code_changed=no
state_api.sh . --loop-id worker-relay set checkpoint code_changed=no
```

Cannot carry `review_status=done` from a prior tick when git diff is non-empty.

Area-specific checks when touching: Home rings, Log swipe/scan, Day timeline, Cards CRUD, Agent chat.

**React component changes:** Invoke `vercel-react-best-practices` skill — verify memo usage, bundle impact, and client/server boundary correctness.

## Phase 6 — Code review (Round N)

Required when `code_changed=yes`.

**Mandatory:** Invoke [`/code-review`](../../../.cursor/commands/code-review.md) — read the full command file first. Announce: "Using /code-review to review Round N."

1. Run `/code-review` on diff — bugs, regressions, missing tests, active `relay-*` AC
2. Log findings as `rf-r{N}-{seq}` with `source=round-{N}`
3. Zero issues → sentinel `rf-r{N}-000`

## Phase 7 — Receive + backlog reflect (Round N)

Required when `code_changed=yes`.

### Phase 7a — Receive (mandatory skill + command)

Read Superpowers **receiving-code-review** skill, then invoke [`/receiving-code-review`](../../../.cursor/commands/receiving-code-review.md).

1. Triage every round-N row: `fix-now` | `backlog` | `closed` | `pushback`
2. Implement fix-now in worktree / `pwa/` / `server/`; re-verify build if needed

### Phase 7b — Backlog reflect (mandatory)

Every deferred finding → backlog row with id, priority, AC. Set `backlog_ref` on the REVIEW_FINDINGS row. Create `relay-*` items in BACKLOG for deferred findings. Cannot close until complete.

**Fresh-eye pass (mandatory before Phase 8):** Re-read the full diff as if encountering it for the first time — not as the author. Check for stray `any`, dead variables, missing null guards, and regressions that implementation focus obscured. Log new finds as `rf-r{N}-fresh-{seq}` and triage before close.

## Phase 8 — Close

When `worktree_status=active`:

```bash
bash tools/cursor-loop/scripts/instance_worktree.sh merge . --loop-id worker-relay \
  --apply
bash tools/cursor-loop/scripts/instance_worktree.sh remove . --loop-id worker-relay \
  --apply
```

Then set `worktree_status=none` and clear worktree path/branch/item fields.

**AC completion check (mandatory):** For the closed item, verify each Given/When/Then AC clause was exercised. Items with unmet ACs → set `partial-close` flag and create a follow-up `relay-*` item before marking `done`.

HISTORY, CHECKPOINT (`phase=8-close`, `review_status`), clear IN_PROGRESS, commit.

## Phase 9 — Arm

Follow [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md) Phase 9 checklist.

**This window:** `loop_id=worker-relay`, env from [INSTANCE.md](INSTANCE.md) Loop config table.  
**Evidence:** `--evidence <relay-id>` on checkpoint.
