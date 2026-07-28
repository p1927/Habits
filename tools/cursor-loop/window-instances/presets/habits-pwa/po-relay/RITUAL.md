# Ritual — po-relay

**extends:** `product`  
**base:** [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md)

## Phase 2 — Orient

Read CHECKPOINT, backlogs, `git log -5 --oneline`; update `LAST_REVIEW`.

**Cross-instance check (mandatory):** Count open items in worker-relay BACKLOG via handoff:

```bash
state_api.sh . --loop-id po-relay get handoff --target worker-relay
```

If the returned `open_backlog` has fewer than 3 items, this tick **must** generate ≥1 new `relay-N` row in Phase 4 PO lens before arm.

## Phase 4 — Execute (3-lens brainstorm)

Run **three separate lens sessions**; append each to `BRAINSTORM_LOG` with tag.

### UX designer lens

- Invoke `ux-heuristics` and `plan-design-review` skills — evidence-backed gap identification before writing proposals
- Visual hierarchy on 390px — primary action in 2s?
- Nielsen heuristics: error prevention, recognition over recall
- Per-tab gap vs inspiration matrix (`ux-relay/IDENTITY.md`)
- AI-slop detection — generic grids, purple gradients
- Seed/refine `prop-ui-*` or `ux-*` candidates

### Product owner lens

- Each backlog item traces to user outcome?
- RICE top 5 candidates
- Merge duplicates; drop vague items
- Rewrite AC as Given/When/Then
- **Mandatory when worker BACKLOG < 3 open items:** Append new `relay-N` rows via `state_api` (never edit worker STATE.md directly):

```bash
state_api.sh . --loop-id worker-relay append backlog-row \
  --section BACKLOG \
  --id relay-N \
  --row "- [ ] relay-N | <title> | <type> | <AC one-liner>"
```

At least 1 new row per PO tick when worker open count < 3.
- **Handoff validation (mandatory):** Before appending any `relay-N` row, run `python3 tools/cursor-loop/scripts/validate_handoff_item.py "<row>"` against it. Items failing validation (missing Given/When/Then AC, missing or invalid type) are held in `BRAINSTORM_LOG` as `draft` status — not written to worker BACKLOG.

### Business owner lens

- Invoke `saas-metrics-coach` + `product-strategist` skills — ground ROI and retention estimates in SaaS metric frameworks (LTV/DAU/retention curves) before proposing roadmap items
- Core job: "Track health habits without spreadsheet friction"
- Hook loop: trigger → action → variable reward → investment
- Retention: rings viewed + food logged
- ROI vs manual Sheets entry

## Phase 5 — Verify

Log all three lenses in `BRAINSTORM_LOG` with timestamp. At least one backlog mutation (not read-only).

**Worker BACKLOG gate:** Confirm the `open_backlog` returned by `state_api get handoff --target worker-relay` has ≥3 items OR this tick appended ≥1 new `relay-N` row via `state_api`. If neither is true, return to Phase 4 PO lens before proceeding.

```bash
bash tools/cursor-loop/scripts/prepare_review_tick.sh . \
  --state-file docs/window-instances/po-relay/STATE.md \
  --loop-id po-relay \
  --apply
```

Set `code_changed` via `state_api` (usually `no` for PO — PO does not ship code):

```bash
state_api.sh . --loop-id po-relay set checkpoint code_changed=no
```

If reviewing others' shipped code in Phase 6, set `review_diff_range` to branch range (e.g. `main...HEAD`).

## Phase 6 — Product code review (Round N)

Run when reviewing shipped code (typical every tick) OR when `code_changed=yes`.

**Mandatory:** Invoke [`/code-review`](../../../.cursor/commands/code-review.md) — read the full command file first. Announce: "Using /code-review to review Round N."

1. `git log -10 --oneline` + `git diff main...HEAD --stat`
2. Skim `pwa/src/` and `server/` (read-only)
3. Run `/code-review` with PO lens: missing features, weak AC, RICE, cross-feed
4. Validate `UI_PROPOSALS`; read ux-relay UX_GAPS via handoff: `state_api.sh . --loop-id po-relay get handoff --target ux-relay`
5. Cross-check worker-relay BACKLOG vs shipped code: `state_api.sh . --loop-id po-relay get handoff --target worker-relay`

Log **all** output as REVIEW_FINDINGS rows (`pr-r{N}-{seq}`, `source=round-{N}`). Do not use freeform Product review blocks.

Categories to cover each tick:

- Shipped vs backlog
- Missing features (`relay-*`)
- UI proposals (`prop-ui-*`)
- Quality flags (`maint-*` / `ch-*`)
- AC gaps

Zero issues → sentinel `pr-r{N}-000`.

## Phase 7 — Receive + backlog reflect (Round N)

Required when `code_changed=yes`.

### Phase 7a — Receive (mandatory skill + command)

Read Superpowers **receiving-code-review** skill, then invoke [`/receiving-code-review`](../../../.cursor/commands/receiving-code-review.md).

1. Triage every round-N row: `fix-now` | `backlog` | `closed` | `pushback`
2. Do not ship code — route fix-now handoffs as notes to target windows

### Phase 7b — Backlog reflect (mandatory)

Every deferred finding → backlog row with id, priority, AC. Set `backlog_ref` on the REVIEW_FINDINGS row. Cannot close until complete.
Route to worker BACKLOG (`relay-*`), UI_PROPOSALS (`prop-ui-*`), or QUALITY_BACKLOG (`maint-*`, `ch-*`).

## Phase 8 — Close

**Worktree:** docs-only ticks keep `worktree_status=none`. If mutating code paths, create worktree per [`RITUAL.base.md`](../_template/RITUAL.base.md) Phase 3.

**Backlog staleness check (mandatory):** Scan all backlog rows across the three lens sections. Items not started with `created_at` older than 14 days → break down, re-prioritize, or explicitly park with a reason. Do not leave stale items silently blocking the queue.

Update via `state_api` — never edit STATE.md directly:

```bash
state_api.sh . --loop-id po-relay append history --item-id <id> --outcome <...> --evidence <git-head>
state_api.sh . --loop-id po-relay set checkpoint phase=8-close review_status=<status>
```

Promote `UX_GAPS` → `UI_PROPOSALS` where agreed (use `state_api set checkpoint` to record confirmed_next).

## Phase 9 — Arm

Follow [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md) Phase 9 checklist.

**This window:** `loop_id=po-relay`, env from [INSTANCE.md](INSTANCE.md) Loop config table.  
**Evidence:** `--evidence <backlog-id-or-path>` on checkpoint.
