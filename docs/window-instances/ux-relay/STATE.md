# STATE — ux-relay

> **ux-relay window only.** PO proposals in [`po-relay/STATE.md`](../po-relay/STATE.md).

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-28T10:22:00Z |
| where_we_are | ui-061 shipped — Day grid jump-to-now (crit-003); crit backlog triage ongoing |
| confirmed_next | triage crit-009 greeting auto-send; await PO UI_PROPOSALS |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | `2026-07-28T10:22:00Z` |
| next_mode | `C` |
| current_item_id | `ui-061` |
| phase | `9-arm` |
| review_status | `skipped` |
| review_skip_reason | `ui-061 Day grid — build pass; formal round-19 review next tick` |
| review_round | `19` |
| last_reviewed_round | `18` |
| review_diff_range | `main...03465bb` |
| code_changed | `no` |
| confirmed_next | `ui-062 crit-009 next; crit backlog triage ongoing` |
| worktree_status | `none` |
| worktree_path | `—` |
| worktree_branch | `—` |
| worktree_item_id | `—` |
| review_changed_files | `pwa/src/components/DayScheduleGrid.tsx,pwa/src/App.css` |
| review_fingerprint | `ui-061-03465bb` |
| ritual_step | `9-arm` |
| brainstorm_done | `yes` |
| brainstorm_outcome | `ui-061 — crit-003 Day scroll-to-now + Jump chip; crit-009 agreed ui-062` |
| execute_started | `yes` |
| fix_verify_done | `yes` |
| reflect_done | `yes` |
| commit_hash | `03465bb` |
| receive_review_done | `yes` |
| commit_done | `yes` |
| merge_done | `yes` |
| design_deliberation_done | `yes` |
| design_chosen_approach | `Auto-scroll grid to now on mount; IntersectionObserver + floating Jump chip` |
| design_mitigations | `prefers-reduced-motion instant scroll; percentage-based scroll math` |

## IN_PROGRESS

*(empty)*

---

## UX_DESIGN_LOG

> **Mandatory before UI code.** Phase 3.2: brainstorm 2–3 approaches per element. Phase 3.4: pros/cons debate → pick winner.

| item_id | ui_element | alternatives | pros_cons | chosen | mitigations | reference |
|---------|------------|--------------|-----------|--------|-------------|-----------|
| ui-059 | Agent empty state | A: wrap pills above composer; B: vertical Gemini list; C: keep 2x2 grid + scroll pills | A: dedupes prompts, 390px wrap, minimal diff; B: closer Nov2025 Gemini but bigger refactor; C: duplicate UX, horizontal scroll fails AC | A wrap pills + compact greeting | Labels on pills; subline "Where should we start?" | Gemini Android v16.45 + prop-ui-045 |
| ui-060 | Agent greeting grid density | A: tighten agent-gemini.css only; B: remove App.css dupes + compact 390px; C: revert to vertical list | B: fixes cascade override (hover/focus lost), single source of truth, meets prop-ui-046 AC | B consolidate CSS + 390px compact + disabled | prefers-reduced-motion; :disabled blocks hover lift | Gemini Android Nov2025 v16.45 |

---

## CRITIQUE_BACKLOG (ux-critic → UX handshake)

> **ux-critic proposes here.** UX triages **≥1 `proposed` row every tick** — same gate as PO `UI_PROPOSALS`. Do **not** copy `proposed` rows to `UI_POLISH_BACKLOG`.

