# STATE — ux-critic

> **ux-critic window only.** Outbound critiques land in [`ux-relay/STATE.md`](../ux-relay/STATE.md) `CRITIQUE_BACKLOG`.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-28T11:34:00Z |
| where_we_are | Tick 14 complete — crit-014 Agent stop-generation handed off |
| confirmed_next | crit-015 journey-first-log re-audit (tick 15, journey mode) |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | `2026-07-28T12:22:00Z` |
| current_item_id | `crit-014` |
| phase | `9-arm` |
| review_status | `skipped` |
| review_skip_reason | `No diff in window scope (pwa/ server/ docs/window-instances/ux-critic/) this tick` |
| review_round | `0` |
| last_reviewed_round | `-1` |
| review_diff_range | `none` |
| code_changed | `no` |
| confirmed_next | `crit-015 journey-first-log re-audit (tick 15)` |
| tick_count | `14` |
| tick_mode | `element` |
| worktree_status | `none` |
| worktree_path | `—` |
| worktree_branch | `—` |
| worktree_item_id | `—` |
| review_changed_files | `—` |
| review_fingerprint | `—` |
| ritual_step | `9-arm` |
| brainstorm_done | `yes` |
| brainstorm_outcome | `crit-014 — loading replaces mic with Stop button calling abortRef; partial reply + stopped notice; rejected swipe-to-cancel` |
| execute_started | `yes` |
| fix_verify_done | `yes` |
| reflect_done | `yes` |
| commit_hash | `—` |
| receive_review_done | `no` |
| design_deliberation_done | `yes` |
| design_chosen_approach | `AgentChatComposer: when loading && !input, show agent-composer-stop square button; useAgentChat exposes stopStream() → abortRef.abort(); bubble shows "Response stopped" + Regenerate` |
| design_mitigations | `Distinct from crit-002 tool chips (pre-reply status); stop retains partial tokens; prefers-reduced-motion instant halt` |

## IN_PROGRESS

*(empty)*

---

## JOURNEY_BACKLOG

> Cross-tab user jobs. Journey ticks pick the row with oldest `last_audited`.

| id | flow | persona | hook_step | touchpoints | last_audited | next_crit_id |
|----|------|---------|-----------|-------------|--------------|--------------|
| journey-first-log | Open app → log first meal → Home rings update | first-week user | action | Home → Log → Home | 2026-07-28T10:05:00Z | crit-001 |
| journey-daily-checkin | Morning open → rings → Day schedule → Agent nudge | returning user | trigger | Home → Day → Agent | 2026-07-28T10:18:00Z | crit-006 |
| journey-scan-quick | Log scan → OCR confirm → undo within 5s | busy professional | action | Log → Log | 2026-07-28T10:32:00Z | crit-007 |
| journey-weekly-review | Home rings → Day history → Cards notes | power user | investment | Home → Day → Cards | 2026-07-28T10:45:00Z | crit-008 |
| journey-coach-trust | Agent empty → first reply → voice sheet | skeptical new user | variable_reward | Agent → Agent | 2026-07-28T11:00:00Z | crit-009 |
| journey-capture-thought | Cards quick capture → label → find later | knowledge worker | investment | Cards → Cards | 2026-07-28T11:08:00Z | crit-010 |
| journey-settings-trust | Settings → OAuth connect → disconnect feedback | privacy-conscious | investment | Settings → Settings | 2026-07-28T11:22:00Z | crit-011 |
| journey-day-plan | Day empty → add block → see on Home | planner | action | Day → Home | 2026-07-28T11:28:00Z | crit-012 |

---

## AUDIT_ROTATION

> Element ticks (even `tick_count`). One tab per even tick.

| order | tab | reference | last_audited | next_crit_id |
|-------|-----|-----------|--------------|--------------|
| 1 | Agent | Gemini | 2026-07-28T11:34:00Z | crit-014 |
| 2 | Day | Google Calendar | 2026-07-28T10:25:00Z | crit-003 |
| 3 | Cards | Google Keep | 2026-07-28T10:38:00Z | crit-004 |
| 4 | Log | Tinder | 2026-07-28T10:52:00Z | crit-005 |
| 5 | Home | Apple Health | 2026-07-28T11:15:00Z | crit-013 |

---

## CRITIQUE_BACKLOG (local tracker — mirror to ux-relay)

