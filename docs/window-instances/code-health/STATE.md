# STATE — code-health

> **code-health window only.** Wake: INSTANCE → IDENTITY → this file → RITUAL.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-28T13:30:00Z |
| where_we_are | ch-142 useSwipeStack split shipped (184→107); queue useLogSection 138 |
| confirmed_next | ch-144 — useLogSection.ts split (138 lines) |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| confirmed_next | `ch-144` |
| phase | `9-arm` |
| current_item_id | `—` |
| last_wake | `2026-07-28T13:30:00Z` |
| code_changed | `no` |
| review_status | `complete` |
| review_round | `20` |
| last_reviewed_round | `20` |
| worktree_status | `none` |
| worktree_path | `—` |
| worktree_branch | `—` |
| worktree_item_id | `—` |
| review_changed_files | `docs/window-instances/code-health/STATE.md` |
| review_fingerprint | `2b91e7074ac58d73` |
| review_diff_range | `uncommitted` |
| review_skip_reason | `No diff in window scope (pwa/ server/ tools/cursor-loop/ docs/window-instances/code-health/) this tick` |
| ritual_step | `9-arm` |
| brainstorm_done | `no` |
| brainstorm_outcome | `—` |
| execute_started | `yes` |
| fix_verify_done | `yes` |
| reflect_done | `yes` |
| commit_hash | `0cbf0f8` |
| receive_review_done | `yes` |
| commit_done | `yes` |
| merge_done | `yes` |
| review_tick_applied_at | `2026-07-28T00:57:26+00:00` |

## IN_PROGRESS

*(empty)*

---

## REFACTOR_BACKLOG

- [x] ch-134 | Line scan — post api split targets | structure | api 39; top: AgentActionFeed 138, Settings 133 | done tick #134
- [x] ch-135 | `AgentActionFeed.tsx` (138) split | structure | hook + poll lib + types; main 138→28 | done tick #135
- [x] ch-136 | line scan — post ch-135 targets | structure | top: Settings 136, MealPlanQueuePanel 133, logTabPanelsPropsBuilder 132 | done tick #136
- [x] ch-137 | `Settings.tsx` (136) split | structure | chrome + cards + footer + effects; 136→55 | done tick #137
- [x] ch-138 | `MealPlanQueuePanel.tsx` (133) split | structure | hook + types; 133→68; phase9 notify arm | done tick #138
- [x] ch-139 | line scan — post ch-138 targets | structure | top: DayScheduleGrid 176, useSwipeStack 148, AgentChatComposer 136, logTabPanelsPropsBuilder 135 | done tick #139
- [x] ch-140 | `DayScheduleGrid.tsx` (176) split | structure | hook + all-day strip + grid body; 176→32 | done tick #140
- [x] ch-141 | line scan — post ch-140 targets | structure | top: useSwipeStack 184, useLogSection 138, AgentChatComposer 136, logTabPanelsPropsBuilder 135 | done tick #140
- [x] ch-142 | `useSwipeStack.ts` (184) split | structure | gesture lib + exit hook; 184→107; r20 offset-reset fix | done tick #142
- [x] ch-143 | line scan — post ch-142 targets | structure | top: useLogSection 138, SwipeStack 138, AgentChatComposer 136, logTabPanelsPropsBuilder 135 | done tick #142
- [ ] ch-144 | `useLogSection.ts` (138) split | structure | extract section data + tab wiring hook |

---

## BUG_BACKLOG

*(empty — scan as refactor uncovers bugs)*

---

## SCAN_COVERAGE

