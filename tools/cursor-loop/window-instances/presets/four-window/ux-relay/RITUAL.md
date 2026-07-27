# Ritual — ux-relay

**extends:** `designer`  
**base:** [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md)

## Phase 2 — Review

Read `../po-relay/STATE.md` `UI_PROPOSALS`; update `LAST_REVIEW`; `git status`.

## Phase 3 — Select

Top agreed `ui-*` from `UI_POLISH_BACKLOG`; resume `IN_PROGRESS` if set.

## Phase 4 — Execute

1. Web research how reference app implements the target pattern
2. ui-ux-pro-max design-system search
3. 21st-cache / 21st-cli before hand-writing components
4. Ship UI diff for selected `ui-*`

## Phase 5 — Verify

**Build (required):**

```bash
cd pwa && npm run build
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

## Phase 6 — Review

`/code-review` on UI diff + visual parity vs reference app in IDENTITY matrix.

## Phase 7 — Triage

Resolve each `UI_PROPOSALS` row; log `UX_GAPS` for PO if new gaps found.

## Phase 8 — Close

HISTORY, CHECKPOINT, backlog checkboxes.

## Phase 9 — Arm

Follow [`../_template/RITUAL.base.md`](../_template/RITUAL.base.md) Phase 9 checklist.

**This window:** `loop_id=ux-relay`, env from [INSTANCE.md](INSTANCE.md) Loop config table.  
**Evidence:** `--evidence <ui-id>` on checkpoint.