> Rows copied to `ux-relay/STATE.md` `CRITIQUE_BACKLOG` on write. Track handoff status here.

| id | status | journey_ref | persona | impact | touchpoints | ux_relay_status | notes |
|----|--------|-------------|---------|--------|-------------|-----------------|-------|
| crit-001 | handed-off | journey-first-log | first-week user | 4 | Home → Log (Scan) → Home | proposed | empty rings CTA + celebration |
| crit-002 | handed-off | element-only | returning user | 4 | Agent (composer dock) | proposed | streaming tool-status chips |
| crit-006 | handed-off | journey-daily-checkin | returning user | 4 | Home → Day → Agent | proposed | Home today agenda strip |
| crit-003 | handed-off | element-only | returning user | 4 | Day (schedule grid) | proposed | scroll-to-now + jump FAB |
| crit-007 | handed-off | journey-scan-quick | busy professional | 4 | Log (scan overlay) → Log (undo) | proposed | undo restores photo overlay |
| crit-004 | handed-off | element-only | knowledge worker | 4 | Cards (note grid) | proposed | tap opens note detail/edit |
| crit-008 | handed-off | journey-weekly-review | power user | 4 | Home → Day → Cards | proposed | weekly recap cross-tab closure |
| crit-005 | handed-off | element-only | returning user | 4 | Log (swipe card) | proposed | swipe fly-off commit animation |
| crit-009 | handed-off | journey-coach-trust | skeptical new user | 4 | Agent (greeting) → Agent (voice) | proposed | greeting auto-send + voice trust bridge |
| crit-010 | handed-off | journey-capture-thought | knowledge worker | 4 | Cards (capture) → Cards (search) | proposed | inline capture + search label chips |
| crit-013 | handed-off | element-only | returning user | 4 | Home (activity rings) | proposed | ring tap drill-down sheet |
| crit-011 | handed-off | journey-settings-trust | privacy-conscious | 4 | Settings (connect) → Settings (disconnect) | proposed | scope disclosure + disconnect confirm |
| crit-012 | handed-off | journey-day-plan | planner | 4 | Day (empty grid) → Home (next block) | proposed | tap-slot create + Home closure |
| crit-014 | handed-off | element-only | returning user | 4 | Agent (composer dock) | proposed | stop generation button |

**Local status:** `draft` → `handed-off` | **ux-relay status:** `proposed` → `agreed` → `shipped` | `rejected`

---

## CRITIQUE_LOG

> Mandatory brainstorm + research + debate + Evidence block per tick.