| Area | Last scanned | Findings |
|------|--------------|----------|
| meal plan sync banners (4 sections) | 2026-07-27 tick #1 | ch-001 done |
| `pwa/src/hooks/useMealPlanQueueRemoteSync` | 2026-07-27 tick #3 | ch-004 done |
| `pwa/src/hooks/useMealPlanQueueRemoteSync` | 2026-07-27 tick #14 | re-export from store (ch-017) |
| `pwa/src/sections/Agent.tsx` | 2026-07-27 tick #14 | 225→147 lines; AgentChatPanel/Composer |
| `pwa/src/lib/*` | 2026-07-27 tick #8 | ch-009 event bus; ch-010 queued |
| `pwa/src/sections/Log.tsx` | 2026-07-27 tick #12 | ch-015 verified: 869 lines, panels wired |
| `pwa/src/lib/voiceStatus.ts` | 2026-07-27 tick #12 | ch-016 rename |
| `pwa/src/sections/Home.tsx` | 2026-07-27 tick #23 | ch-041: useHomeDashboard + 2 panels; 435→434 |
| `pwa/src/hooks/useHomeDashboard.ts` | 2026-07-27 tick #23 | ch-041: refresh, exports, derived metrics |
| `pwa/src/sections/Home.tsx` | 2026-07-27 tick #11 | 648→413 lines |
| `pwa/src/sections/Day.tsx` | 2026-07-27 tick #26 | ch-044: 3 hooks; 277→159 |
| `server/habits_api/agent/context.py` | 2026-07-27 tick #26 | 26 lines — skip |
| `pwa/src/sections/Day.tsx` | 2026-07-27 tick #11 | 590→275 lines |
| `pwa/src/sections/*` (excl. Log tabs) | 2026-07-27 tick #10 | ch-013 partial |
| `pwa/src/components/*` | 2026-07-27 tick #1 | ch-018: dup FoodQueueAwareness removed |
| `server/habits_api/food/service.py` | 2026-07-27 tick #24 | ch-042: history_sheet + body_targets; 337→260 |
| `server/habits_api/db/` | 2026-07-27 tick #24 | ch-042: schema + token_db package; db.py→package |
| `server/habits_api/food/service.py` | 2026-07-27 tick #2 | ch-019: models + sheet_log; 469→328 lines |
| `server/habits_api/routes/settings.py` | 2026-07-27 tick #3 | deleted duplicate; ch-020 |
| `server/habits_api/habits/service.py` | 2026-07-27 tick #3 | ch-021: models + tracker_sheet; 222→154 |
| `server/habits_api/calendar/service.py` | 2026-07-27 tick #3 | already thin (36 lines) — skip |
| `server/habits_api/cards/service.py` | 2026-07-27 tick #4 | ch-022: models + sheet_loaders; 243→85 |
| `server/habits_api/future_self/service.py` | 2026-07-27 tick #5 | ch-023: image_client + habit_cards; 209→95 |
| `pwa/src/sections/Food.tsx` | 2026-07-27 tick #6 | ch-024: 4 panels + foodSectionShared; 300→188 |
| `pwa/src/sections/Settings.tsx` | 2026-07-27 tick #7 | ch-025: 5 panels + settingsSectionShared; 276→176 |
| `pwa/src/sections/FutureSelf.tsx` | 2026-07-27 tick #8 | ch-026: 4 panels + futureSelfSectionShared; 220→168 |
| `pwa/src/sections/Log.tsx` | 2026-07-27 tick #9 | ch-027: 7 panels wired + LogMealPlanTabShell; 869→860 |
| `server/habits_api/agent/service.py` | 2026-07-27 tick #10 | ch-028: tools + context; 190→75 |
| `server/habits_api/google/sheets.py` | 2026-07-27 tick #11 | ch-029: constants + auth + io; 202→32 re-export |
| `pwa/src/sections/Cards.tsx` | 2026-07-27 tick #12 | ch-030: 4 panels + cardsSectionShared; 185→117 |
| `pwa/src/sections/*` | 2026-07-27 tick #12 | all major sections decomposed |
| `server/habits_api/settings/service.py` | 2026-07-27 tick #15 | ch-033: constants + meal_plan_sheet; 182→87 |
| `server/habits_api/food/recipes.py` | 2026-07-27 tick #15 | ch-033: recipe_sheet + food.models; 129→45 |
| `server/habits_api/routes/food.py` | 2026-07-27 tick #16 | ch-034: service_invoke + schemas; 144→106 |
| `server/habits_api/routes/food_extensions.py` | 2026-07-27 tick #16 | ch-034: 125→99; targets logic → service |
| `server/habits_api/routes/habits.py` | 2026-07-27 tick #17 | ch-035: service_invoke; guards in service; 78→56 |
| `server/habits_api/routes/cards.py` | 2026-07-27 tick #17 | ch-035: 71→61 |
| `server/habits_api/routes/calendar.py` | 2026-07-27 tick #17 | ch-035: uses calendar.service; 56→47 |
| `server/habits_api/routes/agent.py` | 2026-07-27 tick #18 | ch-036: service_invoke; 32→31 |
| `server/habits_api/routes/future_self.py` | 2026-07-27 tick #18 | ch-036: 71→65 |
| `server/habits_api/routes/day.py` | 2026-07-27 tick #18 | ch-036: 43→38 |
| `server/habits_api/routes/api.py` | 2026-07-27 tick #19 | ch-037: oauth_service + service_invoke; 119→99 |
| `pwa/src/sections/Log.tsx` | 2026-07-27 tick #25 | ch-043: section data + meal plan shell + tab shortcuts; 527→427 |
| `pwa/src/sections/Log.tsx` | 2026-07-27 tick #22 | ch-040: useLogFoodUndo; 587→527 |
| `pwa/src/hooks/useLogFoodUndo.ts` | 2026-07-27 tick #22 | ch-040: offerUndo + restore ref |
| `pwa/src/sections/Log.tsx` | 2026-07-27 tick #21 | ch-039: useLogTypeTab; 686→587 |
| `pwa/src/hooks/useLogTypeTab.ts` | 2026-07-27 tick #21 | ch-039: barcode/OFF/manual/search |
| `pwa/src/sections/Log.tsx` | 2026-07-27 tick #20 | ch-038: useLogFoodScan + useLogRecipeScan; 860→686 |
| `pwa/src/hooks/useLogFoodScan.ts` | 2026-07-27 tick #20 | ch-038: scan capture/history/log |
| `pwa/src/hooks/useLogRecipeScan.ts` | 2026-07-27 tick #20 | ch-038: recipe scan queue + saved recipe |
| `pwa/src/sections/Log.tsx` | 2026-07-27 tick #19 | 860 lines — hook extract → ch-038 |
| `pwa/src/sections/Log.tsx` | 2026-07-27 tick #46 | ch-067: LogTabPanels; 396→367 |
| `pwa/src/sections/Home.tsx` | 2026-07-27 tick #47 | ch-068: HomeMealPlanBlock; 242→218 |
| `pwa/src/hooks/useLogRecipeScan.ts` | 2026-07-27 tick #47 | ch-068: fetch/capture/log flows in recipeScanFlow; 215→189 |
| `pwa/src/hooks/useMealPlanQueueSync.ts` | 2026-07-27 tick #48 | ch-069: actions hook + runner execute; 213→59 |
| `pwa/src/hooks/useLogTypeTab.ts` | 2026-07-27 tick #49 | ch-070: logTypeTabActions; 183→153 |
| `server/habits_api/cards/sheet_loaders.py` | 2026-07-27 tick #50 | ch-071: notes/strategy only; 146→76 |
| `server/habits_api/google/sheet_io.py` | 2026-07-27 tick #51 | ch-072: CRUD only; 140→88 |
| `pwa/src/sections/Log.tsx` | 2026-07-27 tick #52 | ch-073: useLogSection; 370→87 |
| `pwa/src/hooks/useLogSection.ts` | 2026-07-27 tick #53 | ch-074: panel/status props hooks; 314→165 |
| `pwa/src/components/LogTypeTabPanel.tsx` | 2026-07-27 tick #54 | ch-075: 4 sub-panels; 264→129 |
| `pwa/src/sections/Home.tsx` | 2026-07-27 tick #55 | ch-076: useHomeSection; 262→162 |
| `pwa/src/lib/mealPlanQueue.ts` | 2026-07-27 tick #62 | ch-083: types + storage + sync session; 253→38 |
| `pwa/src/components/CameraCapture.tsx` | 2026-07-27 tick #66 | ch-087: useCameraCapture + frame lib; 188→88 |
| `pwa/src/hooks/useLogSection.ts` | 2026-07-27 tick #68 | ch-089: useLogSectionFoodStack; 171→118 |
| `pwa/src/lib/recipeScanFlow.ts` | 2026-07-27 tick #67 | ch-088: api + capture + log; 178→17 |
| `pwa/src/sections/FutureSelf.tsx` | 2026-07-27 tick #71 | ch-092: useFutureSelfSection; 168→84 |
| `pwa/src/sections/Day.tsx` | 2026-07-27 tick #72 | ch-093: useDaySection; 168→156 |
| `pwa/src/lib/mealNotifications.ts` | 2026-07-27 tick #75 | ch-096: storage + permission + scheduler; 163→12 |
| `pwa/src/App.tsx` | 2026-07-27 tick #95 | ch-116: useAppShell + 4 shell components; 296→28 |
| `pwa/src/hooks/useMealPlanShell.ts` | 2026-07-28 tick #98 | ch-127: useMealPlanShellSyncContext; 155→128 |
| `pwa/src/components/DayTimelineCard.tsx` | 2026-07-28 tick #99 | ch-128: agenda + empty panels; 151→99 |
| `pwa/src/components/MealPlanQueuePanel.tsx` | 2026-07-28 tick #138 | ch-138: hook + types; 133→68 |
| `pwa/src/sections/Settings.tsx` | 2026-07-28 tick #137 | ch-137: chrome + cards + footer + effects; 136→55 |
| `pwa/src/components/*` + hooks + lib | 2026-07-28 tick #140 | ch-141 scan: useSwipeStack 184, useLogSection 138, AgentChatComposer 136, logTabPanelsPropsBuilder 135 |