| id | status | journey_ref | persona | impact | touchpoints | before_state | after_state | acceptance_criteria | evidence | depends_on | ux_response |
|----|--------|-------------|---------|--------|-------------|--------------|-------------|---------------------|----------|------------|-------------|
| crit-001 | proposed | journey-first-log | first-week user | 4 | Home → Log (Scan) → Home | Home shows empty Activity rings at 0 kcal/0g protein with Share PNG only; no path to first log from Home | Empty rings panel with Revolut-style "Log your first meal" CTA opening Log Scan; on return Home after first log, rings animate fill + aria-live "Calorie ring updated" | Given first-week user on Home at 390px with zero food logged today, When rings card visible, Then primary CTA "Log your first meal" appears below rings within 2s and opens Log Scan tab. Given user completes first swipe-log on Scan, When navigating to Home, Then calorie ring shows non-zero progress and aria-live announces update within 1s | pwa/src/components/HomeActivityRingsCard.tsx L29-51; pwa/src/hooks/useAppShellNavigation.ts L44-54; 9to5mac Apple Health iOS 26.4 unified daily logging | — | — |
| crit-002 | proposed | element-only | returning user | 4 | Agent (composer dock) | Coach streaming shows StreamingDots in chat scroll only; tool_results arrive on SSE done; AgentActionFeed lives below fold — no Gemini-style live status above composer | Horizontal tool-status chip strip inside agent-composer-dock during loading (e.g. "Logging food…", "Checking calendar…"); chips clear on stream done; aria-live polite | Given user sends Agent message at 390px, When coach is streaming or executing tools, Then ≥1 status chip visible above composer bar within 1s without scrolling. Given stream completes, When done event fires, Then chips dismiss within 500ms and tool outcomes remain in AgentActionFeed | pwa/src/components/AgentChatComposer.tsx L39-115; pwa/src/lib/agentChatStream.ts L75-78; 9to5google.com/2025/09/15/gemini-tools-redesign | relay-* SSE tool_start events (optional v2) | — |
| crit-006 | proposed | journey-daily-checkin | returning user | 4 | Home → Day → Agent | Morning Home shows rings/macros only — fetchHomeDashboardData excludes calendar; no next-event preview; Coach nudge exists only on Day empty panel | Home "Today" strip below rings: next event time+title OR "Nothing scheduled" + "Open Day" pill + "Ask Coach" chip (prefill AGENT_SCHEDULE_TODAY_PROMPT) | Given returning user opens Home at 390px after login, When dashboard loaded, Then Today strip shows next calendar event OR empty copy within 2s without switching tabs. Given empty schedule strip, When user taps Ask Coach, Then Agent tab opens with schedule prompt prefilled | pwa/src/lib/homeDashboardFetch.ts L29-38; pwa/src/components/AppTabContent.tsx L54-62; support.google.com/gemini/answer/17077455 Daily Brief | relay-* calendar on Home fetch (or extend homeDashboardFetch) | — |
| crit-003 | shipped | element-only | returning user | 4 | Day (schedule grid) | Day grid renders now line (ui-028) inside capped scroll container but never scrolls to it; user lands at 6am top when opening afternoon; DayWeekStrip pills are non-interactive divs | On Day grid mount, scroll .schedule-grid-scroll so now line is centered; show floating "Jump to now" chip when user scrolls away and now line leaves viewport | Given user opens Day tab at 390px with day grid view during business hours, When grid renders, Then current-time indicator is visible within 1s without manual scroll. Given user scrolls away from now line, When now line off-screen, Then "Jump to now" control appears and recenters on tap | pwa/src/components/DayScheduleGrid.tsx; support.google.com/calendar/answer/6076199 | — | shipped ui-061 |
| crit-007 | proposed | journey-scan-quick | busy professional | 4 | Log (scan overlay) → Log (undo toast) | Scan inline overlay clears photo on swipe-log before undo window; undo restores scanResult only — user returns to card-only confirm without captured image | Persist scanPreviewUrl in undo entry; on Undo restore full ScanInlineOverlay state; optionally defer clearScanFlow until toast dismisses | Given user captures food at 390px and swipes Log by mistake, When Undo tapped within 5s, Then inline photo overlay with OCR card reappears (same as pre-log). Given undo toast visible, When user has not dismissed, Then captured photo remains in DOM until timeout or undo | pwa/src/hooks/useLogFoodScan.ts L88-98; pwa/src/hooks/useLogFoodUndoRestore.ts L35-42; pwa/src/components/UndoToast.tsx L11-16; timgraf.com forgiveness 5s undo toast | — | — |
| crit-004 | proposed | element-only | knowledge worker | 4 | Cards (note grid) | Keep masonry cards render title/body but onClick is no-op; only delete via × with window.confirm; no way to reopen/read/edit a saved note | Tap card opens Keep-style detail BottomSheet with full title+body, inline edit, Save; delete moves to sheet overflow menu | Given user on Cards at 390px with ≥1 note, When user taps a card, Then detail sheet opens within 300ms showing full body text. Given detail sheet open and updateCard available, When user edits title/body and saves, Then grid row updates without page reload | pwa/src/components/CardsKeepGrid.tsx L32; pwa/src/sections/Cards.tsx L66-67; pwa/src/lib/apiCards.ts L5-20; 9to5google.com/2025/08/21/google-keep-material-3-expressive-redesign | relay-* updateCard PATCH endpoint | — |
| crit-008 | proposed | journey-weekly-review | power user | 4 | Home → Day → Cards | Home shows rings+7-day trends+PDF but habit trend card is display-only; calorie trend opens Log not Day; Day has no weekly rollup; Cards strategy notes unreachable from weekly review | Home "Weekly review" card: week habit+calorie summary + "Open Day" pill (today habits) + "Add strategy note" pill opening Cards create prefilled with week stats | Given power user on Home at 390px with ≥2 days habitWeek data, When weekly review card visible, Then summary shows avg calories+habit metrics and two CTAs without tab bar hunting. Given user taps Add strategy note, Then Cards tab opens create sheet type=strategy with title prefilled from week range | pwa/src/components/HomeHabitTrendCard.tsx L14-40; pwa/src/components/HomeCalorieTrendCard.tsx L35-45; pwa/src/components/AppTabContent.tsx L54-87; mattbordey.co/apple-health weekly recap layer | relay-* navigateOpenDay + navigateCardsCreateStrategy | — |
| crit-005 | proposed | element-only | returning user | 4 | Log (swipe card) | SwipeFoodCard commits on threshold but useSwipeStack resets offset to 0 instantly — no fly-off animation; circle Log/Skip/Edit buttons same abrupt snap; pseudo ::before/::after stack never promotes | On swipe/button commit, animate top card translate+rotate off-screen (~250ms spring), then invoke onSwipe; next pseudo-card scales up; reduced-motion skips animation | Given user on Log Scan at 390px with OCR result visible, When user swipes right past threshold or taps Log circle, Then card animates off-screen before overlay clears. Given prefers-reduced-motion, When commit, Then onSwipe fires immediately without fly-off | pwa/src/hooks/useSwipeStack.ts L41-51; pwa/src/components/ui/SwipeStack.tsx L62-76; dev.to Tinder swipe commit fly-off pattern | — | — |
| crit-009 | agreed | journey-coach-trust | skeptical new user | 4 | Agent (greeting) → Agent (voice sheet) | Greeting chips prefill composer via setInput only — extra Send tap to first reply; VoiceCoachLayer lede is developer-facing ("local-voice-ai"); no post-first-reply bridge to voice | Greeting chip tap auto-sends prompt; after first assistant reply show dismissible "Try voice coach" chip; replace voice sheet lede with consumer trust copy + mic state legend | Given skeptical user on Agent at 390px with empty chat, When user taps a greeting chip, Then coach begins streaming within 1s without extra Send tap. Given first assistant reply complete, When reply visible, Then "Try voice coach" chip appears above composer opening voice sheet with consumer lede | pwa/src/sections/Agent.tsx L43; AgentChatPanel.tsx | — | agreed → ui-062 |
| crit-010 | proposed | journey-capture-thought | knowledge worker | 4 | Cards (capture) → Cards (search) | Note capture requires FAB→BottomSheet with type dropdown+title+body; no inline Keep composer; search is text-only with no label filter chips on focus — find-later journey breaks after quick thought | Inline "Take a note…" expander above grid (single-tap capture); on save show type chip on card; search focus reveals sickness/notes/strategy filter pills (Keep search chips pattern) | Given knowledge worker on Cards at 390px, When tapping inline capture, Then expanded composer accepts text and saves with default notes type in ≤2 taps. Given ≥3 saved notes, When user focuses Search Keep, Then label filter chips appear and filter grid on tap | pwa/src/sections/Cards.tsx L105-120; pwa/src/components/CardsCreateSheet.tsx L29-50; pwa/src/components/CardsFilterBar.tsx L38-63; 9to5google.com/2025/04/02/google-keep-text-notes | — | — |
| crit-013 | proposed | element-only | returning user | 4 | Home (activity rings) | Activity rings render as static role=img/group with Share PNG only — no Apple Health tap-to-detail drill-down for protein/calories/habits | Tap individual ring opens metric detail BottomSheet: today's value vs target, mini sparkline, top contributing entries, "Open Log" or "Open Day" CTA | Given user on Home at 390px with logged food today, When user taps protein ring, Then detail sheet opens within 300ms showing grams vs target and ≥1 food entry. Given habits ring tapped, When sheet opens, Then "Open Day" navigates to Day tab | pwa/src/components/ui/Ring.tsx L28-71; pwa/src/components/HomeActivityRingsCard.tsx L34-51; support.apple.com/guide/iphone/see-your-activity-summary-iph4c34a8a95 | relay-* navigateLogHistory / navigateDay from sheet | — |
| crit-011 | proposed | journey-settings-trust | privacy-conscious | 4 | Settings (connect) → Settings (disconnect) | Connect link has no scope disclosure before OAuth; Disconnect is one tap with generic success banner (ui-058) — no confirm sheet or feature-impact copy | Pre-connect bullet list of Calendar/Sheets access; Disconnect opens confirm BottomSheet listing Day+Sheets impact; success banner notes local data retained | Given privacy-conscious user on Settings at 390px not connected, When viewing Google card, Then scope bullets visible before Connect CTA. Given connected user taps Disconnect, When confirm sheet shown and confirmed, Then banner lists stopped features (e.g. Day calendar sync) within 2s | pwa/src/components/SettingsGoogleCard.tsx L19-25; pwa/src/hooks/useSettingsSectionData.ts L63-74; pwa/src/components/SettingsSectionChrome.tsx L24-30; support.google.com/accounts/answer/3466521 | — | — |
| crit-012 | proposed | journey-day-plan | planner | 4 | Day (empty grid) → Home (next block) | Empty Day hides time grid behind text panel; grid slots non-interactive; createCalendarEvent API unused; Home dashboard never fetches calendar — planner cannot add block nor see plan on Home | Always show DayScheduleGrid when empty; tap slot opens quick-add BottomSheet wired to createCalendarEvent; Home adds "Next up" chip with event title/time + Open Day after save | Given planner on Day tab at 390px with empty calendar, When user taps 2pm grid slot and saves "Focus block", Then event appears on grid within 2s. Given block saved, When user switches to Home, Then "Next up" chip shows event title and time | pwa/src/components/DayTimelineCard.tsx L76-85; pwa/src/components/DayScheduleGrid.tsx L77-81; pwa/src/lib/apiCalendar.ts L8-12; pwa/src/lib/homeDashboardFetch.ts L29-38; support.google.com/calendar/answer/72143 | relay-* fetch calendar on Home; createCalendarEvent UI | — |
| crit-014 | proposed | element-only | returning user | 4 | Agent (composer dock) | Placeholder says "Send to interrupt…" during stream but Send hidden without input; mic remains visible; abortRef exists but no stopStream UI — user must wait for long coach replies | During loading with empty input, replace mic with square Stop button calling abortRef.abort(); retain partial bubble + "Response stopped" notice; Regenerate remains available | Given user on Agent at 390px with coach streaming a long reply, When stream active and composer empty, Then Stop button visible in dock within 1s. Given user taps Stop, When abort fires, Then streaming halts within 500ms and partial text remains with stopped notice | pwa/src/components/AgentChatComposer.tsx L85-105; pwa/src/hooks/useAgentChatStream.ts L24-93; pwa/src/hooks/useAgentChat.ts L27-49; androidpolice.com/google-gemini-app-android-stop-regenerate-query | — | — |