| tick_at | crit_id | mode | journey_ref | brainstorm_summary | web_citations | habits_files_read | evidence_block | rubric_avg | chosen_direction |
|---------|---------|------|-------------|-------------------|---------------|-------------------|----------------|------------|------------------|
| 2026-07-28T10:05:00Z | crit-001 | journey | journey-first-log | A: Home empty rings Revolut CTA→Log Scan; B: post-log ring celebration toast+aria-live; C: 3-step modal funnel (rejected: heavy). Chosen A+B. | 9to5mac.com/2026/01/11/apple-health-new-features — simplified daily logging + unified nutrition layout iOS 26.4 | pwa/src/components/HomeActivityRingsCard.tsx, pwa/src/hooks/useAppShellNavigation.ts, pwa/src/sections/Log.tsx | Habits files: pwa/src/components/HomeActivityRingsCard.tsx, pwa/src/hooks/useAppShellNavigation.ts. Quote: rings at 0, Share PNG only, no Log CTA. Gap: L43-51 no empty CTA. 390px: primary log action NOT visible on Home in 2s — N (2+ taps via tab bar). Desktop: same bottom tab bar, full-width rings card, no desktop first-log affordance. Rejected: C modal funnel; B-only toast without discovery. | 4.4 | A+B empty panel + ring fill feedback |
| 2026-07-28T10:12:00Z | crit-002 | element | element-only | A: chip strip in composer-dock during loading/tool calls (Gemini); B: expand streaming bubble inline chips only; C: pin AgentActionFeed above composer (rejected: history not live status). Chosen A. | 9to5google.com/2025/09/15/gemini-tools-redesign — Tools prompt bar + live activity above composer during generation | pwa/src/components/AgentChatComposer.tsx, pwa/src/components/AgentSectionBody.tsx, pwa/src/lib/agentChatStream.ts | Habits files: pwa/src/components/AgentChatComposer.tsx, pwa/src/lib/agentChatStream.ts. Quote: composer-dock has attach preview + bar only — no chip row when loading. agentChatStream L75-78 emits token/done only — tool_results on done. AgentSectionBody L65-75 mounts AgentActionFeed below scroll fold after messages exist. Gap: no live tool-status above composer during stream. 390px: composer visible Y; tool activity requires scroll up — N for status in 2s. Desktop: dock full-width sticky bottom; same gap — chips absent at 768px+. Rejected: B bubble-only (hidden in scroll); C pinned feed (post-hoc not live). | 4.2 | A composer-dock chip strip during stream |
| 2026-07-28T10:18:00Z | crit-006 | journey | journey-daily-checkin | A: Home Today agenda strip (next event / clear) + Open Day + Ask Coach chips; B: full Gemini Daily Brief card on Home (rejected: scope creep); C: push notification morning brief (rejected: out of PWA). Chosen A. | support.google.com/gemini/answer/17077455 Daily Brief; 9to5google.com/2025/08/20/google-calendar-m3-expressive-widget schedule widget density | pwa/src/lib/homeDashboardFetch.ts, pwa/src/components/AppTabContent.tsx, pwa/src/components/DayScheduleEmptyPanel.tsx | Habits files: pwa/src/lib/homeDashboardFetch.ts, pwa/src/components/AppTabContent.tsx. Quote: homeDashboardFetch L29-38 fetches food/habits/history/mealPlan/decisionCard — no calendar events on Home. AppTabContent L54-62 Home props lack navigateAgentPrompt/onOpenDay. Day empty CTA "Add with Coach" only on Day tab L82. Gap: daily-checkin journey breaks at Home — rings without schedule context. 390px: schedule requires Day tab tap — N for next event in 2s on Home. Desktop: same — no agenda strip at wide layout. Rejected: B full Daily Brief clone; C notifications only. | 4.3 | A Home today strip + cross-tab CTAs |
| 2026-07-28T10:25:00Z | crit-003 | element | element-only | A: auto-scroll .schedule-grid-scroll to now line on Day grid mount + Jump to now FAB when off-screen; B: make DayWeekStrip pills tappable day switchers (rejected: no per-day fetch); C: default view day not agenda (rejected: minor). Chosen A. | support.google.com/calendar/answer/6076199 — jump to current time in day view; Google Calendar mobile week strip + scroll-to-now on open | pwa/src/components/DayScheduleGrid.tsx, pwa/src/components/DayWeekStrip.tsx, pwa/src/App.css | Habits files: pwa/src/components/DayScheduleGrid.tsx, pwa/src/App.css. Quote: now line rendered L83-89 but .schedule-grid-scroll L67 has no scrollIntoView/ref effect — scrollTop stays 0. App.css L3951-3956 caps scroll at 420px/55dvh. DayWeekStrip L11-18 uses div not button — display-only week. Gap: afternoon user opens Day grid, now indicator below fold — manual scroll required. 390px: now line not visible without scroll — N for current time in 2s. Desktop: same capped scroll container at wide layout — now off-screen until manual scroll. Rejected: B week navigation without day API; C agenda default only. | 4.1 | A scroll-to-now on mount + Jump FAB |
| 2026-07-28T10:32:00Z | crit-007 | journey | journey-scan-quick | A: persist scanPreviewUrl in FoodLogUndoEntry + restore inline overlay on undo; B: defer clearScanFlow until undo toast dismisses (keep photo visible during window); C: auto-restore from ScanHistoryStrip on undo (rejected: extra tap). Chosen A+B. | timgraf.com/ux-design/forgiveness-principle — 5–7s toast undo with prominent target; Tinder/Hinge undo restores card stack context not blank state | pwa/src/hooks/useLogFoodScan.ts, pwa/src/hooks/useLogFoodUndoRestore.ts, pwa/src/components/UndoToast.tsx | Habits files: pwa/src/hooks/useLogFoodScan.ts, pwa/src/hooks/useLogFoodUndoRestore.ts. Quote: logScan L88-92 clearScanFlow() wipes scanPreviewUrl+scanResult before offerUndo; offerUndo L94-98 saves restoreScan only — no preview URL. useLogFoodUndoRestore L35-42 setScanResult/edit fields only — no setScanPreviewUrl. Gap: user swipes Log by mistake, taps Undo within 5s, lands on card-only SwipeFoodCard without captured photo overlay — OCR confirm context lost. 390px: undo toast visible above tab bar Y; restored confirm surface missing photo — N for same inline overlay in 2s after undo. Desktop: undo toast centered fixed bottom; same restore gap at wide layout. Rejected: C history strip only (2+ taps). | 4.4 | A+B preview URL in undo + defer clear until dismiss |
| 2026-07-28T10:38:00Z | crit-004 | element | element-only | A: tap card opens Keep-style detail BottomSheet with full body + edit fields + save; B: inline "Take a note" composer bar at grid top (rejected: duplicates FAB without fixing read); C: swipe-to-archive on cards (rejected: no archive API). Chosen A. | 9to5google.com/2025/08/21/google-keep-material-3-expressive-redesign — tap note opens editor; pin/archive in note chrome; support.google.com/keep/answer/2888263 search+filter | pwa/src/components/CardsKeepGrid.tsx, pwa/src/sections/Cards.tsx, pwa/src/lib/apiCards.ts | Habits files: pwa/src/components/CardsKeepGrid.tsx, pwa/src/lib/apiCards.ts. Quote: CardsKeepGrid L32 onClick={() => {}} — cards non-interactive despite Card wrapper. L49-50 title+body truncated in grid with no expand. apiCards L5-20 has get/create/delete only — no updateCard. Cards L66-67 delete via window.confirm not sheet overflow. Gap: user captures note, cannot reopen to read/edit body — Keep core loop broken. 390px: grid cards tappable-looking but dead — N for read note in 1 tap. Desktop: same masonry grid, onClick noop at wide layout — no detail pane/split view. Rejected: B composer-only; C archive swipe without API. | 4.3 | A tap → detail/edit BottomSheet |
| 2026-07-28T10:45:00Z | crit-008 | journey | journey-weekly-review | A: Home "Weekly review" card with 7-day habit+calorie summary + Open Day + Add strategy note pills; B: post-PDF-export toast with Add reflection chip (rejected: PDF too late in funnel); C: move all history to Day tab (rejected: calendar semantics). Chosen A. | mattbordey.co/apple-health — layered Summary→Detail→Weekly Recap; igeeksblog.com weekly activity summary glanceable then drill-down | pwa/src/components/HomeHabitTrendCard.tsx, pwa/src/components/HomeCalorieTrendCard.tsx, pwa/src/components/AppTabContent.tsx | Habits files: pwa/src/components/HomeHabitTrendCard.tsx, pwa/src/components/AppTabContent.tsx. Quote: HomeHabitTrendCard L14-40 static Card — no onOpenDay/onClick unlike HomeCalorieTrendCard L35-45 which links to Log. AppTabContent L54-62 Home props include onOpenLogHistory but no onOpenDay or onOpenCardsStrategy. Day.tsx L14-43 is calendar+today habits — no weekly food/habit rollup. Cards has strategy type but no entry from Home trends. Gap: weekly-review journey breaks — power user sees rings+trends on Home, cannot reach Day habit context or Cards reflection without 3 manual tab hops. 390px: habit trend card looks like calorie trend but dead — N for next weekly-review step in 1 tap. Desktop: same disconnected panels, PDF export only exit — no Cards closure. Rejected: B PDF-only CTA; C Day history relocation. | 4.5 | A Home weekly recap + cross-tab pills |
| 2026-07-28T10:52:00Z | crit-005 | element | element-only | A: committing state in useSwipeStack — animate card fly-off (translate off-screen + rotation) then call onSwipe on transitionend; B: wire scanHistory as real second card in stack (rejected: scope v2); C: add Rewind circle button (rejected: overlaps crit-007 undo toast). Chosen A. | dev.to Tinder vanilla JS — commit() flies card off-screen before history push; vp0.com dating swipe UI — threshold fly-off then next card promotes | pwa/src/hooks/useSwipeStack.ts, pwa/src/components/ui/SwipeStack.tsx, pwa/src/components/ui/ui.css | Habits files: pwa/src/hooks/useSwipeStack.ts, pwa/src/components/ui/SwipeStack.tsx. Quote: handleEnd L50-51 fire(direction) then setOffset({x:0,y:0}) — card snaps back instantly on Log/Skip/Edit. fire() from circle buttons L86-104 same instant reset. ui.css L109-132 ::before/::after pseudo cards simulate depth but no promotion animation on commit. Gap: Tinder/Hinge tactile commit missing — swipe feels like rubber band not decision. 390px: stamps fade during drag Y but release has no exit — N for satisfying commit feedback. Desktop: mouse drag same snap-back at wide layout — circle buttons also abrupt. Rejected: B real scan queue stack; C duplicate undo rewind. | 4.2 | A fly-off commit animation |
| 2026-07-28T11:00:00Z | crit-009 | journey | journey-coach-trust | A: greeting chips call send() not setInput; post-first-reply inline "Try voice coach" chip + consumer trust lede in VoiceCoachLayer; B: auto-open voice after first reply (rejected: invasive); C: preload sample coach thread (rejected: fake data). Chosen A. | 9to5google.com/2025/11/14/gemini-android-homepage-redesign — chips send immediately; design.google.com/gemini-ai-visual-design — soft guided trust signaling for voice | pwa/src/sections/Agent.tsx, pwa/src/components/AgentChatPanel.tsx, pwa/src/components/VoiceCoachLayer.tsx | Habits files: pwa/src/sections/Agent.tsx, pwa/src/components/VoiceCoachLayer.tsx. Quote: Agent L43 onSelectPrompt={s.setInput} — greeting prefills composer only, user must discover Send. AgentChatPanel L61 onClick={() => onSelectPrompt(text)} no send(). VoiceCoachLayer L52-54 lede mentions "local-voice-ai" dev stack — breaks skeptical-user trust. No post-reply chip bridging text coach to voice sheet. Gap: coach-trust journey stalls after chip tap — 2+ steps to first reply; voice sheet feels beta not product. 390px: Send button appears only after chip tap — N for first reply in 1 tap from greeting. Desktop: same prefill-only greeting at wide layout — voice orb hidden when input non-empty. Rejected: B auto voice modal; C fake thread. | 4.4 | A auto-send greeting + voice trust chip |
| 2026-07-28T11:08:00Z | crit-010 | journey | journey-capture-thought | A: inline Keep "Take a note…" expander at grid top + type chips on save; search focus reveals label filter pills (sickness/notes/strategy); B: FAB single-tap notes sheet title-only (rejected: still modal); C: custom user labels API (rejected: scope). Chosen A. | 9to5google.com/2025/04/02/google-keep-text-notes — FAB single-tap text capture; support.google.com/keep/answer/2888263 — search label filter chips | pwa/src/sections/Cards.tsx, pwa/src/components/CardsCreateSheet.tsx, pwa/src/components/CardsFilterBar.tsx | Habits files: pwa/src/sections/Cards.tsx, pwa/src/components/CardsFilterBar.tsx. Quote: Cards L105-120 FAB opens CardsCreateSheet BottomSheet with type select+title+body — 3 fields before save. CardsFilterBar L38-44 search is plain input — no label pills on focus. cardsSectionShared L13-16 filterCardsBySearch title/body text only. Journey capture→label→find breaks: capture is 2+ taps (FAB→sheet→Save); find-later relies on typing not label chips. 390px: no inline composer — N for capture in 1 tap. Desktop: same FAB-only path at wide layout — search lacks Keep focus chip row. Rejected: B modal-only shortcut; C custom labels API. | 4.3 | A inline capture + search label chips |
| 2026-07-28T11:15:00Z | crit-013 | element | element-only | A: tap each Activity ring opens metric detail BottomSheet (today value, sparkline, entries, Open Log/Day CTA); B: tap HomeSummaryTiles same drill-down (rejected: duplicate); C: Change Goals on Home (rejected: Settings scope). Chosen A. | support.apple.com/iphone/see-your-activity-summary — tap Activity rings for daily detail graphs; pcmag.com iPhone Fitness rings drill-down | pwa/src/components/ui/Ring.tsx, pwa/src/components/HomeActivityRingsCard.tsx, pwa/src/components/HomeSummaryTiles.tsx | Habits files: pwa/src/components/ui/Ring.tsx, pwa/src/components/HomeActivityRingsCard.tsx. Quote: Ring L28 role=img static div — no button/link. ActivityRings L71 role=group no onClick handlers. HomeActivityRingsCard L34-41 only action is Share PNG — no drill-down. HomeSummaryTiles L48-68 static article tiles also non-interactive. Gap: Apple Health tap-rings→detail missing — user cannot inspect protein/cal/habits contributors from Home. 390px: rings look tappable (health metaphor) but dead — N for metric detail in 1 tap. Desktop: same display-only rings at wide layout — Share PNG only exit. Rejected: B duplicate tiles; C goals editor on Home. | 4.2 | A per-ring detail BottomSheet |
| 2026-07-28T11:22:00Z | crit-011 | journey | journey-settings-trust | A: pre-connect scope bullets (Calendar read, Sheets read/write) + disconnect confirm BottomSheet listing impacted features + post-disconnect data note; B: link out to Google Account permissions only (rejected: breaks journey); C: block disconnect entirely (rejected). Chosen A. | support.google.com/accounts/answer/3466521 — review permissions before authorize; support.google.com/accounts/answer/13533235 — remove access confirm + data retention note | pwa/src/components/SettingsGoogleCard.tsx, pwa/src/hooks/useSettingsSectionData.ts, pwa/src/components/SettingsSectionChrome.tsx | Habits files: pwa/src/components/SettingsGoogleCard.tsx, pwa/src/hooks/useSettingsSectionData.ts. Quote: SettingsGoogleCard L19-25 Connect is bare href — no scope list. L22-25 Disconnect fires onDisconnect immediately — no confirm. useSettingsSectionData L63-74 disconnectGoogle() direct API call. SettingsSectionChrome L24-30 success banner generic — no "Day calendar stops syncing" impact. Gap: privacy-conscious user cannot assess trust before OAuth or understand disconnect consequences. 390px: connect/disconnect on same card Y but zero transparency — N for informed consent in 2s. Desktop: same at wide layout. Rejected: B external-only; C no disconnect. | 4.5 | A scope disclosure + disconnect confirm |
| 2026-07-28T11:28:00Z | crit-012 | journey | journey-day-plan | A: show DayScheduleGrid when empty + tap slot opens quick-add sheet calling createCalendarEvent + Home "Next up" chip after save; B: empty panel time pills only (rejected: no grid context); C: Coach-only detour (rejected: 3-tab loop). Chosen A. | support.google.com/calendar/answer/72143 — tap empty time slot to create event; 9to5google.com/2024/03/12/google-calendar-event-task — FAB quick create | pwa/src/components/DayTimelineCard.tsx, pwa/src/components/DayScheduleGrid.tsx, pwa/src/lib/homeDashboardFetch.ts, pwa/src/lib/apiCalendar.ts | Habits files: pwa/src/components/DayTimelineCard.tsx, pwa/src/lib/apiCalendar.ts. Quote: DayTimelineCard L76-85 when !events.length renders DayScheduleEmptyPanel — grid hidden on empty day. DayScheduleGrid L77-81 schedule-grid-line divs have no onClick — slots dead. apiCalendar L8-12 createCalendarEvent API exists — zero pwa/src callers (grep). homeDashboardFetch L29-38 fetches food/habits/mealPlan — no getCalendarToday. Gap: planner cannot add block in Day view nor verify plan on Home — journey breaks at both touchpoints. 390px: empty day shows text CTA only — N for add block in 1 tap on grid. Desktop: same empty panel at wide layout — no split-view create. Rejected: B pills without grid; C Agent detour only. | 4.4 | A empty grid tap-create + Home next-block |
| 2026-07-28T11:34:00Z | crit-014 | element | element-only | A: during loading replace mic with square Stop button wired to abortRef.abort(); retain partial assistant bubble + "Response stopped" copy + Regenerate; B: require typing + Send to interrupt per placeholder (rejected: misleading); C: swipe-down on bubble to cancel (rejected: undiscoverable). Chosen A. | androidpolice.com/google-gemini-app-android-stop-regenerate-query — stop button replaces mic during generation; support.google.com Gemini web stop mid-response | pwa/src/components/AgentChatComposer.tsx, pwa/src/hooks/useAgentChatStream.ts, pwa/src/hooks/useAgentChat.ts | Habits files: pwa/src/components/AgentChatComposer.tsx, pwa/src/hooks/useAgentChatStream.ts. Quote: AgentChatComposer L85 placeholder "Send to interrupt…" when loading but L90-105 shows mic (not Stop) when input empty. canSend L36 allows send during loading but Send button hidden without text. useAgentChatStream L91-93 abortRef exists in beginStream only — no stopStream exported. useAgentChat send() L27-29 requires text — cannot interrupt without typing. Gap: Gemini stop-generation affordance missing — user waits for long tool+token stream. 390px: mic visible during stream Y — N for stop in 1 tap. Desktop: same composer dock at wide layout — no stop control. Rejected: B placeholder-only interrupt; C swipe cancel. | 4.3 | A Stop button replaces mic during stream |