---
| `pwa/src/hooks/useLogTabPanelsProps.ts` | 2026-07-27 tick #76 | ch-097: builder + swipe handler; 162→36 |
| `pwa/src/sections/*` + hooks + lib | 2026-07-27 tick #74 | ch-095 scan: api 302, App 296, mealNotifications 163, useLogTabPanelsProps 162, BarcodeScanner 159 |
| `pwa/src/sections/Home.tsx` | 2026-07-27 tick #73 | ch-094: dashboard panels + chrome; 163→57 |
| `pwa/src/components/MealPlanQueuePanel.tsx` | 2026-07-27 tick #70 | ch-091: banner + progress + copy; 171→133 |
| `pwa/src/sections/*` + hooks + lib | 2026-07-27 tick #69 | ch-090 scan: api 302, App 296, MealPlanQueuePanel 171, FutureSelf/Day 168, Home 163 |
| `pwa/src/sections/*` + hooks + lib | 2026-07-27 tick #65 | ch-086 scan: api 302, App 296, CameraCapture 188, recipeScanFlow 178, useLogSection 171 |
| `pwa/src/hooks/useOptimisticFoodLog.ts` | 2026-07-27 tick #64 | ch-085: pending state + submitters + retry; 190→140 |
| `pwa/src/lib/mealPlanQueueSyncRunner.ts` | 2026-07-27 tick #63 | ch-084: batch + single + execute; 194→13 |
| `pwa/src/sections/*` + hooks + lib | 2026-07-27 tick #61 | ch-082 scan: api 298, App 294, mealPlanQueue 253, syncRunner 194, useOptimisticFoodLog 190 |
| `pwa/src/hooks/useMealPlanQueueSyncActions.ts` | 2026-07-27 tick #60 | ch-081: action builders + options; 181→133 |
| `pwa/src/hooks/useLogRecipeScan.ts` | 2026-07-27 tick #59 | ch-080: state + tab photo + flow; 189→142 |
| `pwa/src/components/LogTabPanels.tsx` | 2026-07-27 tick #58 | ch-079: props lib + switch; 248→12 |
| `pwa/src/sections/*` + hooks | 2026-07-27 tick #57 | ch-078 scan: api 298, App 284, mealPlanQueue 253, LogTabPanels 248, syncRunner 194 |
| `pwa/src/components/MealPlanQueuePanel.tsx` | 2026-07-27 tick #56 | ch-077: list + focus hook; 259→171 |
| `pwa/src/sections/*` | 2026-07-27 tick #46 | scan: Log 367, Home 242, useLogRecipeScan 215, useMealPlanQueueSync 213 |

---

## COMMIT_PATCHWORK_LOG

| Commits | Symptom | Root cause | Refactor |
|---------|---------|------------|----------|
| relay-101–103 | Badge pulse + failed reset patched in hook | Hook duplicated listeners + prune in wrong layer | ch-003 |

---

## REVIEW_FINDINGS










