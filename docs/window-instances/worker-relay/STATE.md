# STATE — worker-relay

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | brainstorm_notes |
|-------|-------|
| reviewed_at | 2026-08-03T11:51:41Z |
| where_we_are | Phase 2 orient at relay-226 — top unchecked open; BACKLOG has 9 open items, all relay-2xx totals-strip and Settings/Cards/Coach features |
| confirmed_next | relay-226 |
| brainstorm_notes | Phase 3 will pick relay-226 (target-unset state) since it pairs with relay-225 (empty-state) — same viewmodel classifyTotalsState returns 'no-target' branch when calorieTarget is null/0; showKcalBar/showProteinBar gates already suppress misleading progress |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | `2026-08-03T09:34:15Z` |
| next_action | `arm-relay-233` |
| phase | `8-close` |
| review_status | `skipped` |
| code_changed | `no` |
| review_round | `88` |
| last_reviewed_round | `87` |
| worktree_status | `active` |
| ritual_step | `9-arm` |
| brainstorm_done | `yes` |
| brainstorm_outcome | `relay-231 stale-data indicator: formatRelativeUpdatedAt + buildStaleIndicator pure helpers (3 kinds: fresh/stale/offline); staleIndicator field on LogTypeTotalsViewModel; ref-based Date.now() capture during render (no useEffect setState); 15s setInterval tick counter; component renders muted <p> with kind modifier class; aria-hidden to avoid 15s noise into live region` |
| execute_started | `yes` |
| fix_verify_done | `yes` |
| reflect_done | `yes` |
| commit_hash | `d9bbda6` |
| receive_review_done | `yes` |
| commit_done | `yes` |
| merge_done | `yes` |
| idle_mode_triggered | `no` |
| idle_rescue_done | `yes` |
| current_item_id | `relay-233` |
| finalize_status | `success` |
| worktree_path | `/Users/pratyushmishra/Documents/GitHub/Habits/.worktrees/worker-relay` |
| worktree_branch | `loop/worker-relay/relay-233` |
| worktree_item_id | `relay-233` |
| review_changed_files | `—` |
| review_fingerprint | `—` |
| review_diff_range | `none` |
| review_skip_reason | `No product diff in pwa/server; worker STATE metadata only` |

## IN_PROGRESS

*(empty)*

---

## BACKLOG



































 (priority ordered)






- [x] relay-224 | Merge relay-218 to main + remove leftover main stubs | quality | Given worktree branch loop/worker-relay/relay-218 has committed df5109b and main has untracked stubs pwa/src/components/LogTypeTodayTotalsStrip.tsx + pwa/src/lib/logTypeTotals.ts from an abandoned approach, When merge attempted, Then resolve by either removing main stubs and fast-forwarding, or rebasing worktree onto main stubs; verify build after
- [x] relay-226 | Log today totals strip target-unset state | feature | Given no calorie target is configured; When the totals strip renders; Then it shows consumed kcal and protein without a misleading progress percentage or remaining-calories claim, with a concise setup affordance
- [x] relay-227 | Log today totals strip keyboard focus affordance | ux | Given a keyboard user focuses the interactive totals strip; When focus enters the strip; Then a visible focus ring and accessible name identify the totals summary and Enter/Space exposes its details
- [x] relay-225 | Log today totals strip empty-state fallback | feature | Given no meals are logged today and the totals strip is visible; When the Log Type tab opens; Then the strip shows zeroed kcal/protein values, a clear ‘No meals logged yet’ message, and remains readable without implying progress
- [x] relay-228 | Log today totals strip day-over-day comparison | feature | Given today totals are visible and yesterday totals are available; When the user opens the Log Type sub-tab; Then show yesterday-vs-today kcal and protein deltas with an explicit unavailable state when yesterday data is missing
- [x] relay-230 | Totals strip pending-sync count accuracy | feature | Given optimistic food entries are pending sync; When the totals strip renders; Then show the exact pending meal count and update it after sync or failure without hiding the underlying totals
- [x] relay-232 | Log totals strip Ask Coach handoff | feature | Given the totals strip has today nutrition totals; When the user activates Ask Coach; Then Agent opens with a plain-text kcal protein and macro summary prefilled once, focus lands in the composer, and no message sends without confirmation
- [x] relay-231 | Log today totals strip stale-data timestamp | feature | Given totals are loaded from a delayed or offline response; When the totals strip renders; Then show a concise last-updated indicator and preserve the existing totals instead of presenting stale data as current
- [ ] relay-233 | Log macro contribution drill-down | feature | Given the totals strip shows protein carbs and fat; When the user activates one macro; Then today food rows reveal the top contributing meals for that macro, expose a clear-filter action, and announce the filtered result count accessibly
- [ ] relay-234 | Log seven-day nutrition trend drill-down | feature | Given at least two days of nutrition history; When the user opens the totals trend; Then show seven-day kcal and protein trends, mark missing days, provide an accessible text summary, and allow return to Today
- [x] relay-223 | Log today totals strip pending sync badge | feature | Given optimistic food entries are pending or queued locally; When the Log Type totals strip renders; Then its footer shows the exact pending meal count beside confirmed totals and updates after success or failure
- [ ] relay-236 | Settings Granted Scopes panel (SettingsGrantedScopesPanel) | feature | Given a privacy-conscious user on Settings Google card with no scope listing shown; When the card loads; Then the panel lists granted Calendar and Sheets scopes with human labels, includes a Manage on Google Account link, and shows a Re-connect CTA when any scope is missing
- [ ] relay-237 | Cards body-first capture (CardsBodyFirstCapture) | feature | Given a knowledge worker opens the Cards create sheet; When the sheet opens with an empty body; Then the body textarea receives autofocus, Save is enabled when body is non-empty without requiring a title, and the saved card derives its title from the first body line capped at 80 chars
- [ ] relay-238 | Coach inline tool steps (CoachInlineToolSteps) | feature | Given a skeptical new user sends a first Agent prompt; When tools are running and tokens have not yet arrived; Then the empty streaming assistant bubble shows a vertical step list of active tools with status labels, checkmarks on completed tools, and an aria-live Coach is working announcement; steps hide once tokens arrive
- [ ] relay-239 | Log totals strip reuse food history fetch (relay-228 dedupe) | refactor | Given LogTypeTodayTotalsStrip mounts and calls api.getFoodHistory(2) while useLogSectionData already calls api.getFoodHistory(14) in the containing Log section; When the Type sub-tab mounts; Then the strip should reuse the section-level history payload (lift state up) to avoid a redundant Sheets read per panel mount
- [ ] relay-240 | AppTabContent useCallback wrap nav callbacks | refactor | Given AppTabContent wraps useAppShellNavigation callbacks (navigateAgentPrompt, navigateLogType, etc.) in inline arrows that create new identities every render; When useLogSection/useDaySection/useHomeSection pass those identities into their deps arrays; Then useMemo invalidations cascade and tab panels rebuild unnecessarily; wrap each nav callback in useCallback so identity is stable across renders
- [x] relay-231 | Log today totals strip stale-data timestamp | feature | Given totals are loaded from a delayed or offline response; When the totals strip renders; Then show a concise last-updated indicator and preserve the existing totals instead of presenting stale data as current
- [ ] relay-241 | Day schedule-to-log completion handoff | feature | Given a scheduled habit is completed in Day; When the user marks it done; Then the completion appears in Log with the source schedule label and a link back to the Day event
- [ ] relay-242 | Agent coach follow-up from nutrition totals | feature | Given today totals are visible in Log; When the user selects Ask Coach; Then Agent opens with the totals context attached and the user can remove that context before sending
- [ ] relay-243 | Cards capture-to-habit conversion | feature | Given a saved Card contains a habit idea; When the user chooses Turn into habit; Then a prefilled habit draft opens with title and first-line context and requires explicit confirmation before creation
## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Queue sort parity | relay-130 | done |
| Lighthouse PWA | ROADMAP | relay-160 done (97/100/100) |
| ui-038 Agent SSE streaming | maintenance | done relay-165 |
| Tab shortcut hints | relay-182 | extend to Day/Cards |