---

## CRITIQUE_OUTCOMES

> Post-ship validation. Updated on validation ticks (every 5th tick or when ux-relay marks `shipped`).

| crit_id | linked_ui | outcome | validated_at | learnings |
|---------|-----------|---------|--------------|-----------|
| — | — | — | — | — |

**Outcome values:** `validated` | `partial` | `missed` | `pending`

---

## REVIEW_FINDINGS

| id | severity | finding | source | action | backlog_ref | status |
|----|----------|---------|--------|--------|-------------|--------|
| uc-r0-000 | low | No code changes — critique-only tick 1 | round-0 | closed | — | closed |
| uc-r0-001 | low | No code changes — critique-only tick 2 | round-0 | closed | — | closed |
| uc-r0-002 | low | No code changes — critique-only tick 3 | round-0 | closed | — | closed |
| uc-r0-003 | low | No code changes — critique-only tick 4 | round-0 | closed | — | closed |
| uc-r0-004 | low | No code changes — critique-only tick 5 | round-0 | closed | — | closed |
| uc-r0-005 | low | No code changes — critique-only tick 6 | round-0 | closed | — | closed |
| uc-r0-006 | low | No code changes — critique-only tick 7 | round-0 | closed | — | closed |
| uc-r0-007 | low | No code changes — critique-only tick 8 | round-0 | closed | — | closed |
| uc-r0-008 | low | No code changes — critique-only tick 9 | round-0 | closed | — | closed |
| uc-r0-009 | low | No code changes — critique-only tick 10 | round-0 | closed | — | closed |
| uc-r0-010 | low | No code changes — critique-only tick 11 | round-0 | closed | — | closed |
| uc-r0-011 | low | No code changes — critique-only tick 12 | round-0 | closed | — | closed |
| uc-r0-012 | low | No code changes — critique-only tick 13 | round-0 | closed | — | closed |
| uc-r0-013 | low | No code changes — critique-only tick 14 | round-0 | closed | — | closed |

