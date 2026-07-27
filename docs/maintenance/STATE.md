# Maintenance State — Canonical Quality Relay

> **Wake (PO window):** read [`LOOPS.md`](LOOPS.md) → [`PO_RELAY_AGENT.md`](PO_RELAY_AGENT.md) → [`CHARTER.md`](CHARTER.md) → this file → [`SESSION.md`](SESSION.md).

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T08:46:00Z |
| where_we_are | Loop 370210 tick #4 (PO): relay-150 Recipes tab seeded; ui-017 top UX |
| confirmed_next | UX ui-017 Gemini shell; Worker relay-147; Code maint-003 |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T12:13:00Z |
| current_item_id | — |
| loops | **2026-07-27:** legacy `agent-loop.sh` pidfile loops **stopped**; UX uses Cursor `/loop` 5m wake in UX chat |

### Active loops (one PID each — [`LOOPS.md`](LOOPS.md))

| Window | Sentinel | PID / shell | Status |
|--------|----------|-------------|--------|
| Worker | `AGENT_LOOP_TICK_HABITS` | — | **STOPPED** — use `@docs/agents/worker-relay.md keep working` in Worker chat |
| UX | `AGENT_LOOP_WAKE_UX_RELAY` | Cursor `/loop` 5m | **UP** — this chat |
| Code | `AGENT_LOOP_TICK_CODE_HEALTH` | — | **STOPPED** — use `@docs/agents/code-health.md keep working` in Code chat |
| PO | `AGENT_LOOP_TICK_MAINTENANCE` | — | **STOPPED** — use `@docs/agents/po-relay.md keep working` in PO chat |

---

## IN_PROGRESS

*(empty)*

---

## BUG_BACKLOG

*(empty — first scan in Mode A)*

---

## QUALITY_BACKLOG

- [x] maint-001 | Confirm before dismiss food queue | from RELAY BRAINSTORM | `Log.tsx` — done tick #7
- [x] maint-002 | Accessibility audit ARIA/focus/contrast | ROADMAP | ui-008/009/011 done — Settings aria-live shipped
- [ ] maint-003 | Lighthouse PWA score > 90 | ROADMAP | **Code window:** precache trimmed to **~605 KiB** (24 entries) via `globIgnores` for lazy `html2canvas` + `weekReportPdf` chunks; remaining: Lighthouse mobile audit on `vite preview /Habits/`

---

## UX_BACKLOG

- [x] ux-001 | Home decision card — aspirational future-self visual (not text-only) | Future viz | done ui-006
- [x] ux-002 | Log swipe undo within 5s after commit | Tinder | done ui-002
- [x] ux-003 | Agent streaming indicator + tool chips above input | Gemini | done ui-003
- [x] ux-004 | Day week strip + color-coded blocks | Calendar | done ui-004
- [x] ux-005 | Cards label chips + masonry density | Keep | done ui-005
- [x] ux-006 | Scan inline result overlay before sheet write | Translate | done ui-007

---