---

## REVIEW_FINDINGS


















































































| id | severity | finding | source | action | backlog_ref | status |
|----|----------|---------|--------|--------|-------------|--------|
| rf-r87-000 | low | Bugbot skill absent locally (matches rf-r78/r83/r85/r86 pattern); window-lens review of relay-231: AC satisfied — pure helper buildStaleIndicator covers 3 kinds (fresh within 60s window, stale past window with sign-symmetric minute bucketing, offline when serverOnline=false); component captures Date.now() in a ref during render (documented React pattern) and re-stamps on data identity change; 15s setInterval ticks freshnessTick counter to drive re-renders without invalidating the viewmodel memo every render; stale-indicator <p> has aria-hidden=true to keep 15s noisy updates out of the polite live region; data-testid log-type-totals-strip-stale + kind modifier class (--fresh/--stale/--offline) wired through CSS; offline variant gets italic + text-secondary for visual differentiation; fresh/stale stay at --muted; 220 vitest pass + 1 pre-existing skip + 0 lint errors + build clean + journey 2/2; deferred (in commit body): freshnessTick eslint-disable (lint cant suppress single line), offline→online transition UX (no "Refreshing…" intermediate). | round-87 /code-review | closed | — | open |
| rf-r86-lens-001 | low | Window-lens per-file pass on relay-232 (every file cited, no defects): pwa/src/lib/logTotalsCoachPrompt.ts (new, 103 lines): pure helper; empty-state guard correct; hasCalorieTarget gate prevents '750 of 0 kcal'; 11 unit tests pass. pwa/src/lib/logTotalsCoachPrompt.test.ts (new, 138 lines): covers all 4 framing states + macros line + comparison line + plain-text invariant. pwa/src/lib/logTypeTotalsViewModel.ts:52-57,207: added calorieTarget field; no behavioural change to existing fields. pwa/src/components/LogTypeTodayTotalsStrip.tsx:13-19,28,112-126,167-176,341-358: onAskCoach prop + useMemo-wrapped viewModel + handleAskCoach + button JSX; button disabled when !serverOnline, hidden when onAskCoach undefined; preserves existing Card-as-button disclosure. pwa/src/components/LogTypeTodayTotalsStrip.test.tsx:56-64,1119-1254: 7 new tests cover button render/hide/disabled/click/empty/no-autosend/double-click. pwa/src/App.css:3879-3919: coach-row + coach-button + 4 states (default/hover/focus-visible/disabled) using existing --accent, --accent-dim, --focus-ring tokens; no new tokens. pwa/src/components/LogTypeTabPanel.tsx:43-49,81,135: optional onAskCoach prop forwarded. pwa/src/lib/logTabPanelsProps.ts:79-83: type extension only. pwa/src/lib/logTabPanelPropPickers.ts:58: picker pass-through. pwa/src/lib/logTabPanelsPropsBuilder.typeTab.ts:9-13,21-22,30: forwarded through builder. pwa/src/lib/logTabPanelsPropsBuilder.ts:46-50,68,78: type + builder updated. pwa/src/hooks/useLogTabPanelsProps.ts:33: dep added. pwa/src/hooks/useLogSection.ts:23-27,41,114: option forwarded. pwa/src/sections/Log.tsx:25-30,46,75: option forwarded to useLogSection. pwa/src/components/AppTabContent.tsx:96-99: wires onAskCoach to navigateAgentPrompt. pwa/src/sections/Agent.tsx:6,19-30: focusAgentComposer() added to existing useEffect; covers all handoff sources. | round-86 /code-review | closed | — | closed |
| rf-r86-000c | low | Triage of rf-r86-000: zero-finding sentinel (bugbot skill absent locally; window-lens review clean). AC satisfied across all clauses. No deferred items from this finding. | round-86 bugbot | closed | — | closed |
| rf-r86-fresh-001c | low | Triage of rf-r86-fresh-001: fixed in same tick. handleAskCoach identity churn resolved by wrapping buildLogTypeTotalsViewModel in useMemo (LogTypeTodayTotalsStrip.tsx:112-122). handleAskCoach identity now stable unless one of (data, calorieTarget, pendingCount, yesterdayKcal, yesterdayProtein) changes. Verified 73/73 tests still pass after the fix. | round-86 /code-review | closed | — | closed |
| rf-r86-fresh-002c | low | Triage of rf-r86-fresh-002: matches established AppTabContent pattern (other inline nav arrows like onMealPlanOpened already use this style). Valid perf observation but deferred — see rf-r86-fresh-002b → relay-240. Original row rf-r86-fresh-002 has no action field (write-once state_api) so its 'open' status cannot be edited; this row is the audit trail. Closed by triage with backlog follow-up created. | round-86 /code-review | closed | relay-240 | closed |
| rf-r86-fresh-002b | low | Triage follow-up: rf-r86-fresh-002 (AppTabContent inline arrow identity churn). Valid perf observation but no correctness issue and matches existing pattern across AppTabContent. Deferred to backlog relay-240 (useCallback wrap of AppTabContent's inline nav-callback arrows). Status: backlog. | round-86 /code-review | backlog | relay-240 | open |
| rf-r86-fresh-002 | low | Fresh-eye: AppTabContent wraps navigateAgentPrompt in an inline arrow (prompt) => navigateAgentPrompt(prompt) which creates a new identity every render. This propagates to useLogSection → useLogTabPanelsProps deps and triggers extra useMemo invalidations. Matches the established pattern in AppTabContent (other inline arrows like onMealPlanOpened={() => setOpenLogMealPlan(false)}) so not a regression — but flagged as a candidate for future useCallback wrapping of the AppTabContent props. No correctness issue; deferred to follow-up to keep this PR focused on the AC. | round-86 /code-review | backlog | relay-240 | open |
| rf-r86-fresh-001 | low | Fresh-eye: handleAskCoach was initially memoised with viewModel as a dep, but viewModel was a fresh object every render (no useMemo) — handleAskCoach identity churned every render. Fixed by wrapping buildLogTypeTotalsViewModel(...) in useMemo so viewModel is stable across renders unless one of its 5 inputs changes. Tests still 73/73 pass. Files: pwa/src/components/LogTypeTodayTotalsStrip.tsx:112-122, 173-177. | round-86 /code-review | closed | — | closed |
| rf-r86-000 | low | Bugbot subagent skipped — review-bugbot skill not present locally (matches rf-r78-000 / rf-r80-000 / rf-r83-000 / rf-r85-000 pattern). Window-lens review of relay-232: AC satisfied — pure helper buildLogTotalsCoachPrompt covers 4 framing states (empty / goal-reached / target-unset / tracking) and emits plain-text prompt with kcal/protein/macros/comparison summary; Ask Coach button is a real <button type=button> with aria-label, disabled when serverOffline, hidden when onAskCoach unwired; useMemo on viewmodel stabilises handleAskCoach identity; onAskCoach plumbed through 4 layers (AppTabContent → Log → useLogSection → useLogTabPanelsProps → buildLogTabPanelsProps → buildTypeTabProps → pickLogTypeTabPanelProps → LogTypeTabPanel → LogTypeTodayTotalsStrip) with optional type at every step; Agent.tsx adds focusAgentComposer() to the existing useEffect that watches agentPrompt.token (benefits all handoff sources: Day calendar + Log totals strip); no auto-send anywhere. 195 vitest pass + 1 pre-existing skip + lint 0 errors + build clean + journey 2 passed. Deferred (in commit body): macro-target denominators (no backend carbs_target_g/fat_target_g today; prompt omits macros line when null) and button placement nuance (right-aligned to not out-shout Card disclosure). | round-86 bugbot | closed | — | closed |
| rf-r85-004 | low | Bugbot Round 85 #4: Duplicate getFoodHistory call - LogTypeTodayTotalsStrip fetches history(2) while useLogSectionData already fetches history(14). Dedupe may save via dedupedGet window but a proper lift-state-up refactor is owed. Deferred to backlog relay-239. Files: pwa/src/components/LogTypeTodayTotalsStrip.tsx:60-90, pwa/src/components/LogTypeTodayTotalsStrip.test.helpers.ts (mockHistory, resetHistoryMock), pwa/src/App.css (comparison CSS rule), pwa/src/lib/logTypeTotals.test.ts, pwa/src/lib/logTypeTotalsViewModel.test.ts | round-85 bugbot | backlog | relay-239 | open |
| rf-r85-003 | low | Bugbot Round 85 #3: Half-unit negative deltas rounded to -0 by Math.round (JS asymmetry). Fixed with sign-symmetric rounding in buildDayOverDayComparison (Math.sign x Math.round(Math.abs)). Files: pwa/src/lib/logTypeTotals.ts:101-110, pwa/src/lib/logTypeTotals.test.ts:225-244 | round-85 bugbot | closed | — | closed |
| rf-r85-002 | medium | Bugbot Round 85 #2: Empty-state comparison visually hidden but still announced via announceText. Fixed by gating comparisonAnnouncePart on !hasNoMealsLogged. Test added: empty-state aria-live does NOT contain 'vs yesterday'. Files: pwa/src/lib/logTypeTotalsViewModel.ts:182-202, pwa/src/lib/logTypeTotalsViewModel.test.ts:265-345, pwa/src/components/LogTypeTodayTotalsStrip.test.tsx:957-972 | round-85 bugbot | closed | — | closed |
| rf-r85-001 | medium | Bugbot Round 85 #1: Older or future history rows mislabelled as yesterday - component picked first non-today row; fixed by filtering on exact yesterdayIso computed at fetch time. Tests added: older-only row unavailable; future-dated row unavailable. Files: pwa/src/components/LogTypeTodayTotalsStrip.tsx:60-90, pwa/src/components/LogTypeTodayTotalsStrip.test.tsx:925-955 | round-85 bugbot | closed | — | closed |
| rf-r85-000 | low | Bugbot Round 85: 4 findings (2 medium + 2 low). Medium #1 #2 fixed in worktree (exact-yesterday filter, announce gate). Medium/Low #3 fixed (sign-symmetric rounding). Low #4 deferred to relay-239 (dedupe history fetch). Final: 177 vitest pass, 1 pre-existing skip; lint 0 errors; build clean; journey 2 passed. Reviewed files: pwa/src/App.css (comparison CSS, log-type-totals-strip__comparison), pwa/src/components/LogTypeTodayTotalsStrip.test.helpers.ts (mockHistory + resetHistoryMock), pwa/src/components/LogTypeTodayTotalsStrip.test.tsx (8 new tests: unavailable, deltas, today-filter, same-as-yesterday, offline, empty-state suppression, error/401, footer order + 3 Bugbot-Round-85 cases), pwa/src/lib/logTypeTotals.test.ts (12 new tests: formatKcalDelta, formatProteinDelta, buildDayOverDayComparison including Bugbot #3 sign-symmetric rounding), pwa/src/lib/logTypeTotalsViewModel.test.ts (7 new tests: comparison wiring, announce path, goal-reached, empty-state). | round-85 bugbot | closed | — | closed |
| rf-r84-001 | low | Bugbot+window lens: relay-226 AC satisfied retroactively — work shipped at bf0d949 'feat(log-totals): relay-226 target-unset state' which already lives on main. classifyTotalsState returns 'target-unset' when calorieTarget is null/0 with meals logged; buildLogTypeTotalsViewModel emits setupHint='Set a daily calorie target in Settings to track progress.' and a footer '<consumed> kcal today' (no remaining claim). showKcalBar=false when !hasCalorieTarget and showProteinBar=false when protein_target_g null/0 — both bars suppressed, no misleading 0% track renders. Empty state keeps relay-225's 'No meals logged yet' (setupHint=null in that branch). 65/65 totals-strip+viewmodel vitest pass + 135/135 full pwa suite + lint 0 errors + build clean + journey 6 passed (1 manual pre-existing skip). Deferred (already in commit body): tappable link to Settings (out of AC; would couple to tab nav from presentational component). | round-84 bugbot | closed | — | closed |
| rf-r84-000 | low | — | — | — | — | open |
| rf-r83-fresh-001 | low | — | — | — | — | open |
| rf-r83-000 | low | — | — | — | — | open |
| rf-r82-000 | low | Bugbot+window lens: relay-226 AC satisfied — when calorieTarget is null/0 and meals are logged, the strip suppresses both kcal and protein progress bars (showKcalBar/showProteinBar gates) so no misleading 0% track renders; footer reads consumed kcal today (no remaining claim); setupHint surfaces Set a daily calorie target in Settings to track progress. below the footer with data-testid. Empty state keeps setupHint null. proteinTarget=null also hides protein bar. aria-live unchanged. TS build clean, lint 0 errors, 89/89 vitest pass including 6 new tests. Deferred: tappable link to Settings would couple to tab nav (out of AC). | round-82 bugbot | closed | relay-226 | closed |
| rf-r80-fresh-001 | low | Fresh-eye: progress-fill width 0% in expanded panel renders an empty bar track next to carbs/fat grams. This is honest (no macro target denominator exists) but visually reads as 0%. Acceptable per deferred-items note in commit body; future macro-target support will swap style.width to a real fraction. No defect. | round-80 /code-review | closed | — | closed |
| rf-r80-000 | low | Bugbot subagent skipped — review-bugbot skill not present locally (matches rf-r78-000 pattern). Window-lens review only: relay-222 AC satisfied — Show/Hide macros button with real button + aria-expanded + aria-controls; panel only renders when carbs and fat are non-null (explicit null guard); sits below protein row, above footer; 18/18 vitest pass on totals strip (5 new) + 56/56 full suite; build + lint clean; commit b54be8d; deferred: macro target denominators (no backend carbs_target_g/fat_target_g today — panel renders consumed grams only), aria-live non-update on toggle (intentional — user-driven disclosure) | round-80 bugbot | closed | — | closed |
| rf-r79-fresh-002 | low | Fresh-eye: 'does NOT show goal-reached when target is unset' test changed from screen.queryByText (which matched stale sr-only 'Goal reached' text across test containers) to container-scoped footer textContent assertion — strengthens the negative case and avoids the documented screen-bleed pitfall | round-79 /code-review | closed | — | closed |
| rf-r79-fresh-001 | low | Fresh-eye: getLiveRegion helper hoisted to module scope to avoid duplicate definition across describe blocks (the prior scope-inside-describe pattern would have caused ReferenceError in the new 'goal-reached state' describe) | round-79 /code-review | closed | — | closed |
| rf-r79-000 | low | Bugbot+window lens: relay-221 AC satisfied — goal-reached state activates when consumed >= calorieTarget (kcalProgressPct clamps at 100, so >=100 detects both equality and over-target); progress-fill--goal-reached uses --ok token, footer reads 'Goal reached', aria-live announces 'Goal reached' instead of remaining; 13/13 vitest pass on totals strip + 51/51 full suite; build clean; deferred items: protein-bar goal-reached variant (out of AC scope), line-width nit on the conditional className template (cosmetic) | round-79 bugbot | closed | — | closed |
| rf-r78-002 | low | AC clause 'totals+pending' is misleading: the strip computes from server-confirmed FoodTodayResponse.calories, not pending optimistic entries. Pending entries are surfaced as a separate queue (relay-223 will add a pending badge). No code defect — defer wording clarification to PO/UX | round-78 /code-review | backlog | relay-223 | open |
| rf-r78-001 | low | Test scoping fix: replace document.querySelector with per-render container ref to prevent stale-DOM bleed between tests; verified 31/31 pass on main after merge | round-78 /code-review | closed | — | closed |
| rf-r78-000 | low | Bugbot subagent launched (review-bugbot skill not present locally; delegated via Task leaf agent); agent stalled at USER_BLOCKED approval gate after gathering diff stats and confirming 31/31 test pass on df5109b..86684a9. Window-lens follow-up: no critical issues found in test diff | round-78 bugbot | closed | — | closed |
| rf-r77-000 | low | Bugbot+window lens: relay-218 AC satisfied — sticky totals strip with kcal/total-target and protein/target-g + dual progress bars; race-safe useEffect with cancelled flag; Card aria-label provided; lint/build clean; follow-ups (relay-219 tests, relay-220 aria-live, relay-221 goal-reached, relay-222 macros, relay-223 pending badge) already queued in BACKLOG | round-77 bugbot | closed | — | closed |
| rf-r76-000 | low | Independent review: no logic, security, regression, or AC issues in relay-216; focused tests and build pass | round-76 bugbot | closed | — | closed |
| rf-r75-000 | low | Recovery wake idle; relay-216 next tick | round-75 /code-review | closed | — | closed |
| rf-r74-003 | medium | tool_end not emitted when execute_tool throws | round-74 /code-review | fix-now | — | closed |
| rf-r74-001 | high | Shared status labels dropped when multiple tools share label | round-74 /code-review | fix-now | — | closed |
| rf-r74-000 | low | Bugbot+review: relay-215 tool status chips; wr-r74-001/003 fixed in follow-up commit | round-74 bugbot | closed | — | closed |
| rf-r73-000 | low | Recovery wake after relay-214 SPIN; relay-215 queued for next tick | round-73 /code-review | closed | — | closed |
| rf-r72-000 | low | relay-214: removed unused .card/.card-placeholder/.btn-decline; build+lint pass | round-72 /code-review | closed | — | closed |
| rf-r71-000 | low | Recovery idle wake; backlog empty after relay-213 verify — awaiting PO relay-214+ | round-71 /code-review | closed | — | closed |
| rf-r70-000 | low | relay-213 verify: AgentToolsSheet row tap calls sendPrompt(text) then onClose — AC satisfied in main (cfec619+) | round-70 /code-review | closed | — | closed |
| rf-r69-000 | low | Recovery wake STATE sync; relay-212 shipped in same turn primary SPIN | round-69 /code-review | closed | — | closed |
| rf-r68-000 | low | relay-212: navigateLogType drill-down matches relay-162 history pattern; HomeMacrosCard tappable with aria-label | round-68 /code-review | closed | — | closed |
| rf-r67-000 | low | relay-211: ul role=list + aria-label matches AC; explicit attrs satisfy WCAG 1.3.1 | round-67 /code-review | closed | — | closed |
| rf-r66-000 | low | Idle SPIN tick 2026-07-28T13:05:17Z; backlog empty — no product diff | round-66 /code-review | closed | — | closed |
| rf-r65-000 | low | Recovery wake idle tick 2026-07-28T13:05:22Z; STATE sync only — no product diff | round-65 /code-review | closed | — | closed |
| rf-r64-000 | low | Idle SPIN tick 2026-07-28T13:01:47Z; backlog empty — no product diff | round-64 /code-review | closed | — | closed |
| rf-r63-000 | low | Recovery wake idle tick 2026-07-28T13:02:06Z; STATE sync only — no product diff | round-63 /code-review | closed | — | closed |
| rf-r62-000 | low | Idle SPIN tick 2026-07-28T12:58:53Z; backlog empty — checkpoint sync only | round-62 /code-review | closed | — | closed |
| rf-r61-000 | low | Recovery arm wake 2026-07-28T12:58:35Z; idle checkpoint sync only | round-61 /code-review | closed | — | closed |
| rf-r60-000 | low | Idle SPIN tick 2026-07-28T12:56:07Z; backlog empty — checkpoint sync only | round-60 /code-review | closed | — | closed |
| rf-r59-000 | low | Recovery arm wake 2026-07-28T12:55:48Z; idle checkpoint sync only | round-59 /code-review | closed | — | closed |
| rf-r58-000 | low | Idle SPIN tick 2026-07-28T12:53:33Z; backlog empty — checkpoint sync only | round-58 /code-review | closed | — | closed |
| rf-r57-000 | low | Recovery arm wake 2026-07-28T12:53:28Z; idle checkpoint sync only | round-57 /code-review | closed | — | closed |
| rf-r56-000 | low | Idle SPIN tick 2026-07-28T12:50:49Z; backlog empty — checkpoint sync only | round-56 /code-review | closed | — | closed |
| rf-r55-000 | low | Idle recovery wake 2026-07-28T12:50:44Z; backlog empty — checkpoint sync only | round-55 /code-review | closed | — | closed |
| rf-r54-000 | low | relay-210: 10 vitest cases cover foodQueueFocus helpers and useFoodQueuePendingFocus token lifecycle/guard | round-54 /code-review | closed | relay-210 | closed |
| rf-r53-000 | low | Recovery arm wake 2026-07-28T12:44:45Z; relay-210 queued for next tick | round-53 /code-review | closed | — | closed |
| rf-r52-000 | low | relay-209: queued li exposes aria-label Pending:<food> via foodQueuePendingAriaLabel; AC satisfied | round-52 /code-review | closed | relay-209 | closed |
| rf-r51-000 | low | Recovery arm wake 2026-07-28T12:40:51Z; no diff — relay-209 queued for next tick | round-51 /code-review | closed | — | closed |
| rf-r50-000 | low | relay-208: :focus-visible uses --focus-ring tokens on .food-row--queued; AC satisfied | round-50 /code-review | closed | relay-208 | closed |
| rf-r49-000 | low | Idle SPIN tick 2026-07-28T12:34:04Z; checkpoint sync only — no product diff | round-49 /code-review | closed | — | closed |
| rf-r48-000 | low | Recovery wake idle tick 2026-07-28T12:33:58Z; no diff — checkpoint sync only | round-48 /code-review | closed | — | closed |
| rf-r47-000 | low | Idle SPIN tick 2026-07-28T12:30:21Z; STATE checkpoint only — no product diff | round-47 /code-review | closed | — | closed |
| rf-r46-000 | low | Idle recovery wake 2026-07-28T12:29:40Z; no diff — checkpoint sync only | round-46 /code-review | closed | — | closed |
| rf-r45-000 | low | Recovery wake idle tick 12:25:41Z; STATE sync only — no worker product diff | round-45 /code-review | closed | — | closed |
| rf-r44-000 | low | Idle SPIN tick 12:23:05Z; STATE checkpoint only — no product diff | round-44 /code-review | closed | — | closed |
| rf-r43-000 | low | Idle SPIN tick 12:20:12Z; STATE checkpoint only — no product diff | round-43 /code-review | closed | — | closed |
| rf-r42-000 | low | Idle SPIN tick 12:17:31Z; STATE checkpoint only — no product diff | round-42 /code-review | closed | — | closed |
| rf-r41-000 | low | Idle SPIN tick 12:14:46Z; STATE checkpoint only — no product diff | round-41 /code-review | closed | — | closed |
| rf-r40-000 | low | Idle SPIN tick 12:11:45Z; STATE checkpoint only — no product diff | round-40 /code-review | closed | — | closed |
| rf-r39-000 | low | Idle SPIN tick; STATE checkpoint sync only — no product code to review | round-39 /code-review | closed | — | closed |
| rf-r38-000 | low | Idle spin tick; STATE checkpoint sync only — no product code diff to review | round-38 /code-review | closed | — | closed |
| rf-r37-004 | low | Focused queue li lacks aria-label for screen readers | round-37 /code-review | backlog | relay-209 | closed |
| rf-r37-003 | low | No unit tests for foodQueueFocus helpers | round-37 /code-review | backlog | relay-210 | closed |
| rf-r37-002 | low | Queued row focus lacks :focus-visible styling | round-37 /code-review | backlog | relay-208 | closed |
| rf-r37-001 | medium | useFoodQueuePendingFocus re-ran on pending changes while token stayed truthy | round-37 /code-review | fix-now | — | closed |
| rf-r37-000 | low | Bugbot: no critical logic/security defects in relay-207 diff; AC wiring complete | round-37 bugbot | closed | relay-207 | closed |
| rf-r0-000 | low | No issues in relay-171–173 diff | round-0 /code-review | closed | — | closed |
| rf-r1-000 | low | No issues in relay-174 diff | round-1 /code-review | closed | — | closed |
| rf-r2-000 | low | No issues in relay-175 diff | round-2 /code-review | closed | — | closed |
| rf-r3-000 | low | relay-176 verify-only tick; STATE checkpoint sync; no new pwa/server feature diff | round-3 /code-review | closed | relay-176 | closed |
| rf-r3-001 | low | No issues in relay-177 diff | round-3 /code-review | closed | — | closed |
| rf-r4-000 | low | No issues in relay-178 diff | round-4 /code-review | closed | — | closed |
| rf-r5-000 | low | No issues in relay-179 diff | round-5 /code-review | closed | — | closed |
| rf-r6-000 | low | No issues in relay-180 diff | round-6 /code-review | closed | — | closed |
| rf-r7-000 | low | No issues in relay-181 diff | round-7 /code-review | closed | — | closed |
| rf-r8-000 | low | No issues in relay-183 diff | round-8 /code-review | closed | — | closed |
| rf-r9-001 | low | Duplicate event title in BottomSheet h2 and Card h3 | round-9 /code-review | fix-now | — | closed |
| rf-r9-002 | low | Unused `.day-event-detail` wrapper CSS after Card refactor | round-9 /code-review | fix-now | — | closed |
| rf-r10-001 | low | No issues in relay-184 composer shortcut diff | round-10 /code-review | closed | — | closed |
| rf-r11-001 | low | Duplicate `last_wake` row in CHECKPOINT from prior 9-arm edit | round-11 /code-review | fix-now | — | closed |
| rf-r12-001 | low | No issues in relay-185 Cards filter shortcut diff | round-12 /code-review | closed | — | closed |
| rf-r13-001 | low | No issues in relay-186 Settings shortcut diff | round-13 /code-review | closed | — | closed |
| rf-r14-001 | low | No issues in relay-187 app tab shortcut diff | round-14 /code-review | closed | — | closed |
| rf-r15-001 | low | No issues in relay-187 aria-keyshortcuts alignment diff | round-15 /code-review | closed | — | closed |
| rf-r16-001 | high | Duplicate hooks/homeDashboardDerived.ts used wrong ./api imports; lib/ copy is canonical | round-16 /code-review | fix-now | — | closed |
| rf-r16-002 | low | Extraction to useHomeDashboardRefresh + homeDashboardDerived preserves behavior | round-16 /code-review | closed | — | closed |
| rf-r17-001 | low | No issues in relay-188 OAuth auto-dismiss diff | round-17 /code-review | closed | — | closed |
| rf-r18-001 | low | No issues in STATE checkpoint sync diff (last_wake + phase 9-arm) | round-18 /code-review | closed | — | closed |
| rf-r19-001 | low | No issues in relay-189 ring share sheet diff | round-19 /code-review | closed | — | closed |
| rf-r20-001 | low | No issues in STATE checkpoint restore (confirmed_next + next_action) | round-20 /code-review | closed | — | closed |
| rf-r21-001 | low | No issues in relay-190 OAuth aria-live diff | round-21 /code-review | closed | — | closed |
| rf-r22-000 | low | No issues in relay-191 Agent tools sheet Escape hint diff | round-22 /code-review | closed | — | closed |
| rf-r23-001 | low | pwa/src/components/CardsCreateSheet.tsx: Escape hint matches AgentToolsSheet; BottomSheet handles keydown | round-23 /code-review | closed | — | closed |
| rf-r23-002 | low | pwa/src/App.css: cards-create-sheet-hint spacing mirrors agent-tools-sheet-hint | round-23 /code-review | closed | — | closed |
| rf-r24-000 | low | No logic, security, or regression bugs in relay-193 diff (2 files) | round-24 bugbot | closed | — | closed |
| rf-r24-001 | low | pwa/src/components/LogFoodEditSheet.tsx:42 adds Escape hint; close via BottomSheet keydown | round-24 bugbot | closed | relay-193 | closed |
| rf-r24-002 | low | pwa/src/App.css:2070-2074 log-food-edit-sheet-hint matches cards-create-sheet-hint | round-24 /code-review | closed | — | closed |
| rf-r25-000 | low | No logic, security, or regression bugs in relay-194 diff (2 files) | round-25 bugbot | closed | — | closed |
| rf-r25-001 | low | pwa/src/components/AgentAttachSheet.tsx:94 adds Escape hint; BottomSheet handles keydown | round-25 bugbot | closed | relay-194 | closed |
| rf-r25-002 | low | pwa/src/App.css:3772-3776 agent-attach-sheet-hint mirrors agent-tools-sheet-hint | round-25 /code-review | closed | — | closed |
| rf-r26-000 | low | No logic, security, or regression bugs in relay-195 diff (2 files) | round-26 bugbot | closed | — | closed |
| rf-r26-001 | low | pwa/src/components/AgentSectionOverlays.tsx:65 Escape hint; BottomSheet handles keydown | round-26 bugbot | closed | relay-195 | closed |
| rf-r26-002 | low | pwa/src/App.css:3778-3782 agent-camera-sheet-hint mirrors agent-attach-sheet-hint | round-26 /code-review | closed | — | closed |
| rf-r27-000 | low | No logic, security, or regression bugs in relay-196 diff (3 files) | round-27 bugbot | closed | — | closed |
| rf-r27-001 | low | pwa/src/components/VoiceCoachLayer.tsx:51 Escape hint; keydown at :16-17 | round-27 bugbot | closed | relay-196 | closed |
| rf-r27-002 | low | pwa/src/components/AgentSectionOverlays.tsx:78 fallback voice BottomSheet hint | round-27 /code-review | closed | — | closed |
| rf-r27-003 | low | pwa/src/App.css:3784-3788 agent-voice-sheet-hint mirrors agent-camera-sheet-hint | round-27 /code-review | closed | — | closed |
| rf-r28-000 | low | No logic, security, or regression bugs in relay-197 diff (2 files) | round-28 bugbot | closed | — | closed |
| rf-r28-001 | low | pwa/src/components/DayCalendarEventSheet.tsx:66 Escape hint; close via BottomSheet keydown | round-28 bugbot | closed | relay-197 | closed |
| rf-r28-002 | low | pwa/src/App.css:4268-4272 day-event-detail-sheet-hint mirrors agent-voice-sheet-hint | round-28 /code-review | closed | — | closed |
| rf-r29-000 | low | No logic, security, or regression bugs in relay-198 diff (2 files) | round-29 bugbot | closed | — | closed |
| rf-r29-001 | low | pwa/src/components/MealPhotoGallery.tsx:98 Escape hint matches sheet parity | round-29 /code-review | closed | relay-198 | closed |
| rf-r29-002 | low | pwa/src/App.css:2439 hint margin stacks with inner flex gap; fixed margin:0 | round-29 /code-review | fix-now | — | closed |
| rf-r29-003 | low | pwa/src/components/MealPhotoGallery.tsx:24-27 Escape handler unchanged and adequate | round-29 /code-review | closed | — | closed |
| rf-r30-000 | low | No logic, security, or regression bugs in relay-199 + LiveKit route fix diff | round-30 bugbot | closed | — | closed |
| rf-r30-001 | medium | Duplicate prompt catalogs in agentSectionShared | round-30 /code-review | fix-now | — | closed |
| rf-r30-002 | low | Redundant empty-state greeting grid + composer chips | round-30 /code-review | backlog | relay-200 | closed |
| rf-r30-003 | low | Conflicting .agent-tool-chips CSS cascade | round-30 /code-review | backlog | relay-201 | closed |
| rf-r30-004 | low | Composer chips visible after prefill | round-30 /code-review | fix-now | — | closed |
| rf-r30-005 | low | No tests for empty-state chip visibility | round-30 /code-review | backlog | — | closed |
| rf-r30-006 | low | Chip toolbar aria-label mislabeled Quick tools | round-30 /code-review | fix-now | — | closed |
| rf-r30-007 | low | Server routes static review clean | round-30 /code-review | closed | — | closed |
| rf-r31-000 | low | relay-200 AC satisfied: greeting grid sole empty-state surface | round-31 bugbot | closed | relay-200 | closed |
| rf-r31-001 | low | Greeting cards not disabled when offline/scanning | round-31 /code-review | backlog | relay-202 | closed |
| rf-r31-002 | low | Greeting visible when attach preview open | round-31 /code-review | backlog | relay-203 | closed |
| rf-r31-003 | low | Dead .agent-tool-chips CSS after component removal | round-31 /code-review | backlog | relay-201 | closed |
| rf-r31-004 | low | No tests for showGreeting vs composerDraft | round-31 /code-review | backlog | — | closed |
| rf-r33-000 | low | relay-203 AC satisfied: showGreeting excludes attachImage via prop chain | round-33 /code-review | closed | relay-203 | closed |
| rf-r33-001 | low | relay-204 AC satisfied: showDisclaimer excludes attachImage like showGreeting | round-33 /code-review | closed | relay-204 | closed |
| rf-r35-000 | low | relay-205 AC satisfied: attach sheet dismiss/pick refocuses composer; camera path skips focus | round-35 /code-review | closed | relay-205 | closed |
| rf-r36-000 | low | Bugbot: no critical issues in relay-206 attach-preview layout diff | round-36 bugbot | closed | relay-206 | closed |
| rf-r36-001 | low | Typing with attachImage unmounted greeting; layout shrank when captioning | round-36 /code-review | fix-now | — | closed |
| rf-r36-002 | low | No automated tests for attach-preview greeting stability | round-36 /code-review | backlog | — | closed |
| rf-r36-003 | low | Duplicate .agent-chat min-height in agent-gemini.css and App.css | round-36 /code-review | backlog | — | closed |

---
## HISTORY
























 (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
| — | — | 8-close | — | — |
| 2026-08-03T20:55:00Z | relay-232 | done | build | f160b89 |
| — | — | 8-close | — | — |
| — | — | 8-close | — | — |
| 2026-08-03T09:33:32Z | relay-225 | done | code-already-shipped via ch-patchwork-log-totals b2c4ee6 (classifyTotalsState empty branch + viewmodel footerText + hasMacros gating + showKcalBar/showProteinBar suppression) | b2c4ee6 + vitest 6/6 relay-225 describe + 130/130 full pwa suite + npm run lint 0 errors + npm run build clean |
| — | — | 8-close | — | — |
| — | — | 8-close | — | — |
| — | relay-230 | po-merge | Merged duplicate pending-count story into refined relay-223; FoodTodayResponse has no pending field, so AC now uses existing local optimistic/queued entries and preserves confirmed totals. | pwa/src/lib/apiTypes.ts:23-31 |
| — | relay-224 | po-drop | PO dropped obsolete cleanup AC: df5109b is tracked and already an ancestor of main HEAD; no untracked relay-218 stubs remain to merge. | 33fadd2 |
| 2026-08-02T07:33:00Z | relay-222 | done | build | b54be8d |
| — | — | 8-close | — | — |
| — | — | 8-close | — | — |
| — | — | 8-close | — | — |
| 2026-08-02T00:19:00Z | relay-219 | 8-close | done | build |
| — | — | 8-close | — | — |
| — | — | 8-close | — | — |
| 2026-07-28 | relay-215 | done | build | 612e3cd |
| — | relay-214 | done | build | 57b8c2d |
| — | relay-213 | done | verify | cfec619 |
| — | relay-212 | done | build | 17f37c1 |
| — | relay-211 | done | build | 5c2c524 |
| 2026-07-28 | relay-210 | done | build | d96e0f3 |
| 2026-07-28 | relay-209 | done | build | a62bd3c |
| 2026-07-28 | relay-208 | done | build | 17c55ab |
| — | relay-207 | done | build | 487aed2 |
|-----------|------|---------|----------|--------|
| 2026-07-28 | relay-206 | done | build | 2f7ef97 |
| 2026-07-28 | relay-205 | done | build | e2796ab |
| 2026-07-28 | relay-204 | done | build | a55de19 |
| 2026-07-28 | relay-203 | done | build | 552a0e0 |
| 2026-07-28 | relay-202 | done | build | 4fc6ec6 |
| 2026-07-28 | relay-200 | done | build | ee37839 |
| 2026-07-28 | relay-199 | done | build | 5aefaef |
| 2026-07-28 | agent-livekit-routes | done | import+build | — |
| 2026-07-28 | relay-198 | done | build | bbd648c |
| 2026-07-28 | relay-196 | done | build | f6b207a |
| 2026-07-28 | relay-195 | done | build | 4305775 |
| 2026-07-27 | relay-194 | done | build | e11be06 |
| 2026-07-27 | relay-193 | done | build | 788b258 |
| 2026-07-27 | relay-192 | done | build | 3e03d10 |
| 2026-07-27 | relay-191 | done | build | ad3d6a0 |
| 2026-07-27 | relay-190 | done | build | 57e63d9 |
| 2026-07-27 | relay-189 | done | build | 9fb62aa |
| 2026-07-27 | relay-188 | done | build | 9d012ca |
| 2026-07-27 | relay-187 | done | build | 4c3ad70 |
| 2026-07-27 | relay-186 | done | build | 41d31b5 |
| 2026-07-27 | relay-185 | done | build | 2303dab |
| 2026-07-27 | relay-184 | done | build | ac53858 |
| 2026-07-27 | relay-183 | done | build | 2055d88 |
| 2026-07-27 | relay-182 | done | build | f3af1b5 |
| 2026-07-27 | relay-181 | done | build | f8cbe92 |
| 2026-07-27 | relay-180 | done | build | f32d5a1 |
| 2026-07-27 | relay-179 | done | build | d9fcad8 |
| 2026-07-27 | relay-178 | done | build | 81a3034 |
| 2026-07-27 | relay-177 | done | build | c69908d |
| 2026-07-27 | relay-176 | done | build | e9b67a1 |
| 2026-07-27 | relay-175 | done | build | c3d1f04 |
| 2026-07-27 | relay-174 | done | build | e8edd4b |
| 2026-07-27 | relay-173 | done | build | 8b0e3d3 |
| 2026-07-27 | relay-172 | done | build | ceeeed2 |
| 2026-07-27 | relay-171 | done | build | 3d602a9 |
| 2026-07-27 | relay-150 | done | build | d3c3c18 |
| 2026-07-27 | relay-149 | done | build | 343d27d |
| 2026-07-27 | relay-169 | done | build | f441e32 |
| 2026-07-27 | relay-168 | done | build | 990a581 |
| 2026-07-27 | relay-167 | done | build | cfa947a |
| 2026-07-27 | relay-166 | done | build | ad69715 |
| 2026-07-27 | relay-165 | done | build | e9173b3 |
| 2026-07-27 | relay-164 | done | build | d6ed70d |
| 2026-07-27 | relay-163 | done | build | 8a0dd79 |
| 2026-07-27 | relay-161 | done | build | f4906ad |
| 2026-07-27 | relay-160 | done | lighthouse | — |
| 2026-07-27 | relay-153–158 | done | build | be39deb |
| 2026-07-27 | relay-159 | done | build | 111de02 |
| 2026-07-27 | relay-152 | done | build | 4dfc101 |

---

## Cycle rules

1. Every wake: 9-phase ritual per [RITUAL.md](RITUAL.md)
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. BACKLOG < 3: refill from BRAINSTORM + web research





















































































