| id | severity | finding | source | action | backlog_ref | status |
|----|----------|---------|--------|--------|-------------|--------|
| ch-r20-007 | low | resetExit unused if timer cleared mid-animation | round-20 /code-review | pushback | — | closed |
| ch-r20-006 | low | handleStart does not reset offset until first move | round-20 /code-review | pushback | — | closed |
| ch-r20-005 | low | Double RAF inner frame not cancelled on teardown | round-20 /code-review | pushback | — | closed |
| ch-r20-004 | medium | down swipe commits with no UI hint — pre-existing | round-20 /code-review | pushback | — | closed |
| ch-r20-003 | medium | SwipeStack.tsx:96+99 — touch+mouse duplicate handleEnd pre-existing | round-20 /code-review | pushback | — | closed |
| ch-r20-002 | medium | useSwipeStackExit.ts:30 — isExiting guard stale same turn; fixed committingRef | round-20 /code-review | fix-now | — | closed |
| ch-r20-001 | high | useSwipeStackExit.ts:58-61 — exit timer omitted resetOffset (split regression vs ada97df) | round-20 /code-review | fix-now | — | closed |
| ch-r20-000 | low | useSwipeStack.ts:107 — thin drag shell; gesture lib + exit hook | round-20 /code-review | closed | — | closed |
| ch-r20-b000 | low | Bugbot: split preserves gesture physics, exit RAF, reduced-motion path | round-20 bugbot | closed | — | closed |
| ch-r2-001 | low | `review_scope.py` — per-window paths include tools/cursor-loop for code-health; bundle dir appended | round-2 /code-review | closed | — | closed |
| ch-r2-002 | low | `prepare_review_tick.sh` + `detect_code_changed.sh` delegate to review_scope; Phase 5 prints review_paths | round-2 /code-review | closed | — | closed |
| ch-r2-003 | low | `audit_review.py` stale check fixed: round==last_reviewed with findings no longer false-fails on STATE-only diff | round-2 /code-review | closed | — | closed |
| ch-r2-004 | medium | ch-123 api.ts domain split reverted pending — monolithic api.ts retained; re-open split as ch-124 follow-up | round-2 /code-review | closed | ch-132 | closed |
| ch-r3-001 | low | `pwa/src/hooks/useHomeDashboard.ts:1` — refresh/state extracted to useHomeDashboardRefresh; derived metrics to homeDashboardDerived; composition hook stays thin | round-3 /code-review | closed | — | closed |
| ch-r3-002 | low | `tools/cursor-loop/scripts/ritual_phase.py:1` — review gate manifest + worktree close checks; no behavior change in pwa runtime | round-3 /code-review | closed | — | closed |
| ch-r4-001 | low | `pwa/src/hooks/homeDashboardDerived.ts:1` — duplicate misplaced during worktree cp; removed; canonical module stays at pwa/src/lib/homeDashboardDerived.ts | round-4 /code-review | closed | — | closed |
| ch-r5-001 | low | `docs/window-instances/code-health/STATE.md:1` — tick close checkpoint/backlog sync for ch-125 ship | round-5 /code-review | closed | — | closed |
| ch-r6-001 | low | `docs/window-instances/code-health/STATE.md:1` — worktree ch-126 prep merge cycle; next execute useAgentChat split | round-6 /code-review | closed | — | closed |
| ch-r7-001 | low | `pwa/src/hooks/useAgentChatStream.ts:1` — stream/abort + beginStream extracted; `useAgentChat.ts` composition 171→99 | round-7 /code-review | closed | — | closed |
| ch-r8-001 | low | `pwa/src/hooks/useMealPlanShellSyncContext.ts:1` — food snapshot + sync callbacks extracted; `useMealPlanShell.ts` composition 155→128 | round-8 /code-review | closed | — | closed |
| ch-r8-b001 | low | Meal plan hooks lack automated tests for getFoodBeforeSync + offline paths | round-8 bugbot | backlog | ch-129 | open |
| ch-r9-001 | low | `pwa/src/components/DayScheduleEmptyPanel.tsx:1` + `DayTimelineAgendaPanel.tsx` — extracted; `DayTimelineCard.tsx` shell 151→99 | round-9 /code-review | closed | — | closed |
| ch-r9-b001 | low | Bugbot: no functional regressions; event select + tab ARIA parity with pre-refactor | round-9 bugbot | closed | — | closed |
| ch-r10-b001 | low | Bugbot: no functional regressions vs main monolith — load dedup, 401 swallow, swipe/accept/decline/projection flows preserved | round-10 bugbot | closed | — | closed |
| ch-r10-001 | low | `pwa/src/hooks/useFutureSelfSection.ts:8-60` — composition hook wires load state into actions; return API identical to pre-split | round-10 /code-review | closed | — | closed |
| ch-r10-002 | low | `pwa/src/hooks/useFutureSelfSectionLoad.ts:56` — setCards exported but unused by composition; dead surface unless reserved for refresh | round-10 /code-review | backlog | ch-131 | open |
| ch-r10-003 | low | `pwa/src/hooks/useFutureSelfSectionActions.ts:61-77` — generateProjections logic preserved; dependency arrays improved vs monolith | round-10 /code-review | closed | — | closed |
| ch-r12-b001 | low | Bugbot: no functional regressions vs main monolith — all 36 api methods preserved; GET dedupe + ApiError paths intact | round-12 bugbot | closed | — | closed |
| ch-r12-001 | low | `pwa/src/lib/api.ts:30-39` — thin barrel composes 8 domain modules; 319→39 lines; type re-exports unchanged for consumers | round-12 /code-review | closed | — | closed |
| ch-r12-002 | low | `pwa/src/lib/apiClient.ts:13-34` — request/get extracted; public request export widens surface vs monolith private request | round-12 /code-review | backlog | ch-132 | open |
| ch-r12-003 | low | `pwa/src/lib/apiTypes.ts:1-118` — all interfaces centralized; manual export list in api.ts must stay in sync | round-12 /code-review | closed | — | closed |
| ch-r12-004 | low | `pwa/src/lib/apiSettings.ts:4-14` — health/settings/auth domain; 4 methods parity with monolith | round-12 /code-review | closed | — | closed |
| ch-r12-005 | low | `pwa/src/lib/apiFood.ts:10-88` — 15 food/meal-plan methods; FormData scan preserved | round-12 /code-review | closed | — | closed |
| ch-r12-006 | low | `pwa/src/lib/apiFutureSelf.ts:4-26` — 4 future-self methods parity | round-12 /code-review | closed | — | closed |
| ch-r12-007 | low | `pwa/src/lib/apiHabits.ts:8-17` — 4 habit methods parity | round-12 /code-review | closed | — | closed |
| ch-r12-008 | low | `pwa/src/lib/apiCalendar.ts:3-13` — calendar today + create event parity | round-12 /code-review | closed | — | closed |
| ch-r12-009 | low | `pwa/src/lib/apiDay.ts:3-13` — manage day get/update parity | round-12 /code-review | closed | — | closed |
| ch-r12-010 | low | `pwa/src/lib/apiCards.ts:5-20` — cards CRUD + sickness timeline; getCards type param unencoded (pre-existing) | round-12 /code-review | closed | — | closed |
| ch-r12-011 | low | `pwa/src/lib/apiAgent.ts:4-18` — agentChat + getVoiceToken parity with main | round-12 /code-review | closed | — | closed |
| ch-r12-012 | low | ch-r2-004 resolved — ch-132 re-implements reverted ch-123 api domain split | round-12 /code-review | closed | ch-r2-004 | closed |
| ch-r13-b001 | low | Bugbot: no bugs in diff — useCallback stabilizes onBeforeLogScroll; scrollToMealPlanQueue identity fixed | round-13 bugbot | closed | — | closed |
| ch-r13-001 | low | `pwa/src/hooks/useAppShellNavigation.ts:28-35` — onBeforeLogScroll memoized; behavior unchanged; fixes ch-r11-001 | round-13 /code-review | closed | ch-133 | closed |
| ch-r15-b001 | low | Bugbot: no functional regressions vs main — init gate, seed merge, poll interval, emitAgentDataRefresh preserved | round-15 bugbot | closed | — | closed |
| ch-r15-001 | low | `pwa/src/components/AgentActionFeed.tsx:1-8` — thin shell; public props unchanged | round-15 /code-review | closed | — | closed |
| ch-r15-002 | low | `pwa/src/hooks/useAgentActionFeed.ts:33-66` — poll/interval/pollToken/seedActions parity with monolith | round-15 /code-review | closed | — | closed |
| ch-r15-003 | low | `pwa/src/lib/agentActionFeedPoll.ts:32` — initialized gate equivalent to monolith wrapper | round-15 /code-review | closed | — | closed |
| ch-r15-004 | low | `pwa/src/lib/agentActionFeedPoll.ts:37-50` — food diff prevFoodFp guard parity | round-15 /code-review | closed | — | closed |
| ch-r15-005 | low | `pwa/src/lib/agentActionFeedPoll.ts:43` — single `at` per poll batch; ids still unique | round-15 /code-review | closed | — | closed |
| ch-r15-006 | low | `pwa/src/lib/agentToolFeed.ts:2` — AgentAction import from lib/types breaks lib→component coupling | round-15 /code-review | closed | — | closed |
| ch-r15-007 | low | `agentActionFeedPoll.ts` imports CalendarEvent from hooks — pre-existing lib→hooks pattern | round-15 /code-review | pushback | — | closed |
| ch-r15-008 | low | overlapping async poll() without in-flight guard — pre-existing | round-15 /code-review | pushback | — | closed |
| ch-r15-009 | low | pipe-delimited fingerprints break on (pipe) in food/summary — pre-existing | round-15 /code-review | pushback | — | closed |
| ch-r15-010 | low | update_habit uses kind food in toolFeed — pre-existing | round-15 /code-review | pushback | — | closed |
| ch-r15-011 | low | no unit tests for detectNewActionsFromPoll — deferred per ch-129 policy | round-15 /code-review | pushback | — | closed |
| ch-r16-000 | low | Docs-only tick: STATE.md sync for ch-135 closure + ch-136 scan; backlog/scan coverage/checkpoint aligned; no runtime code in diff | round-16 /code-review | closed | — | closed |
| ch-r17-b000 | low | Bugbot parity: OAuth/disconnect timers, banners, cards gate, error footer match main monolith | round-17 bugbot | closed | — | closed |
| ch-r17-000 | low | `Settings.tsx:8-54` — thin composition shell; chrome/cards/footer/effects split matches ch-137 | round-17 /code-review | closed | — | closed |
| ch-r17-001 | low | `settingsSectionTypes.ts:18-37` — hand-listed CardsProps vs Pick pattern used elsewhere | round-17 /code-review | backlog | — | open |
| ch-r17-002 | low | `useSettingsSection.ts` — no exported UseSettingsSectionResult for Pick-based props | round-17 /code-review | backlog | — | open |
| ch-r17-003 | low | `SettingsSectionChrome.tsx:8` — misleading Omit error (no error on type) | round-17 /code-review | fix-now | — | closed |
| ch-r17-004 | low | `useSettingsSectionEffects.ts:3-8` — inline args type acceptable for small hook | round-17 /code-review | closed | — | closed |
| ch-r17-005 | low | `Settings.tsx:32-51` — explicit prop pass vs spread; maintenance not runtime | round-17 /code-review | pushback | — | closed |
| ch-r17-006 | low | optional onDismissOauth with oauthSuccess banner — pre-existing from main | round-17 /code-review | pushback | — | closed |
| ch-r17-007 | low | AppTabContent inline onDismissOauth timer reset — pre-existing | round-17 /code-review | pushback | — | closed |
| ch-r18-b000 | low | Bugbot parity: MealPlanQueuePanel hook extraction preserves banner/focus/shortcuts | round-18 bugbot | closed | — | closed |
| ch-r18-000 | low | `MealPlanQueuePanel.tsx:8-67` — thin shell; useMealPlanQueuePanel owns derived state | round-18 /code-review | closed | — | closed |
| ch-r18-001 | medium | `useMealPlanQueuePanelFocus.ts:48-50` — focus skipped during sync then never retried — pre-existing | round-18 /code-review | pushback | — | closed |
| ch-r18-002 | medium | `MealPlanQueuePanel.tsx:34` — role=status wraps interactive banner — pre-existing a11y | round-18 /code-review | backlog | — | open |
| ch-r18-003 | low | useMealPlanQueuePanel untested — deferred per ch-129 | round-18 /code-review | pushback | — | closed |
| ch-r18-004 | low | mealPlanQueuePanelTypes props bundle — Pick split optional | round-18 /code-review | backlog | — | open |
| ch-r18-005 | low | partial destructure + props pass — acceptable | round-18 /code-review | closed | — | closed |
| ch-r18-006 | low | duplicate aria-live during sync — pre-existing | round-18 /code-review | pushback | — | closed |
| ch-r18-007 | high | `hook_guard_arm.py:102-104` — block_until_ms>0 bypassed notify enforcement | round-18 /code-review | fix-now | — | closed |
| ch-r18-008 | medium | write_wake_pending preToolUse only — document/mirror if needed | round-18 /code-review | backlog | — | open |
| ch-r18-009 | low | error text said arm-wake.sh — updated to phase9-notify-arm.sh | round-18 /code-review | fix-now | — | closed |
| ch-r18-010 | low | test_hook_guard_arm.sh lacks phase9 coverage | round-18 /code-review | backlog | — | open |
| ch-r18-011 | low | phase9-notify-arm.sh thin exec delegate — correct | round-18 /code-review | closed | — | closed |
| ch-r18-012 | low | prepare_arm_wake ARM_COMMAND → phase9-notify-arm.sh — aligned | round-18 /code-review | closed | — | closed |
| ch-r19-b000 | low | Bugbot parity: partition, scroll-to-now, IO visibility, all-day strip, event select preserved | round-19 bugbot | closed | — | closed |
| ch-r19-000 | low | `DayScheduleGrid.tsx:8-31` — thin shell; hook + subcomponents | round-19 /code-review | closed | — | closed |
| ch-r19-001 | low | `useDayScheduleGrid.ts:14-80` — scroll/now-line logic extracted | round-19 /code-review | closed | — | closed |
| ch-r19-002 | low | Jump-to-now ignores prefers-reduced-motion — pre-existing on manual jump | round-19 /code-review | backlog | — | open |
| ch-r19-003 | low | 13 props drilled to DayScheduleGridBody — Pick/spread optional | round-19 /code-review | backlog | — | open |
| ch-r19-004 | low | slots array recreated each render — minor perf | round-19 /code-review | backlog | — | open |
| ch-r19-005 | low | onJumpToNow lambda avoids passing click event as behavior | round-19 /code-review | closed | — | closed |
| ch-r19-006 | medium | nowTopPct effect re-scrolls on minute boundary — pre-existing | round-19 /code-review | pushback | — | closed |
| ch-r19-007 | low | now line updates on re-render only — pre-existing | round-19 /code-review | pushback | — | closed |
| ch-r19-008 | low | overlapping timed events full-width — pre-existing crit-058 | round-19 /code-review | pushback | — | closed |
| ch-r19-009 | low | useDayScheduleGrid untested — deferred per ch-129 | round-19 /code-review | pushback | — | closed |

