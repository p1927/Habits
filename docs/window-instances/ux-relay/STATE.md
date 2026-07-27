# STATE — ux-relay

> **ux-relay window only.** PO proposals in [`po-relay/STATE.md`](../po-relay/STATE.md).

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T23:55:00Z |
| where_we_are | Backlog idle ui-001–058 done; all UI_PROPOSALS refined/shipped |
| confirmed_next | await new PO UI_PROPOSALS; Log HISTORY notes prop-ui-044 shipped |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | `2026-07-27T23:58:00Z` |
| next_mode | `C` |
| current_item_id | `—` |
| phase | `9-arm` |
| review_status | `skipped` |
| review_skip_reason | `v0.6.0 steady state — Phase 5 re-detects via prepare_review_tick.sh` |
| review_round | `14` |
| last_reviewed_round | `14` |
| review_diff_range | `none` |
| code_changed | `no` |
| confirmed_next | `backlog idle; await PO UI_PROPOSALS` |
| worktree_status | `none` |
| worktree_path | `—` |
| worktree_branch | `—` |
| worktree_item_id | `—` |
| review_changed_files | `—` |
| review_fingerprint | `—` |
| ritual_step | `9-arm` |
| brainstorm_done | `yes` |
| brainstorm_outcome | `Idle audit: backlog complete; no open ui-*; await PO proposals` |
| execute_started | `yes` |
| fix_verify_done | `yes` |
| reflect_done | `yes` |
| commit_hash | `—` |
| receive_review_done | `yes` |
| commit_done | `no` |
| merge_done | `no` |

## IN_PROGRESS

*(empty)*

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

---

## REVIEW_FINDINGS

| id | severity | finding | source | action | backlog_ref | status |
|----|----------|---------|--------|--------|-------------|--------|
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
