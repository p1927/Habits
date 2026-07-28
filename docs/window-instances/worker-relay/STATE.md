# STATE — worker-relay

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-28T13:37:19Z |
| where_we_are | relay-215 shipped (612e3cd); relay-216 next |
| confirmed_next | relay-216 |
| brainstorm_notes | Tool status chips via SSE tool_start/tool_end |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | `2026-07-28T13:37:19Z` |
| next_action | `relay-216 next` |
| phase | `9-arm` |
| review_status | `skipped` |
| review_diff_range | `none` |
| code_changed | `no` |
| review_round | `74` |
| last_reviewed_round | `74` |
| worktree_status | `none` |
| review_fingerprint | `—` |
| ritual_step | `9-arm` |
| brainstorm_done | `no` |
| brainstorm_outcome | `—` |
| execute_started | `yes` |
| fix_verify_done | `yes` |
| reflect_done | `yes` |
| commit_hash | `612e3cd` |
| receive_review_done | `yes` |
| commit_done | `yes` |
| merge_done | `yes` |
| review_skip_reason | `Recovery nested wake; relay-216 deferred to next tick` |
| review_changed_files | `—` |

## IN_PROGRESS

*(empty)*

---

## BACKLOG





 (priority ordered)






- [x] relay-206 | Agent empty chat min-height stable when greeting toggles | polish | Avoid layout jump when greeting hides for attach preview
- [x] relay-207 | Food queue banner tap → focus pending queue row | polish | Given queued food logs and banner visible on Home/Log, When user taps banner body (not Dismiss), Then navigate to Log if needed and scroll/focus first pending offline queue entry
- [x] relay-208 | Queued food row :focus-visible ring | a11y | Given relay-207 tap focuses queue row, When row has keyboard focus, Then row shows :focus-visible ring matching design system focus style
- [x] relay-209 | Focused queue li aria-label | a11y | Given Log tab food queue list, When pending offline queue entry rendered, Then li has descriptive aria-label (e.g. "Pending: <food name>")
- [x] relay-210 | Food queue focus helpers unit tests | quality | Given useFoodQueuePendingFocus hook, When focus-token lifecycle and re-run guard paths run, Then unit tests cover all state transitions
- [x] relay-211 | Food queue ul role=list + aria-label | ux | Given food queue list on Log tab; When rendered; Then outer ul has role=list and aria-label Pending offline food entries per WCAG 1.3.1
- [x] relay-212 | Home macros card tap → Log Type sub-tab drill-down | feature | Given Home macros summary tile visible; When user taps tile; Then app navigates to Log tab Type sub-tab (crit-032)
- [x] relay-213 | Agent tools row tap auto-send to chat | feature | Given Agent Tools sheet open; When user taps a tool row; Then sheet closes and tool name message auto-sends to chat (crit-034)
- [x] relay-214 | Remove dead legacy .card/.card-placeholder/.btn-decline CSS | quality | Given App.css legacy selectors unused in pwa/src, When build runs, Then dead rules removed per maint-004
- [x] relay-215 | Agent composer tool status chips during streaming | feature | Given Agent loading with tool_results pending, When streaming, Then status chips above composer per crit-002
- [ ] relay-216 | Home empty rings Log first meal CTA | feature | Given zero food logged today, When Home rings visible, Then primary CTA opens Log Scan per crit-001
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



















































