# Ritual — ux-critic

**extends:** `product`  
**base:** [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md)

## Phase 2 — Orient

Read CHECKPOINT (`tick_count`, `tick_mode`), `JOURNEY_BACKLOG`, `AUDIT_ROTATION`, `CRITIQUE_LOG`, `CRITIQUE_OUTCOMES`; read-only skim `../po-relay/STATE.md` `UI_PROPOSALS` and `../ux-relay/STATE.md` `CRITIQUE_BACKLOG` + `UI_POLISH_BACKLOG`; update `LAST_REVIEW`.

If ux-relay has `CRITIQUE_BACKLOG` rows with `status=shipped` and no `CRITIQUE_OUTCOMES` row → next tick is **validation** (override tick mode).

## Phase 3 — Select

**Validation tick** (every 5th `tick_count` OR pending shipped critiques without outcomes):

- Pick oldest `shipped` `crit-*` without `CRITIQUE_OUTCOMES` entry
- Set `tick_mode=validation`; skip to Phase 4 validation pipeline

**Journey tick** (odd `tick_count + 1`, e.g. tick 1, 3, 5):

- Pick `journey-*` from `JOURNEY_BACKLOG` with oldest `last_audited`
- Set `tick_mode=journey`; read journey skills (JTBD, hooked-ux, interaction-design, continuous-discovery)

**Element tick** (even `tick_count + 1`, e.g. tick 2, 4, 6):

- Resume open local `crit-*` OR advance `AUDIT_ROTATION` to next tab
- Set `tick_mode=element`

No worktree — docs-only ticks only.

## Phase 4 — Execute

### Validation pipeline (`tick_mode=validation`)

1. Read shipped `ui-*` diff (read-only `pwa/src/`)
2. Compare against original `crit-*` AC and evidence
3. Append `CRITIQUE_OUTCOMES` row: `validated` | `partial` | `missed` + learnings
4. Run `plan-design-review` on critique accuracy
5. Set `code_changed=no` but **Phase 6 mandatory** on validation ticks

### Critique pipeline (`tick_mode=journey` or `element`)

Run **five mandatory substeps** in order. Cannot proceed to Phase 5 without all logged in `CRITIQUE_LOG`.

#### 4a — Brainstorm

- Read Superpowers **brainstorming** skill
- 2–3 design directions (not implementation)
- Pros/cons debate → pick recommended direction; **name rejected alternatives**
- Set `design_deliberation_done=yes`, log in `CRITIQUE_LOG`

#### 4b — App grounding (mandatory before research)

- Read ≥2 files under `pwa/src/` for target surface/journey touchpoints
- Quote current behavior in Evidence block
- Confirm gap not already in PO `UI_PROPOSALS`, ux-relay `CRITIQUE_BACKLOG`, or shipped `ui-*`

#### 4c — Web research

- Search industry patterns + latest UX guidance
- ≥1 cited source (URL or named publication)
- Run ui-ux-pro-max design-system search; note query

#### 4d — App teardown

- Compare Habits vs primary reference from inspiration matrix
- Document **mobile (390px)** and **desktop** separately
- Journey tick: cover ≥2 touchpoints in teardown

#### 4e — Critical audit + handoff

- Run: `critique`, `plan-design-review`, `ux-heuristics`, `web-design-guidelines`, `adapt`
- Score rubric (5 dimensions, 1–5); avg must be ≥3.0; `impact` must be ≥3
- Append full-schema row to local `CRITIQUE_BACKLOG` and mirror to `../ux-relay/STATE.md` `CRITIQUE_BACKLOG` with `status=proposed`

## Phase 5 — Verify

Confirm hard gates:

- [ ] `CRITIQUE_LOG` entry with brainstorm, rejected alternatives named, Evidence block complete
- [ ] ≥2 `pwa/src/` paths in `habits_files_read` column
- [ ] ≥1 web citation
- [ ] ≥1 reference-app comparison (mobile + desktop)
- [ ] `crit-*` row present in ux-relay `CRITIQUE_BACKLOG` with full schema
- [ ] No duplicate of open PO/UX items (grep confirmed)
- [ ] Journey tick: ≥2 tabs in `touchpoints`
- [ ] Rubric avg ≥3.0 and impact ≥3

```bash
python3 tools/cursor-loop/scripts/validate_critique_tick.py . \
  --state-file docs/window-instances/ux-critic/STATE.md

bash tools/cursor-loop/scripts/prepare_review_tick.sh . \
  --state-file docs/window-instances/ux-critic/STATE.md \
  --loop-id ux-critic \
  --apply
```

`validate_critique_tick.py` must exit 0 before arm. Set `code_changed=no` (typical). Increment `tick_count`. Set `review_status=skipped` with reason `docs-only critique tick` unless validation tick.

## Phase 6 — Critique quality review (Round N)

**Validation ticks:** mandatory — run `plan-design-review` on critique accuracy; log `uc-r{N}-{seq}` with `source=round-{N}`.

**Standard ticks:** skip when `code_changed=no` — log sentinel `uc-r{N}-000` in REVIEW_FINDINGS.

## Phase 7 — Receive + backlog reflect (Round N)

Required only when `code_changed=yes`. Read Superpowers **receiving-code-review** skill, then [`/receiving-code-review`](../../../.cursor/commands/receiving-code-review.md). Route deferred findings as new `crit-*` rows — never ship code.

## Phase 8 — Close

Update CHECKPOINT, HISTORY. On journey tick: update `JOURNEY_BACKLOG.last_audited`. On element tick: update `AUDIT_ROTATION.last_audited`. Docs-only — `worktree_status=none`.

## Phase 9 — Arm

Follow [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md) Phase 9 checklist.

**This window:** `loop_id=ux-critic`, env from [INSTANCE.md](INSTANCE.md) Loop config table.  
**Evidence:** `--evidence crit-<id>` or `--evidence validation-<crit-id>` on checkpoint.
