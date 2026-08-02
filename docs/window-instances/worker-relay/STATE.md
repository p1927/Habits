# STATE — worker-relay

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-08-02T12:16:00Z |
| where_we_are | relay-223 shipped (ada4813); next: relay-225 (empty-state fallback) — comes before 226/227 (no target / keyboard) and 228 (day-over-day) since the empty-state AC explicitly pairs with zero meals + visible strip |
| confirmed_next | relay-225 |
| brainstorm_notes | Empty-state fallback: when no meals logged today and strip is visible, show zeroed kcal/protein with 'No meals logged yet' message and keep readable without progress implication. Strip already covers target-unset + calorie-only case so empty-state needs to also render zeroed without progress bar |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | `2026-08-02T13:34:00Z` |
| next_action | `select-next-relay-225-or-226` |
| phase | `9-arm` |
| review_status | `skipped` |
| code_changed | `no` |
| review_round | `82` |
| last_reviewed_round | `81` |
| worktree_status | `none` |
| ritual_step | `9-arm` |
| brainstorm_done | `yes` |
| brainstorm_outcome | `relay-223: pass pending count from LogTypeTabPanel to totals strip footer; muted badge reads N meals pending sync; filter queued only; include in aria-live announcement` |
| execute_started | `yes` |
| fix_verify_done | `yes` |
| reflect_done | `yes` |
| commit_hash | `ada4813` |
| receive_review_done | `yes` |
| commit_done | `yes` |
| merge_done | `yes` |
| idle_mode_triggered | `no` |
| idle_rescue_done | `yes` |
| current_item_id | `relay-223` |
| finalize_status | `success` |
| review_skip_reason | `relay-223 review round-82 closed; close-out tick no product diff; state synced for next wake` |
| worktree_path | `—` |
| worktree_branch | `—` |
| worktree_item_id | `—` |

## IN_PROGRESS

*(empty)*

---

## BACKLOG


























 (priority ordered)






- [x] relay-215 | Agent composer tool status chips during streaming | feature | Given Agent loading with tool_results pending, When streaming, Then status chips above composer per crit-002
- [x] relay-216 | Home empty rings Log first meal CTA | feature | Given zero food logged today, When Home rings visible, Then primary CTA opens Log Scan per crit-001
- [x] relay-218 | Log today kcal + protein totals strip | feature | Given Log tab Type sub-tab visible; When Today's log card renders; Then sticky totals strip above list shows kcal/total-target and protein/target-g with progress fraction
- [x] relay-219 | Log today totals strip aggregation tests | refactor | Given FoodTodayResponse totals + pending optimistic entries; When totals strip computes kcal/protein; Then unit tests cover totals+pending, no data, and target-null cases
- [x] relay-220 | Log today totals strip aria-live | ux | Given totals strip above Log Today's list; When totals change (log saved, pending clears); Then aria-live=polite announces kcal + protein updates
- [x] relay-221 | Log today totals strip goal-reached state | feature | Given totals strip kcal progress bar; When consumed >= calorieTarget and target is set; Then bar fills to 100% with goal-reached variant (green fill, footer reads "Goal reached" instead of remaining)
- [x] relay-222 | Log today totals strip macro breakdown | feature | Given totals strip above today's list; When user taps the strip; Then expanded panel shows carbs/total-g and fat/total-g progress lines below protein (only renders if backend returns non-null macros)
- [x] relay-224 | Merge relay-218 to main + remove leftover main stubs | quality | Given worktree branch loop/worker-relay/relay-218 has committed df5109b and main has untracked stubs pwa/src/components/LogTypeTodayTotalsStrip.tsx + pwa/src/lib/logTypeTotals.ts from an abandoned approach, When merge attempted, Then resolve by either removing main stubs and fast-forwarding, or rebasing worktree onto main stubs; verify build after
- [ ] relay-226 | Log today totals strip target-unset state | feature | Given no calorie target is configured; When the totals strip renders; Then it shows consumed kcal and protein without a misleading progress percentage or remaining-calories claim, with a concise setup affordance
- [ ] relay-227 | Log today totals strip keyboard focus affordance | ux | Given a keyboard user focuses the interactive totals strip; When focus enters the strip; Then a visible focus ring and accessible name identify the totals summary and Enter/Space exposes its details
- [ ] relay-225 | Log today totals strip empty-state fallback | feature | Given no meals are logged today and the totals strip is visible; When the Log Type tab opens; Then the strip shows zeroed kcal/protein values, a clear ‘No meals logged yet’ message, and remains readable without implying progress
- [ ] relay-228 | Log today totals strip day-over-day comparison | feature | Given today totals are visible and yesterday totals are available; When the user opens the Log Type sub-tab; Then show yesterday-vs-today kcal and protein deltas with an explicit unavailable state when yesterday data is missing
- [x] relay-230 | Totals strip pending-sync count accuracy | feature | Given optimistic food entries are pending sync; When the totals strip renders; Then show the exact pending meal count and update it after sync or failure without hiding the underlying totals
- [ ] relay-232 | Log totals strip Ask Coach handoff | feature | Given the totals strip has today nutrition totals; When the user activates Ask Coach; Then Agent opens with a plain-text kcal protein and macro summary prefilled once, focus lands in the composer, and no message sends without confirmation
- [ ] relay-231 | Log today totals strip stale-data timestamp | feature | Given totals are loaded from a delayed or offline response; When the totals strip renders; Then show a concise last-updated indicator and preserve the existing totals instead of presenting stale data as current
- [ ] relay-233 | Log macro contribution drill-down | feature | Given the totals strip shows protein carbs and fat; When the user activates one macro; Then today food rows reveal the top contributing meals for that macro, expose a clear-filter action, and announce the filtered result count accessibly
- [ ] relay-234 | Log seven-day nutrition trend drill-down | feature | Given at least two days of nutrition history; When the user opens the totals trend; Then show seven-day kcal and protein trends, mark missing days, provide an accessible text summary, and allow return to Today
- [x] relay-223 | Log today totals strip pending sync badge | feature | Given optimistic food entries are pending or queued locally; When the Log Type totals strip renders; Then its footer shows the exact pending meal count beside confirmed totals and updates after success or failure
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




















































