---

## HISTORY

| completed_at | item_id | phase | outcome | evidence |
|--------------|---------|-------|---------|----------|
| 2026-07-28T10:05:00Z | crit-001 | 8-close | journey-first-log critique → ux-relay CRITIQUE_BACKLOG proposed | validate_critique_tick OK |
| 2026-07-28T10:12:00Z | crit-002 | 8-close | Agent element audit → streaming tool chips proposed | validate_critique_tick OK |
| 2026-07-28T10:18:00Z | crit-006 | 8-close | journey-daily-checkin → Home today strip proposed | validate_critique_tick OK |
| 2026-07-28T10:25:00Z | crit-003 | 8-close | Day element audit → scroll-to-now proposed | validate_critique_tick OK |
| 2026-07-28T10:32:00Z | crit-007 | 8-close | journey-scan-quick → undo photo restore proposed | validate_critique_tick OK |
| 2026-07-28T10:38:00Z | crit-004 | 8-close | Cards element audit → note detail sheet proposed | validate_critique_tick OK |
| 2026-07-28T10:45:00Z | crit-008 | 8-close | journey-weekly-review → Home recap cross-tab proposed | validate_critique_tick OK |
| 2026-07-28T10:52:00Z | crit-005 | 8-close | Log element audit → swipe fly-off proposed | validate_critique_tick OK |
| 2026-07-28T11:00:00Z | crit-009 | 8-close | journey-coach-trust → greeting send + voice bridge proposed | validate_critique_tick OK |
| 2026-07-28T11:08:00Z | crit-010 | 8-close | journey-capture-thought → inline capture proposed | validate_critique_tick OK |
| 2026-07-28T11:15:00Z | crit-013 | 8-close | Home element audit → ring drill-down proposed | validate_critique_tick OK |
| 2026-07-28T11:22:00Z | crit-011 | 8-close | journey-settings-trust → scope+disconnect proposed | validate_critique_tick OK |
| 2026-07-28T11:28:00Z | crit-012 | 8-close | journey-day-plan → tap-create + Home closure proposed | validate_critique_tick OK |
| 2026-07-28T11:34:00Z | crit-014 | 8-close | Agent element audit → stop generation proposed | validate_critique_tick OK |