---
## HISTORY


| Timestamp | Item | Outcome | Verified | Commit |
| 2026-07-28 | ch-142 | useSwipeStack split | build | pwa/src/hooks/useSwipeStack.ts |
|-----------|------|---------|----------|--------|
| 2026-07-28 | ch-140 | DayScheduleGrid split (hook + all-day + body); 176→32 | build | ada97df |
| 2026-07-28 | ch-141 | Post-ch-140 line scan; queue ch-142 useSwipeStack | scan | — |
| 2026-07-28 | ch-139 | Post-ch-138 line scan; queue ch-140 DayScheduleGrid | scan | — |
| 2026-07-28 | infra | Orphan ARM recovery — refresh + notify re-arm (pid=24146) | verify-wake | — |
| 2026-07-28 | ch-138 | MealPlanQueuePanel split + phase9 notify arm fix | build | a19a561 |
| 2026-07-28 | ch-137 | Settings split (chrome + cards + footer + effects); 136→55 | build | d3448c4 |
| 2026-07-28 | ch-136 | Post-ch-135 line scan; queue ch-137 Settings | scan | — |
| 2026-07-28 | ch-135 | AgentActionFeed split (hook + poll lib + types); 138→28 | build | f47ac8a |
| 2026-07-28 | ch-134 | Post-split line scan; queue ch-135 AgentActionFeed | scan | — |
| 2026-07-28 | ch-133 | useAppShellNavigation onBeforeLogScroll stabilize | build | 2fe55e3 |
| 2026-07-28 | ch-132 | api.ts domain split (client + types + 8 modules) | build | 4b7e546 |
| 2026-07-28 | ch-131 | useFutureSelfSection split (load + actions hooks) | build | 3e1a795 |
| 2026-07-28 | ch-128 | DayTimelineCard split (agenda + empty panels) | build | d664e48 |
| 2026-07-28 | ch-127 | useMealPlanShell split (syncContext hook) | build | 2795849 |
| 2026-07-27 | ch-126 | useAgentChat split (stream hook + composition) | build | 2fd9102 |
| 2026-07-27 | ch-125 | useHomeDashboard split (refresh hook + derived) | build | pending |
| 2026-07-27 | ch-124 | useMealPlanShell split (syncContext hook) | build | pending |
| 2026-07-27 | ch-122 | useMealPlanQueueSyncActions split (stableCallbacks + runners) | build | pending |
| 2026-07-27 | ch-121 | weekReportPdf split (types/docUtils/sections) | build | pending |
| 2026-07-27 | ch-120 | ringShareCardCanvas split (draw/render/export) | build | pending |
| 2026-07-27 | loop-setup | AGENT_WAKE.md + dynamic re-arm protocol | docs | pending |
| 2026-07-27 | ch-001 + ch-002 | MealPlanSyncAwarenessSlot + label in lib | build | pending |
| 2026-07-27 | ch-003 | mealPlanQueueCountStore singleton | build | pending |
| 2026-07-27 | loop tick #1 | /loop 2m confirmed; ch-018 dup removed | build | pending |
| 2026-07-27 | ch-019 | food/service split (models, sheet_log) | build+import | pending |
| 2026-07-27 | ch-020 + ch-021 | settings dup removed; habits split | build+import | pending |
| 2026-07-27 | ch-022 | cards/service split (models, sheet_loaders) | build+import | pending |
| 2026-07-27 | ch-023 | future_self split (image_client, habit_cards) | build+import | pending |
| 2026-07-27 | ch-024 | Food.tsx panel extract | build | pending |
| 2026-07-27 | ch-025 | Settings.tsx panel extract | build | pending |
| 2026-07-27 | ch-026 | FutureSelf.tsx panel extract | build | pending |
| 2026-07-27 | ch-027 | Log.tsx verify + mealplan shell | build | pending |
| 2026-07-27 | ch-028 | agent/service split (tools, context) | build+import | pending |
| 2026-07-27 | ch-029 | google/sheets split (constants, auth, io) | build+import | pending |
| 2026-07-27 | ch-030 | Cards.tsx panel extract | build | pending |
| 2026-07-27 | ch-031 | useMealPlanQueueCount DRY + meal types | build | pending |
| 2026-07-27 | ch-032 | day/manage_day_sheet parser extract | build+import | pending |
| 2026-07-27 | ch-033 | settings + recipes split | build+import | pending |
| 2026-07-27 | ch-034 | food routes DRY + get_food_targets | build+import | pending |
| 2026-07-27 | ch-035 | service_invoke habits/cards/calendar | build+import | pending |
| 2026-07-27 | ch-036 | service_invoke agent/future_self/day | build+import | pending |
| 2026-07-27 | ch-037 | api.py oauth_service wire + settings invoke | build+import | pending |
| 2026-07-27 | ch-038 | Log.tsx useLogFoodScan + useLogRecipeScan | build | pending |
| 2026-07-27 | ch-039 | Log.tsx useLogTypeTab | build | pending |
| 2026-07-27 | ch-040 | Log.tsx useLogFoodUndo + App.css orphan brace fix | build | pending |
| 2026-07-27 | ch-041 | Home.tsx useHomeDashboard + panels | build | pending |
| 2026-07-27 | ch-042 | food history/targets + db package split | build+import | pending |
| 2026-07-27 | ch-043 | Log.tsx section data + meal plan shell hooks | build | pending |
| `pwa/src/hooks/useMealPlanShell.ts` | 2026-07-27 tick #27 | ch-045: unified Home/Log/Day meal plan shell |
| `pwa/src/sections/Home.tsx` | 2026-07-27 tick #27 | ch-045: useMealPlanShell; 434→235 |
| 2026-07-27 | ch-044 | Day.tsx section data + meal plan + streak hooks | build | pending |
| `pwa/src/sections/Agent.tsx` | 2026-07-27 tick #28 | ch-046: useAgentChat + useAgentPhotoAttach; 190→156 |
| 2026-07-27 | ch-045 | useMealPlanShell DRY across Home/Log/Day | build | pending |
| `pwa/src/sections/*` | 2026-07-27 tick #29 | scan: Log 429, Home 242, Food 188→93, Agent 156, Day 160 |
| `pwa/src/hooks/*` | 2026-07-27 tick #29 | scan: useMealPlanQueueSync 313, useOptimisticFoodLog 287 |
| `server/habits_api/*` | 2026-07-27 tick #29 | scan: food/service 260, habits/service 171, sheet_log 131 |
| `pwa/src/sections/Food.tsx` | 2026-07-27 tick #29 | ch-048: useFoodSection; 188→93 |
| 2026-07-27 | ch-046 | Agent.tsx chat + photo attach hooks | build | pending |
| `pwa/src/hooks/useMealPlanQueueSync.ts` | 2026-07-27 tick #30 | ch-049: api + effects split; 313→278 |
| 2026-07-27 | ch-047 + ch-048 | line scan + Food.tsx useFoodSection | build | pending |
| `server/habits_api/habits/service.py` | 2026-07-27 tick #31 | ch-050: week_streak split; 171→103 |
| `server/habits_api/habits/week_streak.py` | 2026-07-27 tick #31 | ch-050: week summary + streaks |
| 2026-07-27 | ch-049 | useMealPlanQueueSync split | build | pending |
| `pwa/src/hooks/useOptimisticFoodLog.ts` | 2026-07-27 tick #32 | ch-051: lib + flush hook; 287→207 |
| 2026-07-27 | ch-050 | habits/week_streak split | build+import | pending |
| `pwa/src/sections/Log.tsx` | 2026-07-27 tick #33 | ch-052: LogStatusShell + undo restore hook; 429→401 |
| `pwa/src/components/LogStatusShell.tsx` | 2026-07-27 tick #33 | ch-052: edit sheets + banners + undo toasts |
| `pwa/src/hooks/useLogFoodUndoRestore.ts` | 2026-07-27 tick #33 | ch-052: undo restore wiring |
| 2026-07-27 | ch-051 | useOptimisticFoodLog split | build | pending |
| `pwa/src/sections/Settings.tsx` | 2026-07-27 tick #34 | ch-053: useSettingsSection; 177→105 |
| `pwa/src/hooks/useSettingsSection.ts` | 2026-07-27 tick #34 | ch-053: settings load/save/disconnect |
| 2026-07-27 | ch-052 | Log status/edit shell | build | pending |
| `pwa/src/hooks/useMealPlanQueueSync.ts` | 2026-07-27 tick #35 | ch-054: runner lib; 278→244 |
| `pwa/src/lib/mealPlanQueueSyncRunner.ts` | 2026-07-27 tick #35 | ch-054: batch + single sync |
| 2026-07-27 | ch-053 | useSettingsSection | build | pending |
| `server/habits_api/food/service.py` | 2026-07-27 tick #36 | ch-055: today_summary + log_operations; 260→34 |
| `server/habits_api/food/today_summary.py` | 2026-07-27 tick #36 | ch-055: get_today_summary + log_success_message |
| `server/habits_api/food/log_operations.py` | 2026-07-27 tick #36 | ch-055: log/update/delete/search |
| 2026-07-27 | ch-054 | mealPlanQueueSyncRunner | build | pending |
| `pwa/src/hooks/useOptimisticFoodLog.ts` | 2026-07-27 tick #37 | ch-056: executeOptimisticFoodLog; 207→157 |
| `pwa/src/lib/optimisticFoodLog.ts` | 2026-07-27 tick #37 | ch-056: shared offline/online log runner |
| `pwa/src/hooks/useLogRecipeScan.ts` | 2026-07-27 tick #37 | ch-056: logEntireSavedRecipe |
| 2026-07-27 | ch-055 | food/service split | import | pending |
| `pwa/src/sections/Log.tsx` | 2026-07-27 tick #38 | ch-057: hooks re-wired; 872→396 |
| 2026-07-27 | ch-056 | optimisticFoodLog DRY | build | pending |
| 2026-07-27 | ch-057 | Log.tsx hook re-wire | build | pending |
| `pwa/src/hooks/useLogRecipeScan.ts` | 2026-07-27 tick #39 | ch-059: recipeScanFlow + queue effects; 260→215 |
| `pwa/src/hooks/useMealPlanQueueSync.ts` | 2026-07-27 tick #39 | ch-058 scan: 244 — next target |
| 2026-07-27 | ch-059 | useLogRecipeScan split | build | pending |
| `pwa/src/hooks/useOptimisticHabitLog.ts` | 2026-07-27 tick #40 | ch-060: optimisticHabitLog + flush; 175→111 |
| 2026-07-27 | ch-060 | useOptimisticHabitLog DRY | build | pending |
| `pwa/src/hooks/useLogTypeTab.ts` | 2026-07-27 tick #41 | ch-061: barcode + search split; 216→183 |
| 2026-07-27 | ch-061 | useLogTypeTab trim | build | pending |
| `pwa/src/hooks/useMealPlanQueueSync.ts` | 2026-07-27 tick #42 | ch-062: sync state hook; 244→213 |
| 2026-07-27 | ch-062 | useMealPlanQueueSyncState | build | pending |
| `server/habits_api/food/log_operations.py` | 2026-07-27 tick #43 | ch-063: row_log_ops + food_db_search; 176→120 |
| 2026-07-27 | ch-063 | log_operations split | import | pending |
| `pwa/src/hooks/useHomeDashboard.ts` | 2026-07-27 tick #44 | ch-064: fetch + actions + shortcut; 215→134 |
| 2026-07-27 | ch-064 | useHomeDashboard trim | build | pending |
| `pwa/src/hooks/useMealPlanEntryLogging.ts` | 2026-07-27 tick #45 | ch-065: executeMealPlanEntryLog; 171→88 |
| 2026-07-27 | ch-065 | mealPlanEntryLog DRY | build | pending |
| `pwa/src/sections/Log.tsx` | 2026-07-27 tick #46 | ch-066 scan + ch-067 LogTabPanels; 396→367 |
| `pwa/src/components/LogTabPanels.tsx` | 2026-07-27 tick #46 | ch-067: tab panel switch component |
| 2026-07-27 | ch-066 + ch-067 | line scan + LogTabPanels extract | build | pending |
| `pwa/src/sections/Home.tsx` | 2026-07-27 tick #47 | ch-068: HomeMealPlanBlock; 242→218 |
| `pwa/src/hooks/useLogRecipeScan.ts` | 2026-07-27 tick #47 | ch-068: recipeScanFlow helpers; 215→189 |
| 2026-07-27 | ch-068 | Home meal plan block + recipe scan flow lib | build | pending |
| `pwa/src/hooks/useMealPlanQueueSync.ts` | 2026-07-27 tick #48 | ch-069: sync actions split; 213→59 |
| 2026-07-27 | ch-069 | useMealPlanQueueSyncActions + runner execute | build | pending |
| `pwa/src/hooks/useLogTypeTab.ts` | 2026-07-27 tick #49 | ch-070: logTypeTabActions; 183→153 |
| 2026-07-27 | loop-migrate | legacy shell loops stopped; cursor-loop armed | — | pending |
| 2026-07-27 | ch-070 | logTypeTabActions lib | build | pending |
| `server/habits_api/cards/sheet_loaders.py` | 2026-07-27 tick #50 | ch-071: sickness split; 146→76 |
| 2026-07-27 | ch-071 | sickness_sheet split | import | pending |
| `server/habits_api/google/sheet_io.py` | 2026-07-27 tick #51 | ch-072: sheet_key_value split; 140→88 |
| 2026-07-27 | ch-072 | sheet_key_value module | import | pending |
| `pwa/src/sections/Log.tsx` | 2026-07-27 tick #52 | ch-073: useLogSection; 370→87 |
| 2026-07-27 | ch-073 | useLogSection hook | build | pending |
| `pwa/src/hooks/useLogSection.ts` | 2026-07-27 tick #53 | ch-074: props hooks split; 314→165 |
| 2026-07-27 | ch-074 | useLogTabPanelsProps + useLogStatusShellProps | build | pending |
| `pwa/src/components/LogTypeTabPanel.tsx` | 2026-07-27 tick #54 | ch-075: OFF/voice/manual/today split; 264→129 |
| 2026-07-27 | ch-075 | line scan + LogTypeTabPanel split | build | pending |
| `pwa/src/sections/Home.tsx` | 2026-07-27 tick #55 | ch-076: useHomeSection; 262→162 |
| 2026-07-27 | ch-076 | useHomeSection hook | build | pending |
| `pwa/src/components/MealPlanQueuePanel.tsx` | 2026-07-27 tick #56 | ch-077: MealPlanQueueList + focus hook; 259→171 |
| 2026-07-27 | ch-077 | MealPlanQueuePanel split | build | pending |
| 2026-07-27 | ch-078 | line scan tick #57 | — | pending |
| `pwa/src/components/LogTabPanels.tsx` | 2026-07-27 tick #58 | ch-079: logTabPanelsProps + LogTabPanelSwitch; 248→12 |
| 2026-07-27 | ch-079 | LogTabPanels split | build | pending |
| `pwa/src/hooks/useLogRecipeScan.ts` | 2026-07-27 tick #59 | ch-080: useRecipeScanState + load/log flows; 189→142 |
| 2026-07-27 | ch-080 | useLogRecipeScan split | build | pending |
| `pwa/src/hooks/useMealPlanQueueSyncActions.ts` | 2026-07-27 tick #60 | ch-081: sync action builders; 181→133 |
| 2026-07-27 | ch-081 | useMealPlanQueueSyncActions split | build | pending |
| 2026-07-27 | ch-082 | line scan tick #61 | — | pending |
| `pwa/src/lib/mealPlanQueue.ts` | 2026-07-27 tick #62 | ch-083: types + storage + sync session; 253→38 |
| 2026-07-27 | ch-083 | mealPlanQueue split | build | pending |
| `pwa/src/lib/mealPlanQueueSyncRunner.ts` | 2026-07-27 tick #63 | ch-084: batch/single/execute split; 194→13 |
| 2026-07-27 | ch-084 | mealPlanQueueSyncRunner split | build | pending |
| 2026-07-27 | loop-rearm | primary cursor-loop was DOWN; re-armed tick #63 | — | pending |
| `pwa/src/hooks/useOptimisticFoodLog.ts` | 2026-07-27 tick #64 | ch-085: submitters + retry lib; 190→140 |
| 2026-07-27 | ch-085 | useOptimisticFoodLog split | build | pending |
| 2026-07-27 | ch-086 | line scan tick #65 | — | pending |
| `pwa/src/components/CameraCapture.tsx` | 2026-07-27 tick #66 | ch-087: useCameraCapture + frame lib; 188→88 |
| 2026-07-27 | ch-087 | CameraCapture split | build | pending |
| `pwa/src/lib/recipeScanFlow.ts` | 2026-07-27 tick #67 | ch-088: api + capture + log modules; 178→17 |
| 2026-07-27 | ch-088 | recipeScanFlow split | build | pending |
| `pwa/src/hooks/useLogSection.ts` | 2026-07-27 tick #68 | ch-089: food stack hook; 171→118 |
| 2026-07-27 | ch-089 | useLogSection split | build | pending |
| 2026-07-27 | ch-090 | line scan tick #69 | — | pending |
| `pwa/src/components/MealPlanQueuePanel.tsx` | 2026-07-27 tick #70 | ch-091: banner + progress + copy lib; 171→133 |
| 2026-07-27 | ch-091 | MealPlanQueuePanel trim | build | pending |
| `pwa/src/sections/FutureSelf.tsx` | 2026-07-27 tick #71 | ch-092: useFutureSelfSection; 168→84 |
| 2026-07-27 | ch-092 | FutureSelf split | build | pending |
| `pwa/src/sections/Day.tsx` | 2026-07-27 tick #72 | ch-093: useDaySection; 168→156 |
| 2026-07-27 | ch-093 | Day split | build | pending |
| `pwa/src/sections/Home.tsx` | 2026-07-27 tick #73 | ch-094: HomeDashboardPanels + chrome; 163→57 |
| 2026-07-27 | ch-094 | Home trim | build | pending |
| 2026-07-27 | ch-095 | line scan tick #74 | — | pending |
| `pwa/src/lib/mealNotifications.ts` | 2026-07-27 tick #75 | ch-096: storage + permission + scheduler; 163→12 |
| 2026-07-27 | ch-096 | mealNotifications split | build | pending |
| `pwa/src/hooks/useLogTabPanelsProps.ts` | 2026-07-27 tick #76 | ch-097: logTabPanelsPropsBuilder; 162→36 |
| 2026-07-27 | ch-097 | useLogTabPanelsProps split | build | pending |
| 2026-07-27 | ch-098 | line scan tick #77 | — | pending |
| `pwa/src/components/BarcodeScanner.tsx` | 2026-07-27 tick #78 | ch-099: useBarcodeScanner + barcodeScannerSupport; 159→78 |
| 2026-07-27 | ch-099 | BarcodeScanner split | build | pending |
| `pwa/src/sections/Agent.tsx` | 2026-07-27 tick #79 | ch-100: useAgentSection; 156→139 |
| 2026-07-27 | ch-100 | Agent split | build | pending |
| `pwa/src/components/HomeSavedRecipeCard.tsx` | 2026-07-27 tick #80 | ch-101: useHomeSavedRecipeCard; 155→87 |
| 2026-07-27 | ch-101 | HomeSavedRecipeCard split | build | pending |
| `pwa/src/hooks/useLogTypeTab.ts` | 2026-07-27 tick #81 | ch-102: form state + handlers + types; 153→15 |
| 2026-07-27 | ch-102 | useLogTypeTab split | build | pending |
| `pwa/src/components/ui/SwipeStack.tsx` | 2026-07-27 tick #82 | ch-103: useSwipeStack + types/constants; 152→110 |
| 2026-07-27 | ch-103 | SwipeStack split | build | pending |
| `pwa/src/lib/optimisticFoodLog.ts` | 2026-07-27 tick #83 | ch-104: types + queue + execute; 151→3 re-export |
| 2026-07-27 | ch-104 | optimisticFoodLog split | build | pending |
| `pwa/src/components/LogRecipesTabPanel.tsx` | 2026-07-27 tick #84 | ch-105: scan + saved cards + types; 151→47 |
| 2026-07-27 | ch-105 | LogRecipesTabPanel split | build | pending |
| `pwa/src/lib/daySectionShared.ts` | 2026-07-27 tick #85 | ch-106: constants + calendar + date + streak; 150→31 |
| 2026-07-27 | ch-106 | daySectionShared split | build | pending |
| `pwa/src/hooks/useFoodSection.ts` | 2026-07-27 tick #86 | ch-107: data + form + actions; 149→29 |
| 2026-07-27 | ch-107 | useFoodSection split | build | pending |
| `pwa/src/components/DayHabitHoursCard.tsx` | 2026-07-27 tick #87 | ch-108: legend + grid + failed sync; 148→42 |
| 2026-07-27 | ch-108 | DayHabitHoursCard split | build | pending |
| `pwa/src/hooks/useSettingsSection.ts` | 2026-07-27 tick #88 | ch-109: data + notifications; 146→38 |
| 2026-07-27 | ch-109 | useSettingsSection split | build | pending |
| `pwa/src/lib/ringShareCard.ts` | 2026-07-27 tick #89 | ch-110: theme + canvas + types; 144→11 |
| 2026-07-27 | ch-110 | ringShareCard split | build | pending |
| `pwa/src/lib/mealPlanQueueStorage.ts` | 2026-07-27 tick #90 | ch-111: io + queue + failed + cache; 143→19 |
| 2026-07-27 | ch-111 | mealPlanQueueStorage split | build | pending |
| `pwa/src/hooks/useLogRecipeScan.ts` | 2026-07-27 tick #91 | ch-112: actions + types; 142→53 |
| 2026-07-27 | ch-112 | useLogRecipeScan split | build | pending |
| `pwa/src/hooks/useOptimisticFoodLog.ts` | 2026-07-27 tick #92 | ch-113: actions + hook types; 140→51 |
| 2026-07-27 | ch-113 | useOptimisticFoodLog split | build | pending |
| 2026-07-27 | ch-116 | App shell split (useAppShell + tab chrome) | build | pending |
| `pwa/src/App.tsx` | 2026-07-27 tick #95 | ch-116: 296→28; appShellShared + appTabPreload |
| 2026-07-27 | ch-115 | Agent section split (header/body/overlays) | build | pending |
| `pwa/src/sections/Agent.tsx` | 2026-07-27 tick #94 | ch-115: 139→71; 3 panel components |
| 2026-07-27 | ch-117 | line scan tick #95 | — | pending |
| `pwa/src/sections/Day.tsx` | 2026-07-27 tick #96 | ch-118: meal + schedule + alerts stacks; 156→54 |
| 2026-07-27 | ch-118 | Day section split | build | pending |
| `pwa/src/hooks/useCameraCapture.ts` | 2026-07-27 tick #97 | ch-119: stream + actions; 137→26 |
| 2026-07-27 | ch-119 | useCameraCapture split | build | pass |