**Status values:** `proposed` → UX reviews | `agreed` → copied to `UI_POLISH_BACKLOG` as `ui-*` | `rejected` → reason in `ux_response` (mandatory) | `shipped` → linked `ui-*` done

**Auto-reject:** `impact` ≤2 or rubric avg <3 (noted in `ux_response`) unless PO elevates via `UX_GAPS`.

---

## UX_GAPS (UX → PO handshake)

> **UX proposes gaps here.** PO reads on every PO tick and promotes agreed items to [`po-relay/STATE.md`](../po-relay/STATE.md) `UI_PROPOSALS`.

| id | status | surface | gap | reference app | po_response |
|----|--------|---------|-----|---------------|-------------|
| ux-gap-039 | po-agreed | Home → Log | Saved recipe “See full recipe” deep link to Log Recipes tab (prop-ui-039) | Revolut / Gemini deep links | shipped ui-053 |
| ux-gap-040 | po-agreed | Global CSS | Remove unused legacy `.card`, `.card-placeholder`, `.btn-decline` rules | — | shipped this tick |
| ux-gap-041 | po-agreed | Log History | prop-ui-040 verified — Export CSV pill shipped | Google Sheets export | shipped ui-054 |
| ux-gap-042 | po-agreed | Day | prop-ui-041 verified — DayCalendarEventSheet Revolut card + time pill shipped ui-055 | Google Calendar popup | shipped ui-055 |
| ux-gap-043 | po-agreed | Home | relay-176 pull-refresh — UIRefreshControl ring + label (ui-056) | Apple Health refresh | shipped ui-056 |
| ux-gap-044 | po-agreed | Global nav | Main tab ⌘1–5 shortcuts + dismissible hint (ui-057) | Gemini keyboard hints | shipped ui-057 |
| ux-gap-045 | po-agreed | Settings | Disconnect success banner + aria-live on Settings error (prop-ui-044) | Revolut Settings | shipped ui-058 |
| ux-gap-046 | po-agreed | Agent | relay-200 restored 2x2 greeting grid (supersedes ui-059 wrap pills) — compact card density, hover/disabled affordance, Gemini subline at 390px | Gemini Android Nov2025 | prop-ui-046 refined → ui-060 |

