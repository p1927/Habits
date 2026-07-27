# STATE — code-health

> **code-health window only.** Wake: INSTANCE → IDENTITY → this file → RITUAL.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T22:00:00Z |
| where_we_are | ch-126 useAgentChat split shipped |
| confirmed_next | ch-127 — line scan (api 307, useMealPlanShell 155, DayTimelineCard 151) |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | `2026-07-27T22:00:00Z` |
| confirmed_next | `ch-127` |
| phase | `9-arm` |
| code_changed | `no` |
| review_status | `skipped` |
| review_round | `7` |
| last_reviewed_round | `7` |
| loops | `wake ARMED PID 49727 (120s)` |
| worktree_status | `none` |
| current_item_id | `—` |
| worktree_path | `—` |
| worktree_branch | `—` |
| worktree_item_id | `—` |
| review_changed_files | `—` |
| review_fingerprint | `—` |
| review_diff_range | `none` |
| review_skip_reason | `v0.6.0 steady state — Phase 5 re-detects via prepare_review_tick.sh` |
| ritual_step | `1-wake` |
| brainstorm_done | `no` |
| brainstorm_outcome | `—` |
| execute_started | `no` |
| fix_verify_done | `no` |
| reflect_done | `yes` |
| commit_hash | `2fd9102` |
| receive_review_done | `yes` |
| commit_done | `yes` |
| merge_done | `yes` |

## IN_PROGRESS

*(empty)*

---

## REFACTOR_BACKLOG

