# STATE — ux-relay

> **ux-relay window only.** PO proposals in [`po-relay/STATE.md`](../po-relay/STATE.md).

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T13:25:00Z |
| where_we_are | ui-038 closed (SSE already wired); ui-052 Future Self swipe Hinge pass shipped |
| confirmed_next | scan orphan surfaces; propose UX_GAPS for PO |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T13:25:00Z |
| next_mode | `C` |
| current_item_id | — |
| phase | `9-arm` |
| review_status | `done` |
| review_skip_reason | — |
| confirmed_next | triage PO UI_PROPOSALS; scan remaining generic `card` surfaces |
| loops | dynamic wake — paste `@docs/window-instances/ux-relay/INSTANCE.md keep working` |

---

## IN_PROGRESS

*(empty)*

---

## UX_GAPS (UX → PO handshake)

> **UX proposes gaps here.** PO reads on every PO tick and promotes agreed items to [`po-relay/STATE.md`](../po-relay/STATE.md) `UI_PROPOSALS`.

| id | status | surface | gap | reference app | po_response |
|----|--------|---------|-----|---------------|-------------|
| — | — | — | *(none open)* | — | — |

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

---

## REVIEW_FINDINGS

| id | severity | finding | source | action | backlog_ref | status |
|----|----------|---------|--------|--------|-------------|--------|
| — | — | — | — | — | — | — |

---

## HISTORY (UX / polish)

| Timestamp | Mode | Item | Outcome | Verified | Commit |
|-----------|------|------|---------|----------|--------|
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