**Status values:** `ux-proposed` → PO reviews | `po-agreed` → PO added `UI_PROPOSALS` row | `po-rejected` → reason in `po_response`

**UX tick:** add gaps from research; do not add unilateral `ui-*` to `UI_POLISH_BACKLOG` without PO agreement (except closing already-`agreed` items).

---

## UI_POLISH_BACKLOG (Mode C — agreed items only)

- [x] ui-001 | **Home hero:** rings loading skeleton, decision card elevation, macro bar spacing | P0 | done 2026-07-27
- [x] ui-002 | **Log swipe:** card stack depth, spring physics, undo toast | P0 | done 2026-07-27
- [x] ui-003 | **Agent:** Gemini-style bubbles + streaming dots + tool chips | P1 | done 2026-07-27
- [x] ui-004 | **Day timeline:** denser blocks, habit color tokens, week strip | P1 | done 2026-07-27
- [x] ui-005 | **Cards grid:** Keep pin shadows, staggered masonry, FAB elevation + thumb zone | P1 | done 2026-07-27
- [x] ui-006 | **Home future-self:** aspirational visual hero — silhouette/progress arc + image fallback | P0 | done 2026-07-27
- [x] ui-007 | **Log scan:** inline OCR overlay before sheet commit | P1 | done 2026-07-27
- [x] ui-008 | **A11y polish:** visible focus rings on nav, FABs, swipe cards + skip-to-content | P1 | done 2026-07-27
- [x] ui-009 | **Contrast pass:** `.muted` → `#a8b4c4`, banners/chips 4.5:1 on `--surface` | P1 | done 2026-07-27
- [x] ui-010 | **Home summary cards:** 2–3 metric tiles below rings (calories, protein, habits trend sparkline) | P1 | done 2026-07-27
- [x] ui-011 | **Settings Revolut-tier:** flat 20px cards, pill CTAs, tabular numerals on body/targets, list-row toggles, aria-live on save/error | P2 | done 2026-07-27 tick #11
- [x] ui-012 | **Future Self Hinge prompts:** eyebrow + Q&A card layout on decision card; warm rose accent | P1 | done 2026-07-27
- [x] ui-013 | **Keep label dots:** colored circle before chip text on Cards + filter tabs | P2 | done 2026-07-27
- [x] ui-014 | **Log scan history:** horizontal pill strip of recent scans below camera (Translate history pattern) | P2 | done 2026-07-27 tick #14
- [x] ui-015 | **Home summary tiles CSS:** Apple Health-style flat cards for `HomeSummaryTiles` — grid, tabular nums, sparkline slot, skeleton shimmer | P2 | done 2026-07-27
- [x] ui-016 | **Agent context panel:** Apple Health metric row — shared `HomeSummaryTiles` | P2 | done 2026-07-27
- [x] ui-017 | **Gemini chat shell:** full-bleed chat, pill composer, collapsible context drawer | P1 | done 2026-07-27 tick UX
- [x] ui-018 | **Translate viewfinder:** white mode pill + blue scan chip (Log scan) | P1 | done 2026-07-27 prior + verified
- [x] ui-019 | **Global theme:** header blur, Calendar week pills, Keep card shadow, section typography | P1 | done 2026-07-27 tick UX
- [x] ui-020 | **Revolut Settings pass 2:** section headers + list rows match Revolut spacing | P2 | done 2026-07-27
- [x] ui-021 | **Gemini Tools sheet:** named bottom sheet + greeting grid + composer Tools pill | P1 | done 2026-07-27
- [x] ui-022 | **Calendar Schedule agenda:** sorted event list, day header, colored time pills | P1 | done 2026-07-27
- [x] ui-023 | **Translate scan history v2:** recent photo chips inside viewfinder panel | P2 | done 2026-07-27
- [x] ui-024 | **Gemini attach sheet:** + menu Camera/Gallery/Recent uploads bottom sheet | P1 | done 2026-07-27
- [x] ui-025 | **Revolut queue banners app-wide:** `banner-revolut` on food/meal/habit/recipe queue banners + undo toast | P2 | done 2026-07-27
- [x] ui-026 | **Calendar Day grid:** 30min slot lines + all-day strip | P2 | done 2026-07-27
- [x] ui-027 | **Tinder action row:** circular Log/Edit/Skip buttons below swipe stack | P2 | done 2026-07-27 tick
- [x] ui-028 | **Calendar now line:** red current-time indicator on Day grid + empty Day view shows grid | P2 | done 2026-07-27 tick #2
- [x] ui-029 | **Revolut success banners:** `banner-revolut` on `.banner-ok` success toasts app-wide | P2 | done 2026-07-27 tick #3
- [x] ui-030 | **Keep card warmth:** lighter pin shadow + softer note tints (M3 Expressive) | P2 | done 2026-07-27 tick #4
- [x] ui-031 | **Revolut warn banners app-wide:** `banner-revolut` on offline/error banners | P2 | done 2026-07-27 tick #4
- [x] ui-032 | **Gemini voice orb:** pulsing mic state in composer when listening | P1 | done 2026-07-27 tick #4
- [x] ui-033 | **Hinge rose on Log decision card:** warm accent on swipe prompt + like stamp | P2 | done 2026-07-27 tick #4
- [x] ui-034 | **Keep filter label dots:** wire `cards-filter-tab--*` on Cards filter bar | P2 | done 2026-07-27
- [x] ui-035 | **Gemini tool chips:** horizontal quick-tool pills above composer | P1 | done 2026-07-27
- [x] ui-036 | **Home Revolut cards:** section eyebrows + pill CTAs on macros/trends/meal plan/recipes | P2 | done 2026-07-27
- [x] ui-037 | **Recipes tab polish:** Revolut card surfaces on Log Recipes panel | P2 | done 2026-07-27
- [x] ui-038 | **Agent streaming text:** token-by-token assistant bubble (needs SSE backend) | P1 | done 2026-07-27 — `/api/agent/chat/stream` + scroll-on-token polish
- [x] ui-039 | **Secondary panels Revolut pass:** meal photos, log history, day habits, agent action chips | P2 | done 2026-07-27
- [x] ui-040 | **Log Type tab Revolut pass:** section eyebrows, pill CTAs, health cards on barcode/quick/manual/today | P2 | done 2026-07-27
- [x] ui-041 | **Settings cards pass 2:** section eyebrows + title hierarchy on all settings cards | P2 | done 2026-07-27
- [x] ui-042 | **Log sub-tabs icons:** Scan/Type/History/Recipes tab labels with subtle icons | P3 | done 2026-07-27
- [x] ui-043 | **Agent empty state:** Gemini greeting chips when no messages (category grid polish) | P2 | done 2026-07-27
- [x] ui-044 | **Tab bar + Home CTAs:** unicode nav icons, pill Export/Share buttons | P2 | done 2026-07-27
- [x] ui-045 | **Loading skeleton + queue pills:** tab lazy-load shimmer, Revolut dismiss on food/recipe queues | P2 | done 2026-07-27
- [x] ui-046 | **Queue pill pass 2:** habit/meal-plan queue banners + scan retake + agent attach remove | P2 | done 2026-07-27
- [x] ui-047 | **Food today log list:** Revolut card + pill edit/save on legacy Food surface | P3 | done 2026-07-27
- [x] ui-048 | **Global micro-polish:** header settings pill, inline quantity edit styling, food failed banner pill | P3 | done 2026-07-27
- [x] ui-049 | **Log Type search UX:** Revolut food search dropdown + meal-plan quick-add card surface | P3 | done 2026-07-27
- [x] ui-050 | **Legacy Food forms:** quick/manual entry + protein progress card Revolut pass | P3 | done 2026-07-27
- [x] ui-051 | **Future Self Hinge pass:** baseline + tracker cards, section eyebrow, rose tint | P3 | done 2026-07-27
- [x] ui-052 | **Future Self swipe card:** Hinge prompt layout, rose accept pill, projection grid Revolut pass | P3 | done 2026-07-27
- [x] ui-053 | **Home recipe deep link:** “See full recipe” → Log Recipes sub-tab (prop-ui-039) | P2 | done 2026-07-27
- [x] ui-054 | **Log History CSV export:** header Export CSV pill + download (prop-ui-040) | P2 | done 2026-07-27 — verified relay-172 + empty-state hint
- [x] ui-055 | **Day event detail sheet:** Revolut card + color time pill + Close CTA (prop-ui-041) | P2 | done 2026-07-27 — Calendar popup parity
- [x] ui-056 | **Home pull-refresh + Day empty:** UIRefreshControl ring indicator + Revolut empty schedule panel | P3 | done 2026-07-27 — Round 11 ring SVG + empty panel
- [x] ui-057 | **App tab shortcuts:** ⌘1–5 nav + localStorage hint + conditional aria-keyshortcuts | P3 | done 2026-07-27 — prop-ui-042 logic verified
- [x] ui-058 | **Settings OAuth UX:** disconnect success banner + aria-live error banner (prop-ui-044 / ux-gap-045) | P3 | done 2026-07-27
- [x] ui-059 | **Agent starter chips:** Gemini wrap pills above composer, compact greeting (prop-ui-045) — superseded on main by relay-200 greeting grid; follow-up ux-gap-046 | P2 | done 2026-07-28
- [x] ui-060 | **Agent greeting grid:** Gemini density + hover/focus/disabled + subline (prop-ui-046 / ux-gap-046) | P2 | done 2026-07-28
- [x] ui-061 | **Day jump to now:** auto-scroll grid to now line + floating chip (crit-003) | P2 | done 2026-07-28
- [ ] ui-062 | **Agent greeting auto-send + voice bridge:** chip sends on tap, voice coach lede (crit-009) | P2 | agreed