- [x] ch-001 | DRY meal plan remote/pending banners → `MealPlanSyncAwarenessSlot` | dry, separation | done tick #1
- [x] ch-002 | Move `mealPlanSyncSourceLabel` hook → `lib/mealPlanQueue.ts` | separation | done tick #1
- [x] ch-003 | Singleton `mealPlanQueueCountStore` + failed-id cleanup in `writeQueue` | robustness, dry | done tick #2
- [x] ch-004 | `mealPlanQueueRemoteSyncStore` singleton (one MEAL_PLAN_SYNC_CHANGE listener) | dry | done tick #3
- [x] ch-005 | Line scan `server/habits_api/routes/*` — thin route enforcement | structure | done tick #4
- [x] ch-006 | Move `routes/settings.py` → `settings/service.py` | separation, structure | done tick #5
- [x] ch-007 | Extract OAuth from `routes/api.py` → `google/oauth_service.py` | separation | done tick #6
- [x] ch-008 | Unify `google_connected` guards in habits/calendar services | patchwork | done tick #7
- [x] ch-009 | `mealPlanQueueEventBus` — shared DOM/browser listeners for lib stores | dry | done tick #8
- [x] ch-010 | `localStorageQueue.ts` shared by food/habit/recipe queues | dry | done tick #9
- [x] ch-011 | Log.tsx slice: `logSectionShared`, `LogSubTabs`, `LogHistoryPanel` | structure | done tick #10
- [x] ch-012 | Extract Log tab panels → 7 components + `logSectionShared` | structure | done tick #9
- [x] ch-013 | DRY meal plan: `useMealPlanEntryLogging` + `MealPlanTodayCard` + Home panels | dry, structure | done tick #10
- [x] ch-014 | Day timeline/habit panels + Home sparkline/decision cards | structure | done tick #11
- [x] ch-015 | Log.tsx tab-panel decompose verified (1287→869 lines) | structure | done tick #12
- [x] ch-016 | Rename `voice-status.ts` → `voiceStatus.ts` | naming | done tick #12
- [x] ch-017 | Agent panels + hook DRY (`useMealPlanQueueRemoteSync` → store re-export) | structure | done tick #14
- [x] ch-018 | Components scan — removed duplicate `FoodQueueAwareness` (= `FoodQueueBanner`) | dry | done tick #1
- [x] ch-019 | `food/service.py` → `models.py` + `sheet_log.py` + thin orchestration (469→328) | structure | done tick #2
- [x] ch-020 | Remove duplicate `routes/settings.py`; wire api + meal_plan → `settings/service` | patchwork, dry | done tick #3
- [x] ch-021 | `habits/service.py` → `models.py` + `tracker_sheet.py` (222→154) | structure | done tick #3
- [x] ch-022 | `cards/service.py` → `models.py` + `sheet_loaders.py` (243→85) | structure | done tick #4
- [x] ch-023 | `future_self/service.py` → `image_client.py` + `habit_cards.py` (209→95) | structure | done tick #5
- [x] ch-024 | `Food.tsx` → 4 panel components + `foodSectionShared` (300→188) | structure | done tick #6
- [x] ch-025 | `Settings.tsx` → 5 panel components + `settingsSectionShared` (276→176) | structure | done tick #7
- [x] ch-026 | `FutureSelf.tsx` → 4 panel components + `futureSelfSectionShared` (220→168) | structure | done tick #8
- [x] ch-027 | Log.tsx panel wiring verified; mealplan → `LogMealPlanTabShell` (869→860) | structure | done tick #9
- [x] ch-028 | `agent/service.py` → `tools.py` + `context.py` (190→75) | structure | done tick #10
- [x] ch-029 | `google/sheets.py` → `sheet_constants` + `sheet_auth` + `sheet_io` (202→32 re-export) | structure | done tick #11
- [x] ch-030 | `Cards.tsx` → 4 panel components + `cardsSectionShared` (185→117) | structure | done tick #12
- [x] ch-031 | DRY `useMealPlanQueueCount` → store re-export; `FOOD_MEAL_TYPES` → `MEAL_TYPES` | dry | done tick #13
- [x] ch-032 | `day/service.py` → `manage_day_sheet.py` parser (72→52; already thin) | structure | done tick #14
- [x] ch-033 | `settings/service` → constants + meal_plan_sheet; `food/recipes` → recipe_sheet + models DRY (182→87, 129→45) | structure, dry | done tick #15
- [x] ch-034 | Food routes: `service_invoke` + `food_schemas`; `get_food_targets` → service (144+125→106+99) | structure, dry | done tick #16
- [x] ch-035 | `service_invoke` on habits/cards/calendar routes; disconnected guards → habits service (78→56, 71→61, 56→47) | dry, structure | done tick #17
- [x] ch-036 | `service_invoke` on agent/future_self/day routes (32→31, 71→65, 43→38) | dry | done tick #18
- [x] ch-037 | Wire `api.py` OAuth → `oauth_service`; settings routes → `service_invoke` (119→99) | patchwork, dry | done tick #19
- [x] ch-038 | Extract Log.tsx scan/recipe hooks → `useLogFoodScan` + `useLogRecipeScan` (860→686) | structure | done tick #20
- [x] ch-039 | Extract Log.tsx type-tab hook → `useLogTypeTab` (686→587) | structure | done tick #21
- [x] ch-040 | Extract Log.tsx food-log undo → `useLogFoodUndo` (587→527) | structure | done tick #22
- [x] ch-041 | Home.tsx → `useHomeDashboard` + Reports/MealPhotos panels (435→434) | structure | done tick #23
- [x] ch-042 | `food/service` → history_sheet + body_targets; `db` → schema + token_db package (337→260, 127→108+29) | structure | done tick #24
- [x] ch-043 | Log.tsx → `useLogSectionData` + `useLogMealPlanShell` + `useLogTabShortcuts` (527→427) | structure | done tick #25
- [x] ch-044 | Day.tsx → `useDaySectionData` + `useDayMealPlanShell` + `useDayStreakHaptics` (277→159); agent/context already thin | structure | done tick #26
- [x] ch-045 | DRY meal-plan shells → unified `useMealPlanShell`; deleted Log/Day wrappers; Home wired (434→235) | dry | done tick #27
- [x] ch-046 | Agent.tsx → `useAgentChat` + `useAgentPhotoAttach` (190→156) | structure | done tick #28
- [x] ch-047 | Section/server line scan — top targets: Log 429, useMealPlanQueueSync 313, useOptimisticFoodLog 287, food/service 260 | structure | done tick #29
- [x] ch-048 | Food.tsx → `useFoodSection` (188→93) | structure | done tick #29
- [x] ch-049 | Split `useMealPlanQueueSync` → `mealPlanQueueSyncApi` + `useMealPlanQueueSyncEffects` (313→278) | structure | done tick #30
- [x] ch-050 | `habits/service` → `week_streak.py` re-export (171→103+84) | structure | done tick #31
- [x] ch-051 | `useOptimisticFoodLog` → `optimisticFoodLog` lib + `useFoodLogQueueFlush` (287→207) | structure | done tick #32
- [x] ch-052 | Log.tsx → `LogStatusShell` + `useLogFoodUndoRestore` (429→401) | structure | done tick #33
- [x] ch-053 | Settings.tsx → `useSettingsSection` (177→105) | structure | done tick #34
- [x] ch-054 | `useMealPlanQueueSync` → `mealPlanQueueSyncRunner` lib (278→244) | structure | done tick #35
- [x] ch-055 | `food/service` → `today_summary` + `log_operations` re-export (260→34) | structure | done tick #36
- [x] ch-056 | `executeOptimisticFoodLog` DRY + `logEntireSavedRecipe` in recipe hook (207→157) | dry | done tick #37
- [x] ch-057 | Log.tsx re-wired to decomposed hooks + LogStatusShell (872→396) | structure | done tick #38
- [x] ch-058 | Line scan — top: Log 396, useLogRecipeScan 260, useMealPlanQueueSync 244, Home 242, useLogTypeTab 216 | structure | done tick #39
- [x] ch-059 | `useLogRecipeScan` → `recipeScanFlow` + `useRecipeScanQueueEffects` (260→215) | structure | done tick #39
- [x] ch-060 | `useOptimisticHabitLog` → `optimisticHabitLog` + `useHabitLogQueueFlush` (175→111) | dry | done tick #40
- [x] ch-061 | `useLogTypeTab` → `logBarcodeLookup` + `useDebouncedFoodSearch` (216→183) | structure | done tick #41
- [x] ch-062 | `useMealPlanQueueSync` → `useMealPlanQueueSyncState` (244→213) | structure | done tick #42
- [x] ch-063 | `log_operations` → `row_log_ops` + `food_db_search` re-export (176→120) | structure | done tick #43
- [x] ch-064 | `useHomeDashboard` → fetch + actions + refresh shortcut (215→134) | structure | done tick #44
- [x] ch-065 | `useMealPlanEntryLogging` → `executeMealPlanEntryLog` lib (171→88) | dry | done tick #45
- [x] ch-066 | Line scan — top: Log 396, Home 242, useLogRecipeScan 215, useMealPlanQueueSync 213, useLogTypeTab 183 | structure | done tick #46
- [x] ch-067 | Log.tsx → `LogTabPanels` tab switch extract (396→367 + 248 panel component) | structure | done tick #46
- [x] ch-068 | Home.tsx → `HomeMealPlanBlock`; `useLogRecipeScan` → `recipeScanFlow` helpers (242→218, 215→189) | structure | done tick #47
- [x] ch-069 | `useMealPlanQueueSync` → `useMealPlanQueueSyncActions` + runner execute helpers (213→59) | structure | done tick #48
- [x] ch-070 | `useLogTypeTab` → `logTypeTabActions` lib (183→153) | structure | done tick #49
- [x] ch-071 | Server scan + `cards/sickness_sheet.py` split from sheet_loaders (146→76+87) | structure | done tick #50
- [x] ch-072 | `google/sheet_io` → `sheet_key_value` for KV helpers (140→88+57) | structure | done tick #51
- [x] ch-073 | Log.tsx → `useLogSection` hook (370→87 + 314 hook) | structure | done tick #52
- [x] ch-074 | `useLogSection` → `useLogTabPanelsProps` + `useLogStatusShellProps` (314→165) | structure | done tick #53
- [x] ch-075 | Line scan + `LogTypeTabPanel` → 4 sub-panels (264→129) | structure | done tick #54
- [x] ch-076 | Home.tsx → `useHomeSection` hook (262→162) | structure | done tick #55
- [x] ch-077 | `MealPlanQueuePanel` → `MealPlanQueueList` + `useMealPlanQueuePanelFocus` (259→171) | structure | done tick #56
- [x] ch-078 | Line scan — top: api 298, App 284, mealPlanQueue 253, LogTabPanels 248, syncRunner 194 | structure | done tick #57
- [x] ch-079 | `LogTabPanels` → props lib + prop pickers + `LogTabPanelSwitch` (248→12) | structure | done tick #58
- [x] ch-080 | `useLogRecipeScan` → `useRecipeScanState` + tab photo + flow helpers (189→142) | structure | done tick #59
- [x] ch-081 | `useMealPlanQueueSyncActions` → options type + action builders lib (181→133) | structure | done tick #60
- [x] ch-082 | Line scan — top: api 298, App 294, mealPlanQueue 253, syncRunner 194, useOptimisticFoodLog 190 | structure | done tick #61
- [x] ch-083 | `mealPlanQueue.ts` → types + storage + sync session + events (253→38 re-export) | structure | done tick #62
- [x] ch-084 | `mealPlanQueueSyncRunner` → batch + single sync + execute + types (194→13) | structure | done tick #63
- [x] ch-085 | `useOptimisticFoodLog` → pending state + submitters + retry lib (190→140) | structure | done tick #64
- [x] ch-086 | Line scan — top: api 302, App 296, CameraCapture 188, recipeScanFlow 178, useLogSection 171 | structure | done tick #65
- [x] ch-087 | `CameraCapture` → `useCameraCapture` + `cameraCaptureFrame` (188→88) | structure | done tick #66
- [x] ch-088 | `recipeScanFlow` → api + capture + log + types (178→17 re-export) | structure | done tick #67
- [x] ch-089 | `useLogSection` → `useLogSectionFoodStack` (171→118) | structure | done tick #68
- [x] ch-090 | Line scan — top: api 302, App 296, MealPlanQueuePanel 171, FutureSelf/Day 168, Home 163 | structure | done tick #69
- [x] ch-091 | `MealPlanQueuePanel` → banner + progress + copy lib (171→133) | structure | done tick #70
- [x] ch-092 | `FutureSelf.tsx` → `useFutureSelfSection` (168→84) | structure | done tick #71
- [x] ch-093 | `Day.tsx` → `useDaySection` hook (168→156) | structure | done tick #72
- [x] ch-094 | `Home.tsx` → dashboard panels + section chrome + shell props (163→57) | structure | done tick #73
- [x] ch-095 | Line scan — top: api 302, App 296, mealNotifications 163, useLogTabPanelsProps 162, BarcodeScanner 159 | structure | done tick #74
- [x] ch-096 | `mealNotifications` → storage + permission + scheduler (163→12 re-export) | structure | done tick #75
- [x] ch-097 | `useLogTabPanelsProps` → builder lib + swipe handler (162→36) | structure | done tick #76
- [x] ch-098 | Line scan — top: api 302, App 296, BarcodeScanner 159, Day/Agent 156, HomeSavedRecipeCard 155 | structure | done tick #77
- [x] ch-099 | `BarcodeScanner.tsx` → `useBarcodeScanner` + support lib (159→78) | structure | done tick #78
- [x] ch-100 | `Agent.tsx` → `useAgentSection` (156→139) | structure | done tick #79
- [x] ch-101 | `HomeSavedRecipeCard.tsx` → `useHomeSavedRecipeCard` (155→87) | structure | done tick #80
- [x] ch-102 | `useLogTypeTab.ts` → form state + handlers + types (153→15) | structure | done tick #81
- [x] ch-103 | `SwipeStack.tsx` → `useSwipeStack` + types/constants (152→110) | structure | done tick #82
- [x] ch-104 | `optimisticFoodLog.ts` → types + queue + execute (151→3 re-export) | structure | done tick #83
- [x] ch-105 | `LogRecipesTabPanel.tsx` → scan + saved cards + types (151→47) | structure | done tick #84
- [x] ch-106 | `daySectionShared.ts` → constants + calendar + date + streak (150→31 re-export) | structure | done tick #85
- [x] ch-107 | `useFoodSection.ts` → data + form + actions (149→29) | structure | done tick #86
- [x] ch-108 | `DayHabitHoursCard.tsx` → legend + grid + failed sync (148→42) | structure | done tick #87
- [x] ch-109 | `useSettingsSection.ts` → data + notifications (146→38) | structure | done tick #88
- [x] ch-110 | `ringShareCard.ts` → theme + canvas + types (144→11) | structure | done tick #89
- [x] ch-111 | `mealPlanQueueStorage.ts` → io + queue + failed + cache (143→19 re-export) | structure | done tick #90
- [x] ch-112 | `useLogRecipeScan.ts` → actions + types (142→53) | structure | done tick #91
- [x] ch-113 | `useOptimisticFoodLog.ts` → actions + hook types (140→51) | structure | done tick #92
- [x] ch-114 | `HomeDashboardPanels.tsx` → metrics + feed stacks (140→14) | structure | done tick #93
- [x] ch-115 | `Agent.tsx` (139) split | structure | AgentSectionHeader + Body + Overlays; 139→71 |
- [x] ch-116 | `App.tsx` → `useAppShell` + tab/header/banners (296→28) | structure | done (prior tick)
- [x] ch-117 | Line scan — top: api 302, Day 156, ringShareCardCanvas 143, useCameraCapture 137, weekReportPdf 136 | structure | done tick #95
- [x] ch-118 | `Day.tsx` → header + meal + schedule + alerts stacks (156→54) | structure | done tick #96
- [x] ch-119 | `useCameraCapture.ts` → stream + actions modules (137→26) | structure | done tick #97
- [x] ch-120 | `ringShareCardCanvas.ts` (143) split | structure | drawRings + render + export; canvas 143→16 re-export |
- [x] ch-121 | `weekReportPdf.ts` (136) split | structure | types + docUtils + sections; main 136→20 |
- [x] ch-122 | `useMealPlanQueueSyncActions.ts` (181) split | structure | stableCallbacks + actionRunners; main 181→111 |
- [x] ch-123 | `api.ts` (307) split | structure | apiClient + apiTypes + 7 domain modules; main 307→38 |
- [x] ch-124 | `useMealPlanShell.ts` (155) split | structure | useMealPlanShellSyncContext; main 155→122 |
- [x] ch-125 | `useHomeDashboard.ts` (153) split | structure | refresh hook + homeDashboardDerived; main 153→87 |
- [x] ch-126 | `useAgentChat.ts` (171) split | structure | useAgentChatStream + composition; 171→99 |
- [ ] ch-127 | Line scan — top: api 307, useMealPlanShell 155, DayTimelineCard 151 | structure | queued |

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
| `pwa/src/hooks/useAgentChat.ts` | 2026-07-27 tick #97 | ch-126: useAgentChatStream + composition; 171→99 |
| `pwa/src/sections/*` + hooks + lib | 2026-07-27 tick #97 | scan: api 307, useMealPlanShell 155, DayTimelineCard 151 |

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
| ch-r2-001 | low | `review_scope.py` — per-window paths include tools/cursor-loop for code-health; bundle dir appended | round-2 /code-review | closed | — | closed |
| ch-r2-002 | low | `prepare_review_tick.sh` + `detect_code_changed.sh` delegate to review_scope; Phase 5 prints review_paths | round-2 /code-review | closed | — | closed |
| ch-r2-003 | low | `audit_review.py` stale check fixed: round==last_reviewed with findings no longer false-fails on STATE-only diff | round-2 /code-review | closed | — | closed |
| ch-r2-004 | medium | ch-123 api.ts domain split reverted pending — monolithic api.ts retained; re-open split as ch-124 follow-up | round-2 /code-review | backlog | ch-124 | open |
| ch-r3-001 | low | `pwa/src/hooks/useHomeDashboard.ts:1` — refresh/state extracted to useHomeDashboardRefresh; derived metrics to homeDashboardDerived; composition hook stays thin | round-3 /code-review | closed | — | closed |
| ch-r3-002 | low | `tools/cursor-loop/scripts/ritual_phase.py:1` — review gate manifest + worktree close checks; no behavior change in pwa runtime | round-3 /code-review | closed | — | closed |
| ch-r4-001 | low | `pwa/src/hooks/homeDashboardDerived.ts:1` — duplicate misplaced during worktree cp; removed; canonical module stays at pwa/src/lib/homeDashboardDerived.ts | round-4 /code-review | closed | — | closed |
| ch-r5-001 | low | `docs/window-instances/code-health/STATE.md:1` — tick close checkpoint/backlog sync for ch-125 ship | round-5 /code-review | closed | — | closed |
| ch-r6-001 | low | `docs/window-instances/code-health/STATE.md:1` — worktree ch-126 prep merge cycle; next execute useAgentChat split | round-6 /code-review | closed | — | closed |
| ch-r7-001 | low | `pwa/src/hooks/useAgentChatStream.ts:1` — stream/abort + beginStream extracted; `useAgentChat.ts` composition 171→99 | round-7 /code-review | closed | — | closed |
| ch-r7-001 | low | `pwa/src/hooks/useAgentChatStream.ts:1` — stream/abort + beginStream extracted; `useAgentChat.ts` composition 171→99 | round-7 /code-review | closed | — | closed |

---

## HISTORY

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
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