## UI_POLISH_BACKLOG (Mode C — 21st + ui-ux-pro-max only)

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
- [x] ui-026 | **Calendar Day grid:** 30min slot lines + all-day strip | P2 | done 2026-07-27 — Schedule/Day toggle, `DayScheduleGrid`, optional `end` from API
- [x] ui-027 | **Tinder action row:** circular Log/Edit/Skip buttons below swipe stack | P2 | done 2026-07-27 tick
- [x] ui-028 | **Calendar now line:** red current-time indicator on Day grid + empty Day view shows grid | P2 | done 2026-07-27 tick #2
- [x] ui-029 | **Revolut success banners:** `banner-revolut` on `.banner-ok` success toasts app-wide | P2 | done 2026-07-27 tick #3
- [x] ui-030 | **Keep card warmth:** lighter pin shadow + softer note tints (M3 Expressive) | P2 | done 2026-07-27 tick #4 — 42% tints, 1px shadow, keep-card-delete, empty state
- [x] ui-031 | **Revolut warn banners app-wide:** `banner-revolut` on offline/error banners (Home, Day, Log, Agent, Food, Cards, Settings, App) | P2 | done 2026-07-27 tick #4
- [x] ui-032 | **Gemini voice orb:** pulsing mic state in composer when listening | P1 | done 2026-07-27 tick #4 — voiceOrbState on composer mic
- [x] ui-033 | **Hinge rose on Log decision card:** warm accent on swipe prompt + like stamp | P2 | done 2026-07-27 tick #4 — `--hinge-rose`, tinder stamp + prompt
- [x] ui-034 | **Keep filter label dots:** wire `cards-filter-tab--*` on Cards filter bar | P2 | done 2026-07-27
- [x] ui-035 | **Gemini tool chips:** horizontal quick-tool pills above composer | P1 | done 2026-07-27 — `AgentToolChips`
- [x] ui-036 | **Home Revolut cards:** section eyebrows + pill CTAs on macros/trends/meal plan/recipes | P2 | done 2026-07-27
- [x] ui-037 | **Recipes tab polish:** Revolut card surfaces on Log Recipes panel | P2 | done 2026-07-27
- [ ] ui-038 | **Agent streaming text:** token-by-token assistant bubble (needs SSE backend) | P1 | open
- [x] ui-039 | **Secondary panels Revolut pass:** meal photos, log history, day habits, agent action chips | P2 | done 2026-07-27
- [x] ui-040 | **Log Type tab Revolut pass:** section eyebrows, pill CTAs, health cards on barcode/quick/manual/today | P2 | done 2026-07-27
- [x] ui-041 | **Settings cards pass 2:** section eyebrows + title hierarchy on all settings cards | P2 | done 2026-07-27
- [x] ui-042 | **Log sub-tabs icons:** Scan/Type/History/Recipes tab labels with subtle icons | P3 | done 2026-07-27
- [x] ui-043 | **Agent empty state:** Gemini greeting chips when no messages (category grid polish) | P2 | done 2026-07-27 — icon + description cards

---

## DESIGN_DECISIONS

| ID | Question | Status |
|----|----------|--------|
| dd-001 | Swipe undo: toast vs bottom sheet? | resolved — toast (5s) |
| dd-003 | Skip-to-content vs landmarks only? | resolved — skip link exists; focus ring enhanced ui-008 |
| dd-004 | VoiceStatusOrb: iframe postMessage vs polling? | open — feed relay; pairs ROADMAP #1 |

---

## BRAINSTORM_LOG (newest first)

### 2026-07-27 — Session #18 (PO tick 370210-004)

**UX lens:** ui-016 done; **ui-017** (Gemini chat shell) is top P1 — full-bleed bubbles + pill composer before ui-019 global theme. ui-018 Translate viewfinder pairs Log scan tab.

**PO lens:** ROADMAP #2 Recipes tab missing from relay — add **relay-150** (browse/log from Save Reciepe sheet). Keep ui-019 P1 but after ui-017/018 batch.

**Business lens:** Recipes tab = investment loop (saved meals); Gemini shell = daily Coach engagement — both P1, Worker owns relay-150 after relay-147 commit.

---

**UX lens:** ui-016 unchanged (top UX item). ROADMAP VoiceStatusOrb still unmatched in relay — Agent orb should reflect real mic state (Gemini pattern).