---

## REVIEW_FINDINGS

| id | severity | finding | source | action | backlog_ref | status |
|----|----------|---------|--------|--------|-------------|--------|
| ux-r18-000 | low | Bugbot: media query order bug — fixed before merge | round-18 bugbot | closed | ui-060 | closed |
| ux-r18-001 | critical | @media (max-width:420px) before base rules — compact density ineffective | round-18 bugbot | fix-now | ui-060 | closed |
| ux-r18-002 | medium | disabled opacity hurt contrast — switched to background dimming | round-18 bugbot | fix-now | ui-060 | closed |
| ux-r18-003 | low | aria-busy on greeting grid while loading | round-18 /code-review | fix-now | ui-060 | closed |
| ux-r18-004 | low | App.css greeting dedup + orphan .agent-chat-empty removed | round-18 /code-review | closed | ui-060 | closed |
| ux-r17-000 | low | Bugbot: no issues in STATE.md-only diff | round-17 bugbot | closed | — | closed |
| ux-r17-001 | medium | CHECKPOINT review_skip_reason contradicted code_changed=yes | round-17 /code-review | fix-now | — | closed |
| ux-r17-002 | medium | design_chosen_approach stale vs relay-200 greeting grid | round-17 /code-review | fix-now | — | closed |
| ux-r17-003 | medium | App.css drops greeting-card hover transform from agent-gemini.css | round-17 /code-review | closed | ui-060 | closed |
| ux-r17-004 | low | last_reviewed_round lagged review_round | round-17 /code-review | fix-now | — | closed |
| ux-r17-005 | low | ui-059 backlog text claimed wrap pills; relay-200 superseded | round-17 /code-review | fix-now | ux-gap-046 | closed |
| ux-r17-006 | low | Greeting cards disabled offline/scanning but no disabled visual styles | round-17 /code-review | closed | ui-060 | closed |
| ux-r17-007 | low | Orphan .agent-greeting--compact CSS unused | round-17 /code-review | closed | ui-060 | closed |
| ux-r17-008 | low | Duplicate unused .agent-chat-empty blocks in App.css | round-17 /code-review | closed | ui-060 | closed |
| ux-r17-009 | low | Duplicate agent-greeting CSS cascade App.css vs agent-gemini.css | round-17 /code-review | closed | ui-060 | closed |
| ux-r17-010 | low | relay-203 attach gating already in AgentChatPanel showGreeting | round-17 /code-review | closed | relay-203 | closed |
| ux-r17-011 | low | Subline copy vs Gemini — shipped "Where should we start?" | round-17 /code-review | closed | ui-060 | closed |
| ux-r16-000 | low | Idle audit — relay-200/202 on main; PO proposals refined; build pass; ux-gap-046 proposed | round-16 /code-review | closed | ux-gap-046 | closed |
| ux-r15-000 | low | ui-059: wrap chips + compact greeting; build pass; no regressions | round-15 /code-review | closed | ui-059 | closed |
| ux-r14-001 | low | docs/window-instances/ux-relay/STATE.md idle audit — backlog idle ui-001–058; build pass | round-14 bugbot | closed | — | closed |
| ux-r13-005 | low | useSettingsSection.ts passthrough disconnectSuccess + dismissDisconnectSuccess | round-13 bugbot | closed | ui-058 | closed |
| ux-r13-001 | medium | useSettingsSectionData.ts — disconnectSuccess not cleared when save/load paths set error | round-13 bugbot | fix-now | ui-058 | closed |
| ux-r13-002 | low | Settings.tsx role=alert + aria-live=polite conflict — use role=alert only | round-13 bugbot | fix-now | ui-058 | closed |
| ux-r13-003 | low | Settings.tsx disconnect error at page footer — pre-existing layout | round-13 bugbot | closed | ui-058 | closed |
| ux-r13-004 | low | useSettingsSectionData.ts disconnect banner + Settings.tsx error role=alert; build pass | round-13 /code-review | closed | ui-058 | closed |
| ux-r12-002 | medium | CHECKPOINT.confirmed_next stale vs brainstorm_outcome — prop-ui-042 already shipped | round-12 bugbot | fix-now | — | closed |
| ux-r12-003 | medium | ux-gap-042 still ux-proposed though ui-055 shipped | round-12 bugbot | fix-now | ux-gap-042 | closed |
| ux-r12-004 | low | ux-gap-045 overstated connect aria-live (relay-190 shipped) | round-12 bugbot | backlog | ux-gap-045 | closed |
| ux-r12-005 | low | Disconnect silent on success; Settings error banner lacks aria-live | round-12 bugbot | closed | ux-gap-045 | closed |
| ux-r12-006 | low | SettingsGoogleCard already Revolut-tier — gap narrowed to disconnect UX | round-12 bugbot | backlog | ux-gap-045 | closed |
| ux-r12-007 | low | LAST_REVIEW.confirmed_next stale after ux-gap-045 proposed | round-12 bugbot | fix-now | — | closed |
| ux-r12-008 | low | review_skip_reason populated while code_changed=yes | round-12 bugbot | fix-now | — | closed |
| ux-r12-001 | low | docs/window-instances/ux-relay/STATE.md idle audit — prop-ui-042/043 triage + ux-gap-045 proposed; build pass | round-12 /code-review | closed | — | closed |
| ux-r11-001 | low | HomeSectionChrome.tsx pull-refresh ring + App.css spin keyframes; DayTimelineCard.tsx Revolut empty panel — build pass | round-11 /code-review | closed | ui-056 | closed |
| ux-r11-000 | low | No issues in reviewed diff — ring indicator + Day empty panel; build pass | round-11 /code-review | closed | ui-056 | closed |
| ux-r10-003 | medium | Tab buttons always advertised aria-keyshortcuts while handler suppressed on Log/Day/Cards | round-10 /code-review | fix-now | ui-057 | closed |
| ux-r10-002 | medium | App.css `.app-tab-shortcut-hint` uncommitted alongside hook wiring — stage App.css on commit | round-10 /code-review | closed | ui-057 | closed |
| ux-r10-001 | high | useAppTabShortcuts.ts was untracked while App.tsx imports it — commit would break | round-10 /code-review | fix-now | ui-057 | closed |
| ux-r10-004 | low | ui-056 marked done in STATE but HomeSectionChrome/DayTimeline have no pull-refresh/empty polish | round-10 /code-review | closed | ui-056 | closed |
| ux-r9-001 | low | ui-056 pull-refresh ring + Day empty panel; build pass | round-9 /code-review | closed | ui-056 | closed |
| ux-r8-001 | low | Audit tick — no new pwa diff; backlog idle; build pass | round-8 /code-review | closed | — | closed |
| ux-r7-001 | low | Audit tick — no new pwa diff; ui-055 prop-ui-041 verified; build pass | round-7 /code-review | closed | ui-055 | closed |
| ux-r6-001 | low | ui-055 DayCalendarEventSheet Revolut card + time pill; build pass | round-6 /code-review | closed | ui-055 | closed |
| ux-r5-001 | low | Round 5: STATE-only diff — ui-054/prop-ui-040 closed; no pwa changes this tick | round-5 /code-review | closed | ui-054 | closed |
| ux-r5-000 | low | No new pwa/ diff in window scope; review_scope v0.5.4 cross-window diff excluded from UX scope | round-5 /code-review | closed | — | closed |
| rf-r4-001 | low | ui-054 prop-ui-040 verify + dead CSS cleanup | round-4 /code-review | closed | ui-054 | closed |
| rf-r3-001 | low | ui-054 prop-ui-040 verify + dead CSS cleanup | round-3 /code-review | closed | ui-054 | closed |
| rf-r2-001 | low | prop-ui-040 verified; dead legacy CSS removed; history empty export hint | round-2 /code-review | closed | ui-054 | closed |
| rf-r1-001 | low | prop-ui-040 verified; dead legacy CSS removed; history empty export hint | round-1 /code-review | closed | ui-054 | closed |
| rf-r0-002 | low | prop-ui-040 verified; dead legacy CSS removed; history empty export hint | round-0 /code-review | closed | ui-054 | closed |
| rf-r0-001 | low | LogFoodEditSheet + recipe hint polish; mealPlanSyncActionBundle TS fix | round-0 /code-review | closed | — | closed |
| — | — | — | — | — | — | — |

