# Code Review

Review the current branch changes or uncommitted diff with a critical eye.

## Focus areas

1. **Bugs** — logic errors, null/undefined paths, race conditions, off-by-one
2. **Regressions** — behavior changes that break existing flows
3. **Security** — injection, auth gaps, secrets in code
4. **Missing tests** — critical paths without coverage
5. **Performance** — unnecessary re-renders, waterfalls, layout thrashing

## Process

1. Run `git diff` (or `git diff main...HEAD` for branch review)
2. Read changed files in context — not just the diff hunks
3. List findings by severity: critical, high, medium, low
4. For each finding: file path, issue, suggested fix

## Output format

Log findings to STATE `REVIEW_FINDINGS` table:

| id | severity | finding | source | action | backlog_ref | status |

## PO window — custom instructions

When invoked from **po-relay**, add product owner lens:

- Shipped vs backlog alignment
- Missing features (relay-* candidates with RICE)
- UI proposals (prop-ui-*)
- Quality flags (maint-* / ch-* for Code window)
- AC gaps on open backlog items

Append structured product-review block per [`po-relay/RITUAL.md`](../../docs/window-instances/po-relay/RITUAL.md).

## UX window

Add 390px visual check per [`ux-relay/RITUAL.md`](../../docs/window-instances/ux-relay/RITUAL.md) Phase 5.

## Code window

Focus on structure, DRY, naming clarity, patchwork vs root-cause fixes.