**PO lens:** Add **relay-149** → RELAY BACKLOG: VoiceStatusOrb wire to local-voice-ai postMessage (ROADMAP #1). relay-147/148 stay Worker priority; maint-002 closed — strike ROADMAP #4 note in PO sync.

**Business lens:** Real voice state = trust on Coach tab; defer until relay-147 commit lands to avoid queue-badge conflict.

---

**UX lens:** ui-001–015 closed; seed **ui-016** — Agent context panel still bespoke vs Home summary tiles / Apple Health. Unify metric typography (tabular nums, 16px radius cards).

**PO lens:** maint-003 explicitly tagged **Code window**; ui-016 → **UX window**; no new relay features this tick (Worker busy on meal-plan badge).

**Business lens:** Coach tab context strip = trust before chat; aligning with Home rings reduces cognitive load = higher agent engagement.

---

**UX lens:** ui-015 stays in `UI_POLISH_BACKLOG` for **UX window** to ship (Apple Health tile CSS). PO window documents only.

**PO lens:** Published [`LOOPS.md`](LOOPS.md) — Worker / UX / Code / PO; one PID per chat; PO = `AGENT_LOOP_TICK_MAINTENANCE`. maint-003 workbox fix → **Code window** next.

**Business lens:** Split windows reduce merge conflicts; PO backlog quality improves relay ROI for Worker.

---

**UX lens:** ui-015 — `HomeSummaryTiles` shipped without CSS (ui-010 gap); Apple Health flat metric cards with tabular nums + subtle border, not generic `.card`. maint-003 precache trim = exclude lazy pdf/canvas chunks via `globIgnores`.

**PO lens:** Mode C ships ui-015 (quick CSS); Mode A next implements maint-003 workbox change; defer LHCI setup until after precache trim.

**Business lens:** Summary tiles visible polish = daily-open reward; smaller precache = faster first install on mobile data.

---

**UX lens:** maint-003 scoped — vite-plugin-pwa manifest looks complete (maskable icon, standalone, theme_color); likely Lighthouse drag = JS bundle weight (`html2canvas` 199kB, `weekReportPdf` 401kB lazy but still precached). ui-014 seeded — Translate gap = scan history pills below camera for re-review without re-capture.

**PO lens:** UI polish batch done — refill with ui-014 P2 quick win for Mode C; maint-003 baseline run next Mode A (not Mode C); defer code-split fixes to maint-003b after baseline score logged.

**Business lens:** Lighthouse >90 = install trust for daily PWA habit; scan history reduces re-scan friction = faster food logging completion.

---

**UX lens:** ui-011 scoped — Settings still generic `.card` stack; Revolut gaps = flat 20px radius, pill CTAs (Save token, Connect Google, Save to Sheet), tabular-nums on body/target inputs, list-row meal toggles vs stacked labels. Bundle aria-live on save/error into ui-011 (closes maint-002 Settings slice).

**PO lens:** ui-011 is sole open UI item — ship Mode C next; maint-003 Lighthouse after ui-011; no new ui-014 until polish batch committed. UX relay loop down — maintenance track unaffected.

**Business lens:** Settings = trust surface for Sheets sync; Revolut-tier polish signals production-ready health app; aria-live on save reinforces reliability for sensitive body/target data.

---

**UX lens:** ui-013 = Keep-style colored dot before label on card chips + filter tabs (not just chip bg).

**PO lens:** ui-013 quick P2 win; ui-011 Settings after; maint-003 Lighthouse when polish batch done.

**Business lens:** Label dots aid scanability for health notes investment.

---

### 2026-07-27 — Session #10 (Mode B tick 489199-004)

**UX lens:** ui-012 scoped to enhance existing decision card (not new route) — Hinge-style prompt question above title, rose accent border.

**PO lens:** ui-012 P1 after ui-010; ui-011 Settings deferred; ui-013 Keep dots quick win after ui-012.

**Business lens:** Prompt framing increases accept rate on future-self card = investment loop.

---

### 2026-07-27 — Session #9 (Mode B tick 489199-001)

**UX lens:** ui-010 refined — 2–3 tiles max (avoid clutter); reuse MacroChart/sparkline data already on Home.

**PO lens:** ui-010 P1 unchanged; ui-012 Hinge prompts next after ui-010; maint-003 Lighthouse after ui-010–012 batch.

**Business lens:** Summary tiles = variable reward on daily open; pairs rings hero.

---

### 2026-07-27 — Session #8 (Mode B — UX relay tick #1)

**UX lens** (`ux-heuristics`, `plan-design-review`, web research: Apple Health, Revolut, Hinge)

| Item | Action | Notes |
|------|--------|-------|
| ui-009 | keep → ship | `--muted` bump; banner/chip/ring label fixes |
| Apple Health | add ui-010 | Summary widget cards + trends row below rings |
| Revolut | add ui-011 | Settings flat 20px cards + pill CTAs |
| Hinge | add ui-012 | Future Self prompt Q&A cards |
| Keep | add ui-013 | Label color dots on Cards chips |

**PO lens** (`define-opportunity-tree`, `agile-product-owner`)

| Item | Action | Notes |
|------|--------|-------|
| ui-010 | keep P1 | Home daily open — Health Summary highest ROI |
| ui-012 | keep P1 | Pairs ui-006 hero with Hinge prompts |
| ui-011 | keep P2 | Settings lower traffic |
| 5m loop | keep | Per user UX relay request |

**Business lens** (`jobs-to-be-done`, `hooked-ux`, `saas-metrics-coach`)

| Item | Action | Notes |
|------|--------|-------|
| Health widgets | keep ui-010 | Trend sparklines = variable reward on open |
| Hinge prompts | keep ui-012 | User-authored future = investment loop |
| Revolut polish | refine ui-011 | Premium feel = trust for health data |

---

### 2026-07-27 — Session #7 (Mode B monitored tick #8)

**UX lens** (`ux-heuristics`, `plan-design-review`)

| Item | Action | Notes |
|------|--------|-------|
| ui-009 contrast | refine → P1 | Target: `.muted`, `.banner-warn`, `.keep-chip`, inactive `.tab` on dark surface |
| ui-008 | keep done | Focus rings shipped |
| maint-002 | keep | Closes after ui-009 |
| SCAN_COVERAGE | keep done | Full cycle complete — rotate sections on next Mode A |

**PO lens** (`define-opportunity-tree`, `agile-product-owner`)

| Item | Action | Notes |
|------|--------|-------|
| maint-003 Lighthouse | keep next | After maint-002 closes |
| uncommitted batch | note | ui-001–008 + maint-001 ready for commit |
| relay meal-plan sync | keep | Parallel track; no maintenance conflict |

**Business lens** (`jobs-to-be-done`, `hooked-ux`, `saas-metrics-coach`)

| Item | Action | Notes |
|------|--------|-------|
| a11y → trust | keep | Contrast + focus = production-ready signal |
| Core job | keep | Quality loop now protects shipped polish |

---

### 2026-07-27 — Session #6 (Mode B monitored tick #5)

**UX lens** (`ux-heuristics`, `plan-design-review`)

| Item | Action | Notes |
|------|--------|-------|
| ui-001–007 | keep done | Full inspiration matrix shipped |
| maint-002 a11y | split → ui-008, ui-009 | Focus/keyboard first; contrast second |
| UX backlog | keep empty | All ux-001–006 closed |
| dd-003 | add | Skip-to-content link vs landmark-only? → skip link in ui-008 |

**PO lens** (`define-opportunity-tree`, `agile-product-owner`)

| Item | Action | Notes |
|------|--------|-------|
| ROADMAP #1 VoiceStatusOrb | keep relay | Not maintenance Mode C |
| ROADMAP #4 a11y | merge maint-002 | Now ui-008/009 with acceptance criteria |
| uncommitted batch | note | ui-001–007 + maint-001 — single commit when user asks |
| maint-003 Lighthouse | keep P2 | After maint-002 slices |

**Business lens** (`jobs-to-be-done`, `hooked-ux`, `saas-metrics-coach`)

| Item | Action | Notes |
|------|--------|-------|
| Polish → quality shift | keep | Feature parity done; retention = reliability + a11y |
| Core job | keep | Spreadsheet friction still the north star |
| Hook | keep done | Future-self + scan overlay complete daily loop |

---

### 2026-07-27 — Session #5 (Mode B monitored tick #2)

**UX lens** (`ux-heuristics`, `plan-design-review`)

| Item | Action | Notes |
|------|--------|-------|
| ui-001–006 | keep done | Inspiration matrix gaps closed except scan |
| ui-007 / ux-006 | keep → P1 | Last major inspiration gap (Translate overlay) |
| maint-002 a11y | keep next quality | Card animations + FAB need focus audit |
| decision-card arc | refine | ui-006 hero good; add aria-label on accept for screen readers in Mode C pass |

**PO lens** (`define-opportunity-tree`, `agile-product-owner`)

| Item | Action | Notes |
|------|--------|-------|
| relay-095 haptic | keep | Relay track; maintenance defers |
| relay-096 aria-live | merge → maint-002 | Queue empty hint fits a11y audit scope |
| uncommitted batch | note | ui-001–006 + maint-001 ready for commit when user asks |

**Business lens** (`jobs-to-be-done`, `hooked-ux`, `saas-metrics-coach`)

| Item | Action | Notes |
|------|--------|-------|
| Scan overlay | keep ui-007 | Reduces sheet friction = core job completion |
| Future-self hero | keep done | ux-001 closed — daily open hook strengthened |
| Retention | refine | Track decision card accept rate alongside rings/food |

---

### 2026-07-27 — Session #4 (Mode B tick #8)

**UX lens** (`ux-heuristics`, `plan-design-review`)

| Item | Action | Notes |
|------|--------|-------|
| ui-001–005 | keep done | Full-tab polish sprint complete; all inspiration rows touched |
| ux-001 future-self | add ui-006 | `Home.tsx` has image_url path but weak default — need visual hero when no image |
| ux-006 scan overlay | add ui-007 | Translate pattern; defer until ui-006 |
| maint-001 | keep done | Confirm dismiss shipped tick #7 |
| maint-002 a11y | keep P1 quality | Next after ui-006 — polish sprint exposed animation/hover gaps |

**PO lens** (`define-opportunity-tree`, `agile-product-owner`)

| Item | Action | Notes |
|------|--------|-------|
| relay-074–076 | keep | Relay meal-plan queue track; no maintenance conflict |
| UI_POLISH_BACKLOG | refill | ui-006 + ui-007 seeded; backlog was empty |
| uncommitted batch | note | ui-001–005 + maint-001 ready for single commit when user asks |
| maint-003 Lighthouse | keep P2 | Run after maint-002 |

**Business lens** (`jobs-to-be-done`, `hooked-ux`, `saas-metrics-coach`)

| Item | Action | Notes |
|------|--------|-------|
| ux-001 / ui-006 | keep highest | Daily open trigger — emotional future-self beats rings-only |
| Hook investment | keep | Cards + meal plan queue = sunk-cost retention |
| DAU metric | keep | Add decision card accepted to signal |

---

### 2026-07-27 — Session #3 (Mode B tick #5)

**UX lens** (`ux-heuristics`, `plan-design-review`)

| Item | Action | Notes |
|------|--------|-------|
| ui-001–004 | keep done | Home/Log/Agent/Day polish sprint complete; uncommitted |
| ux-005 Cards | refine | Search + type filters already in `Cards.tsx`; gap is pin elevation, masonry density, FAB thumb reach |
| ui-005 | keep → P1 | Only tab untouched by polish sprint; bundle label chip styling |
| ux-001 Home future-self | keep P0 UX | Still text-only vs inspiration matrix |
| ux-006 scan overlay | keep | Translate pattern still missing |
| dd-002 week view | resolve | Week strip sufficient for v1 |

**PO lens** (`define-opportunity-tree`, `agile-product-owner`)

| Item | Action | Notes |
|------|--------|-------|
| relay-062 Plan offline banner | keep | Relay track; no conflict with ui-005 |
| relay-063 sync progress | keep | Pairs Day meal-plan undo work |
| relay-064 Log queue badge | keep | Complements relay-061 Home/Day badges |
| maint-001 food queue dismiss | keep P2 | Error-prevention heuristic |
| ui-005 | keep next | Mode C ships before next relay feature |

**Business lens** (`jobs-to-be-done`, `hooked-ux`, `saas-metrics-coach`)

| Item | Action | Notes |
|------|--------|-------|
| ux-001 future-self visual | keep high | Daily open trigger — rings alone insufficient emotional hook |
| Cards quick capture | refine ui-005 | Investment loop: health notes compound over time |
| Meal plan offline queue | keep relay-062+ | Reduces spreadsheet fallback = core job retention |
| DAU metric | keep | rings viewed OR food logged OR card created |

---

### 2026-07-27 — Session #2 (Mode B tick #2)

**UX lens:** ui-001–003 shipped; mark ux-003 done. Next: ui-004 Day (Calendar density) before ui-005 Cards.

**PO lens:** relay-050 refined — online swipe undo shipped (ui-002); relay-050 scope = offline queue undo only. relay-049 keep (meal plan widget).

**Business lens:** Day + Home meal plan surfaces should share visual language — bundle ui-004 with relay-049 acceptance criteria.

---

### 2026-07-27 — Session #1 (Mode B initial)

**UX lens** (`ux-heuristics`, `plan-design-review`)

| Item | Action | Notes |
|------|--------|-------|
| relay-040 haptic | keep | Shipped — hot tier pulse |
| relay-041 keyboard hints | refine → relay-041 | Coach mark on first Log visit, not static hint |
| relay-042 habit queue dismiss | keep | Valid maintenance |
| Home decision card | add ux-001 | Weak emotional pull vs future-self apps |
| Log swipe | add ux-002, ui-002 | No undo; flat stack |
| Agent chat | add ux-003, ui-003 | Action feed good; layout not Gemini-tier |
| Day planner | add ux-004, ui-004 | Single day only |
| Cards | add ux-005, ui-005 | No search/labels |
| Scan flow | add ux-006 | No inline overlay |

**PO lens** (`define-opportunity-tree`, `agile-product-owner`)

| Item | Action | Notes |
|------|--------|-------|
| ROADMAP recipes tab | add → RELAY relay-043 | Browse/log saved recipes |
| ROADMAP VoiceStatusOrb | add → RELAY relay-044 | Real mic state from iframe |
| ROADMAP meal plan quick-add | add → RELAY relay-045 | WEEK MEALS sheet |
| Accessibility audit | add maint-002 | Concrete WCAG pass |
| Optimistic UI retry | merge | Already partially shipped; close ROADMAP item |

**Business lens** (`jobs-to-be-done`, `hooked-ux`, `saas-metrics-coach`)

| Item | Action | Notes |
|------|--------|-------|
| Core job | keep | "Log health without spreadsheet friction" |
| Hook trigger | add ux-001 priority | Rings + decision = daily open trigger |
| Investment | refine relay-042 | Queue dismiss = sunk-cost clarity |
| Retention metric | add | DAU = rings viewed OR food logged |
| Meal notifications | add → RELAY relay-046 | Hook external trigger |

---

## SCAN_COVERAGE

| Area | Last scanned | Bugs found |
|------|--------------|------------|
| `pwa/src/sections/*` | 2026-07-27 tick-489199-012 | 0 |
| `pwa/src/hooks/*` + `pwa/src/lib/*` | 2026-07-27 tick-489199-003 | 0 |
| `pwa/src/components/*` | 2026-07-27 tick-489199-006 | 0 |
| `server/habits_api/routes/*` | 2026-07-27 tick-489199-009 | 0 |
| `server/habits_api/*/service.py` | 2026-07-27 tick-mon-007 | 0 |

---

## HISTORY

| Timestamp | Mode | Item | Outcome | Verified | Commit |
|-----------|------|------|---------|----------|--------|
| 2026-07-27 | C | ui-016–018 | Gemini theme + Health tiles + Translate scan | build | pending |
| 2026-07-27 | A | ux-relay-loop-001 | build + components scan | build | — |
| 2026-07-27 | PO | tick-370210-004 | relay-150 Recipes + ui-017 priority | brainstorm | — |
| 2026-07-27 | PO | tick-370210-003 | relay-149 VoiceStatusOrb + dd-004 | brainstorm | — |
| 2026-07-27 | PO | tick-370210-002 | ui-016 seed + maint-003 → Code | brainstorm | — |
| 2026-07-27 | B | tick-370210-001 | maint-003 precache AC + ui-015 | brainstorm | — |
| 2026-07-27 | C | ui-014 | scan history pills | build | pending |
| 2026-07-27 | B | tick-489199-013 | maint-003 AC + ui-014 seed | brainstorm | — |
| 2026-07-27 | A | tick-489199-012 | build green + sections re-scan | build | — |
| 2026-07-27 | C | ui-011 | Settings Revolut polish | build | pending |
| 2026-07-27 | B | tick-489199-010 | ui-011 scope + maint-002 close path | brainstorm | — |
| 2026-07-27 | A | tick-489199-009 | routes re-scan | build | — |
| 2026-07-27 | C | ui-013 | Keep label dots | build | pending |
| 2026-07-27 | B | tick-489199-007 | ui-013 scope | brainstorm | — |
| 2026-07-27 | A | tick-489199-006 | components scan | build | — |
| 2026-07-27 | C | ui-012 | Hinge decision card | build | pending |
| 2026-07-27 | B | tick-489199-004 | ui-012 scope | brainstorm | — |
| 2026-07-27 | A | tick-489199-003 | hooks/lib scan | build | — |
| 2026-07-27 | C | ui-010 | Home summary tiles | build | pending |
| 2026-07-27 | B | tick-489199-001 | ui-010 AC refine | brainstorm | — |
| 2026-07-27 | A | tick-489197-001 | sections re-scan | build | — |
| 2026-07-27 | C | ui-009 | contrast tokens + chips + banners | build | pending |
| 2026-07-27 | B | ux-relay-001 | 3-lens + ui-010–013 seeded | brainstorm | — |
| 2026-07-27 | setup | ux-relay-loop | 5m loop + UX_RELAY_AGENT.md | docs | — |
| 2026-07-27 | B | tick-mon-008 | ui-009 scope + scan cycle done | brainstorm | — |
| 2026-07-27 | A | tick-mon-007 | build + service.py scan | build | — |
| 2026-07-27 | C | ui-008 | focus rings + keyboard hints | build | pending |
| 2026-07-27 | B | tick-mon-005 | seed ui-008/009 a11y | brainstorm | — |
| 2026-07-27 | A | tick-mon-004 | server routes scan + scan retake a11y | build | pending |
| 2026-07-27 | C | ui-007 | scan inline overlay | build | pending |
| 2026-07-27 | B | tick-mon-002 | post-ui-006 refine | brainstorm | — |
| 2026-07-27 | A | tick-mon-001 | build + components scan | build | — |
| 2026-07-27 | C | ui-006 | future-self visual hero | build | pending |
| 2026-07-27 | B | tick-008 | polish sprint close + ui-006 seed | brainstorm | — |
| 2026-07-27 | A | maint-001 | confirm dismiss food queue | build | pending |
| 2026-07-27 | A | tick-007 | hooks/lib scan | build | — |
| 2026-07-27 | C | ui-005 | done | build | pending |
| 2026-07-27 | B | tick-005 | 3-lens Cards audit | brainstorm | — |
| 2026-07-27 | A | tick-004 | build pass, sections scan | build | pending |
| 2026-07-27 | C | ui-004 | done | build | pending |
| 2026-07-27 | C | ui-002 | done | build | pending |
| 2026-07-27 | C | ui-001 | done | build | pending |
| 2026-07-27 | B | setup-001 | done | docs | — |
| 2026-07-27 | B | brainstorm-001 | done | 3 lenses | — |

---

## Mode rotation

`A` (bug) → `B` (brainstorm) → `C` (UI polish) → `A` …

## Mode rotation (legacy — use four windows instead)

PO / UX / Code / Worker each own their work — see [`LOOPS.md`](LOOPS.md). Do not use A→B→C rotation in a single chat.