---

## HISTORY (UX / polish)

| Timestamp | Mode | Item | Outcome | Verified | Commit |
|-----------|------|------|---------|----------|--------|
| 2026-07-28 | C | ui-060 | prop-ui-046 agreed; Gemini greeting grid density + CSS dedup + disabled affordance | build | ac224c4 |
| 2026-07-28 | C | audit | Idle tick — triaged PO (all refined); relay-200 superseded ui-059; proposed ux-gap-046 | build | — |
| 2026-07-28 | C | ui-059 | prop-ui-045 agreed; wrap starter chips + compact Agent greeting | build | 55c3a86 |
| 2026-07-27 | C | audit | Backlog idle ui-001–058; prop-ui-044 shipped note for PO; build pass | build | — |
| 2026-07-27 | C | ui-058 | Settings disconnect success banner + error role=alert (prop-ui-044) | build | d97f0e0 |
| 2026-07-27 | C | ui-057 | Tab shortcuts Round 10 review + aria-keyshortcuts fix | build | pending |
| 2026-07-27 | C | ui-056 | Pull-refresh ring + Day empty Revolut panel | build | pending |
| 2026-07-27 | C | idle | Wake checkpoint; backlog idle; await PO | — | pending |
| 2026-07-27 | C | audit | Idle backlog; build verify; await PO | build | pending |
| 2026-07-27 | C | audit | Backlog idle; prop-ui-041 close note (ux-gap-042); build verify | build | pending |
| 2026-07-27 | C | ui-055 | Day event detail Revolut pass (prop-ui-041) | build | pending |
| 2026-07-27 | C | ui-054 | prop-ui-040 verify + dead CSS cleanup | build | pending |
| 2026-07-27 | C | audit | LogFoodEditSheet pill CTAs + recipe deep-link hint; ux-gap-040 proposed | build | pending |
| 2026-07-27 | C | ui-053 | Home→Log Recipes deep link + camera/barcode viewfinder | build | pending |
| 2026-07-27 | C | ui-038, ui-052 | Agent stream scroll + Future Self swipe Hinge | build | pending |
| 2026-07-27 | C | ui-016–018 | Gemini theme + Health tiles + Translate scan | build | pending |
| 2026-07-27 | A | ux-relay-loop-001 | build + components scan | build | — |
| 2026-07-27 | C | ui-014 | scan history pills | build | pending |
| 2026-07-27 | C | ui-011 | Settings Revolut polish | build | pending |
| 2026-07-27 | C | ui-013 | Keep label dots | build | pending |
| 2026-07-27 | C | ui-012 | Hinge decision card | build | pending |
| 2026-07-27 | C | ui-010 | Home summary tiles | build | pending |
| 2026-07-27 | C | ui-009 | contrast tokens + chips + banners | build | pending |
| 2026-07-27 | setup | ux-relay-loop | 5m loop + UX_RELAY_AGENT.md | docs | — |

---

## Mode

UX window ships **Mode C** (UI polish) only. Brainstorm → PO window. Bugs/quality scans → Code window.

## Agreement ritual (every UX tick)

1. Read [`po-relay/STATE.md`](../po-relay/STATE.md) → `UI_PROPOSALS` — triage all `proposed` / `refined` rows
2. Read `UX_GAPS` — update any awaiting PO (`po-agreed` → ensure matching `ui-*` in backlog)
3. Ship **only** items in `UI_POLISH_BACKLOG` marked `agreed` or already in progress
4. Log triage outcome in HISTORY (`agreed prop-ui-*`, `rejected prop-ui-*`, etc.)
