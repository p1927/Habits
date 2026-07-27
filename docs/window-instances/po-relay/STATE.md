# STATE — po-relay

> **po-relay window only.** UX ships from [`ux-relay/STATE.md`](../ux-relay/STATE.md).

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T23:05:00Z |
| where_we_are | Session #25 — relay-192 shipped; UX ui-056/ui-057 closed; Worker relay-193 last open item |
| confirmed_next | Worker relay-193 then relay-194–196; Code ch-127; maint-004 |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | `2026-07-27T21:05:00Z` |
| current_item_id | `po-tick-007` |
| phase | `9-arm` |
| review_status | `triaged` |
| review_skip_reason | `v0.6.0 steady state — Phase 5 re-detects via prepare_review_tick.sh` |
| review_round | `9` |
| last_reviewed_round | `9` |
| review_diff_range | `uncommitted` |
| code_changed | `yes` |
| confirmed_next | `Worker relay-193; relay-194–196 fed; Code ch-127; maint-004` |
| loops | `arm at end of turn` |
| worktree_status | `none` |
| worktree_path | `—` |
| worktree_branch | `—` |
| worktree_item_id | `—` |
| review_changed_files | `docs/window-instances/po-relay/STATE.md` |
| review_fingerprint | `e2e702f4e8ee2fa3` |
| ritual_step | `9-arm` |
| brainstorm_done | `yes` |
| brainstorm_outcome | `Session #25: prop-ui-042/043 closed; relay-194-196 fed; Worker relay-193 next` |
| execute_started | `yes` |
| fix_verify_done | `yes` |
| reflect_done | `yes` |
| commit_hash | `—` |
| receive_review_done | `yes` |

### Loop status (verify with `loop-status.sh`)

| Window | loop_id | Wake sentinel | Status |
|--------|---------|---------------|--------|
| Worker | `worker-relay` | `AGENT_LOOP_WAKE_HABITS` | dynamic — Worker chat |
| UX | `ux-relay` | `AGENT_LOOP_WAKE_UX_RELAY` | dynamic — UX chat |
| Code | `code-health` | `AGENT_LOOP_WAKE_CODE_HEALTH` | dynamic — Code chat |
| PO | `po-relay` | `AGENT_LOOP_WAKE_PO_RELAY` | dynamic — **this chat** |

## IN_PROGRESS

*(empty)*

---

## BUG_BACKLOG

*(empty — first scan in Mode A)*

---

## QUALITY_BACKLOG

- [x] maint-001 | Confirm before dismiss food queue | from RELAY BRAINSTORM | `Log.tsx` — done tick #7
- [x] maint-002 | Accessibility audit ARIA/focus/contrast | ROADMAP | ui-008/009/011 done — Settings aria-live shipped
- [ ] maint-003 | Lighthouse PWA score > 90 | ROADMAP | relay-160 hit **97/100/100**; **Code window:** re-run Lighthouse after ch-123 api split |
- [ ] maint-004 | Remove unused legacy CSS (`.card`, `.card-placeholder`, `.btn-decline`) | ux-gap-040 | **Code window:** `.card-placeholder`/`.btn-decline` still in `App.css` L201/L838 — delete dead rules |

---

## UX_BACKLOG

- [x] ux-001 | Home decision card — aspirational future-self visual (not text-only) | Future viz | done ui-006
- [x] ux-002 | Log swipe undo within 5s after commit | Tinder | done ui-002
- [x] ux-003 | Agent streaming indicator + tool chips above input | Gemini | done ui-003
- [x] ux-004 | Day week strip + color-coded blocks | Calendar | done ui-004
- [x] ux-005 | Cards label chips + masonry density | Keep | done ui-005
- [x] ux-006 | Scan inline result overlay before sheet write | Translate | done ui-007

---

## DESIGN_DECISIONS

| ID | Question | Status |
|----|----------|--------|
| dd-001 | Swipe undo: toast vs bottom sheet? | resolved — toast (5s) |
| dd-003 | Skip-to-content vs landmarks only? | resolved — skip link exists; focus ring enhanced ui-008 |
| dd-004 | VoiceStatusOrb: iframe postMessage vs polling? | resolved — relay-149 shipped; E2E mic parity optional follow-up |

---

## UI_PROPOSALS (PO → UX handshake)

> **PO proposes here.** UX triages on every UX tick. Do **not** write directly to `ux-relay/STATE.md` `UI_POLISH_BACKLOG` — only `agreed` items move there.

| id | status | origin | surface | proposal | acceptance criteria | ux_response |
|----|--------|--------|---------|----------|---------------------|-------------|
| prop-ui-038 | refined | po | Agent | Token-by-token streaming assistant bubble | Backend live; UX ui-038 verified | Verified done ui-038 2026-07-27 |
| prop-ui-039 | refined | po | Home → Log | Saved recipe “See full recipe” deep link | Shipped relay-150 + ui-053 — `navigateLogRecipes` + refresh on open | Shipped ui-053 + relay-150 |
| prop-ui-040 | refined | po | Log History | CSV export header action UX | Shipped relay-172 — Export CSV pill + `downloadLogHistoryCsv` | Shipped relay-172 |
| prop-ui-041 | refined | po | Day | Calendar event detail sheet polish | Shipped relay-173 + ui-055 — Revolut card + time pill + Close CTA | Shipped ui-055 2026-07-27 |
| prop-ui-042 | refined | po | App shell | Tab bar keyboard shortcut discoverability | relay-187 + ui-057 shipped — dismissible hint + conditional aria-keyshortcuts | Shipped ui-057 2026-07-27 |
| prop-ui-043 | refined | po | Home → Day | Pull-refresh ring + Day empty Revolut panel | ui-056 shipped — Apple Health ring + Revolut empty schedule panel | Shipped ui-056 2026-07-27 |
| prop-ui-044 | proposed | po | Settings | Google OAuth card Revolut pass + aria-live | Given Settings OAuth card, When user connects/disconnects, Then Revolut card styling + aria-live status (ux-gap-045) | — |

**Status values:** `proposed` → UX reviews | `agreed` → copied to UX_STATE `UI_POLISH_BACKLOG` | `refined` → UX sent AC changes, PO updates row | `rejected` → dropped with reason in `ux_response`

**PO tick:** add/refine rows; never set `agreed` (UX owns triage).

**UX tick:** read this table first; for each `proposed`/`refined`, set status + `ux_response`; on `agreed`, append matching `ui-*` line to [`ux-relay/STATE.md`](../ux-relay/STATE.md).

---

## BRAINSTORM_LOG (newest first)

### 2026-07-27 — Session #25 (PO tick po-tick-007)

**UX lens (ux-heuristics):** prop-ui-042/043 **closed** — ui-057 tab shortcuts + ui-056 pull-refresh ring shipped (62120c6). UX backlog **idle**. ux-gap-042 (prop-ui-041) PO-ack closed. **maint-004 still open** — `.card-placeholder`/`.btn-decline` remain in App.css despite ux-gap-040 shipped note.

**PO lens (define-prioritization-framework):** Session #24 handoffs **closed** (relay-192). Worker **relay-193** last open item (Log food edit Escape). Queue depletion risk — fed **relay-194** (Agent attach sheet Escape) > **relay-195** (Agent camera sheet Escape) > **relay-196** (Agent voice sheet Escape). Code ch-126 done → ch-127 line scan.

**Business lens (jobs-to-be-done):** BottomSheet Escape batch completes keyboard affordance loop for power users. Empty Worker queue = delivery stall — refill before relay-193 ships. Dead CSS = Code maintainability debt (maint-004).

---

### 2026-07-27 — Session #24 (PO tick po-tick-006)

**UX lens (ux-heuristics):** prop-ui-042 **refined closed** — relay-187 shipped tab shortcuts; UX ui-057 owns dismissible hint + conditional `aria-keyshortcuts`. **prop-ui-043 proposed** — Home pull-refresh ring + Day empty Revolut panel (ux-gap-043 / ui-056 reopened). Escape-to-close sheet batch (relay-189–192) = consistent BottomSheet pattern — Worker-owned, no new prop-ui.

**PO lens (define-prioritization-framework):** Session #23 handoffs **closed** (relay-187–191). RICE open Worker: **relay-192** (Cards create sheet Escape) > **relay-193** (Log food edit Escape). UX formalize prop-ui-043 for ui-056; ui-057 finish in UX worktree.

**Business lens (jobs-to-be-done):** Keyboard/Escape polish = investment for repeat users (Hook investment phase). OAuth aria-live (relay-190) = trust on Sheets connect. Dead CSS (maint-004) = Code debt blocking clean maintainability story.

---

### 2026-07-27 — Session #23 (PO tick po-tick-005)

**UX lens (ux-heuristics):** prop-ui-041 **closed** — ui-055 Day event sheet shipped. **prop-ui-042 proposed** — tab-bar ⌘1–5 hint parity with Log/Day/Cards first-visit patterns (relay-182–186). maint-004 **still open** — dead CSS not fully removed despite ux-gap-040 note.

**PO lens (define-prioritization-framework):** Session #22 handoffs **closed** (relay-174–186). RICE open Worker: **relay-187** (tab shortcuts, high power-user reach) > **relay-188** (OAuth banner dismiss) > **relay-189** (share sheet Escape). UX backlog idle — feed prop-ui-042 for relay-187 polish.

**Business lens (jobs-to-be-done):** Empty Day→Agent + pull-to-refresh = daily dashboard habit loop now shipped. Keyboard shortcuts = investment for repeat users (reduce tap friction vs Sheets manual nav). OAuth auto-dismiss = trust/onboarding hygiene.

---

### 2026-07-27 — Session #22 (PO tick po-tick-004)

**UX lens (ux-heuristics):** prop-ui-040 **closed** — relay-172 CSV export shipped. **prop-ui-041 proposed** — `DayCalendarEventSheet` needs Revolut bottom-sheet parity vs Google Calendar event popup. ux-gap-040 = Code cleanup (dead CSS), not UX polish.

**PO lens (define-prioritization-framework):** Session #21 handoffs **closed** (relay-171–173). RICE open: **relay-174** (empty Day → Agent prompt, high engagement) > **relay-176** (pull-to-refresh Home) > **relay-175** (CSV meal count polish). Worker backlog healthy at 3.

**Business lens (jobs-to-be-done):** Empty Day → Agent prompt = trigger for scheduling job. Pull-to-refresh = investment in daily dashboard habit. Dead CSS removal = Code maintainability (maint-004).

---

**UX lens (ux-heuristics):** prop-ui-039 **closed** — ui-053 + relay-150 shipped “See full recipe” deep link. **prop-ui-040 proposed** — relay-172 CSV export needs visible header affordance (Sheets/Revolut export pattern). relay-173 Day event detail = Google Calendar event popup on timeline tap.

**PO lens (define-prioritization-framework):** Session #20 handoffs **all closed** (relay-149–170, ui-053). RICE open Worker: **relay-172** (CSV portability, high job relevance) > **relay-173** (Day scheduling depth) > **relay-171** (Agent context stale-after-tool polish). dd-004 **resolved** via relay-149.

**Business lens (jobs-to-be-done):** CSV export = “own your data” vs Sheets lock-in. Day event sheet = calendar trust for habit scheduling. Agent context refresh = Coach credibility after tool calls.

---

**UX lens (ux-heuristics):** prop-ui-038 **closed** — UX verified ui-038 streaming bubble. prop-ui-039 **refined** — Home saved recipe card lacks secondary navigation affordance (recognition over recall vs Log Recipes tab). Day `Week PDF` header button matches Calendar export pattern (390px pill in header row).

**PO lens (define-prioritization-framework):** RICE open Worker items: **relay-150** (reach×impact, not shipped) > **relay-169** (Day PDF WIP uncommitted — finish+commit) > **relay-149** (Agent mic parity E2E). **relay-170 verified shipped** in HEAD (`ringShareCard` streak pill + `useHomeDashboardActions`) — Worker should close. dd-004 stays verify pending relay-149.

**Business lens (jobs-to-be-done):** Saved-recipe deep link = “log without spreadsheet” investment loop. Streak on share card = social proof variable reward (Hook). Day PDF export = weekly reflection habit for retention.

---

### 2026-07-27 — Session #19 (PO tick po-tick-001)

**UX lens:** ui-038 **unblocked** — relay-165/168 shipped SSE + abort; `AgentChatPanel` renders token cursor. UX window: verify 390px bubble reflow vs Gemini. **prop-ui-039** seeds Home→Log Recipes deep link (recognition over recall for saved meals).

**PO lens:** Worker backlog refilled — **relay-149** (VoiceStatusOrb E2E mic parity), **relay-150** (Recipes tab deep link from Home). RICE top open: relay-169 (Day PDF) > relay-170 (rings share streak) > relay-150 > relay-149. **dd-004** → verify (postMessage path exists).

**Business lens:** Streaming Coach replies = variable reward on Agent tab (Hook loop). Saved-recipe deep link reduces friction vs manual Log navigation — supports “log without spreadsheet” job.

---

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

**PO lens:** Published [`START_LOOPS.md`](../../START_LOOPS.md) — Worker / UX / Code / PO; one PID per chat; PO = `AGENT_LOOP_TICK_PO_RELAY`. maint-003 workbox fix → **Code window** next.

**Business lens:** Split windows reduce merge conflicts; PO backlog quality improves relay ROI for Worker.

---

*(Older sessions preserved — see git history of STATE.md before split)*

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

## REVIEW_FINDINGS

| id | severity | finding | source | action | backlog_ref | status |
|----|----------|---------|--------|--------|-------------|--------|
| pr-001 | low | relay-165/168 shipped SSE streaming + cancel; ui-038 backend done | round-0 /code-review | closed | ui-038 | closed |
| pr-002 | low | relay-149/150 brainstormed in #18 but missing from Worker BACKLOG | round-0 /code-review | closed | worker BACKLOG | closed |
| pr-003 | low | Code window ch-006–120 structural refactors uncommitted | round-0 /code-review | backlog | ch-121+ | open |
| pr-r1-001 | low | Shipped relay-163–168 on main; Worker next relay-169/170 | round-1 /code-review | closed | — | closed |
| pr-r1-002 | low | prop-ui-038 refined (backend live); prop-ui-039 new Home deep link | round-1 /code-review | closed | prop-ui-039 | closed |
| pr-r1-003 | low | relay-170 may overlap existing ringShareCard streak pill — confirm delta | round-1 /code-review | closed | relay-170 | closed |
| pr-r1-004 | low | maint-003 near done (Lighthouse 97); Code ch-batch uncommitted | round-1 /code-review | backlog | maint-003 | open |
| pr-r2-001 | low | relay-170 shipped — streak pill in `ringShareCard` + Home share | round-2 /code-review | closed | relay-170 | closed |
| pr-r2-002 | low | relay-169 Day Week PDF wired in uncommitted WIP (`DaySectionHeader`, `weekReportExport`) | round-2 /code-review | closed | relay-169 | closed |
| pr-r2-003 | low | prop-ui-038 closed — UX ui-038 verified | round-2 /code-review | closed | prop-ui-038 | closed |
| pr-r2-004 | low | prop-ui-039 refined AC; ux-gap-039 po-agreed | round-2 /code-review | closed | relay-150 | closed |
| pr-r2-005 | low | Code ch-119/120 landed in WIP; maint-003 Lighthouse re-run still Code-owned | round-2 /code-review | backlog | maint-003 | open |
| pr-r3-001 | low | relay-149–170 + ui-053 shipped since Session #20 | round-3 /code-review | closed | — | closed |
| pr-r3-002 | low | Worker backlog refilled relay-171–173; RICE top relay-172 | round-3 /code-review | closed | relay-172 | closed |
| pr-r3-003 | low | prop-ui-040 proposed for relay-172 CSV export UX | round-3 /code-review | closed | prop-ui-040 | closed |
| pr-r3-004 | low | Code ch-batch still uncommitted; maint-003 Lighthouse re-run pending | round-3 /code-review | backlog | maint-003 | open |
| pr-r4-000 | low | Uncommitted code-health WIP reviewed; no new PO blockers | round-4 /code-review | closed | — | closed |
| pr-r5-001 | low | relay-171–173 shipped (context refresh, CSV export, event sheet) | round-5 /code-review | closed | — | closed |
| pr-r5-002 | low | prop-ui-040 closed; prop-ui-041 proposed for Day event sheet UX | round-5 /code-review | closed | prop-ui-041 | closed |
| pr-r5-003 | low | ux-gap-040 routed to Code maint-004 (dead CSS) | round-5 /code-review | backlog | maint-004 | open |
| pr-r5-004 | low | Code ch-122 done; ch-123 api.ts split in progress | round-5 /code-review | backlog | maint-003 | open |
| pr-r6-001 | low | Round 6: STATE Session #22 refresh — relay-174–176 Worker next; prop-ui-041 UX proposal | round-6 /code-review | closed | relay-174 | closed |
| pr-r6-002 | low | cursor-loop v0.5.4 window-scoped review paths — PO scope docs-only; product review still main...HEAD on app code | round-6 /code-review | closed | — | closed |
| pr-r6-003 | low | maint-003 Lighthouse + maint-004 dead CSS remain Code-owned open items from pr-r5 | round-6 /code-review | backlog | maint-003 | open |
| pr-r7-001 | low | relay-174–186 shipped since Session #22; Worker next relay-187 | round-7 /code-review | closed | relay-187 | closed |
| pr-r7-002 | low | prop-ui-041 closed via ui-055; prop-ui-042 proposed tab shortcut hint | round-7 /code-review | closed | prop-ui-042 | closed |
| pr-r7-003 | low | maint-004 dead CSS still in App.css — Code must finish delete | round-7 /code-review | backlog | maint-004 | open |
| pr-r7-004 | low | ch-123 api split done; ch-124 queued; maint-003 Lighthouse re-run Code-owned | round-7 /code-review | backlog | maint-003 | open |
| pr-r8-001 | low | docs/window-instances/po-relay/STATE.md — relay-187–191 shipped since Session #23; Worker next relay-192 | round-8 /code-review | closed | relay-192 | closed |
| pr-r8-002 | low | docs/window-instances/po-relay/STATE.md — prop-ui-042 refined (relay-187 done); prop-ui-043 proposed for ui-056 pull-refresh | round-8 /code-review | closed | prop-ui-043 | closed |
| pr-r8-003 | low | docs/window-instances/po-relay/STATE.md — ux-gap-042/044 PO sync; ui-057 UX owns tab hint polish | round-8 /code-review | closed | ui-057 | closed |
| pr-r8-004 | low | pwa/src/App.css:201 — maint-004 dead `.card-placeholder`/`.btn-decline` still present | round-8 /code-review | backlog | maint-004 | open |
| pr-r8-005 | low | docs/window-instances/code-health/STATE.md — ch-126 queued; maint-003 Lighthouse re-run Code-owned | round-8 /code-review | backlog | maint-003 | open |
| pr-r9-000 | low | Bugbot: no issues in PO STATE.md doc diff | round-9 bugbot | closed | — | closed |
| pr-r9-001 | low | docs/window-instances/po-relay/STATE.md — Session #25 aligned; relay-192 closed; relay-194–196 fed | round-9 /code-review | closed | relay-194 | closed |
| pr-r9-002 | low | docs/window-instances/po-relay/STATE.md — prop-ui-044 proposed for ux-gap-045 Settings OAuth | round-9 /code-review | closed | prop-ui-044 | closed |
| pr-r9-003 | low | pwa/src/App.css:201 — maint-004 dead `.card-placeholder`/`.btn-decline` still present | round-9 /code-review | backlog | maint-004 | open |
| pr-r9-004 | low | docs/window-instances/worker-relay/STATE.md — relay-194–196 AC refined with Escape hint pattern | round-9 /code-review | closed | relay-194 | closed |

---

## HISTORY (PO / brainstorm)

| Timestamp | Mode | Item | Outcome | Verified | Commit |
|-----------|------|------|---------|----------|--------|
| 2026-07-27 | PO | po-tick-007 | Session #25 + prop-ui-042/043 close + relay-194–196 feed + Round 9 review | brainstorm | — |
| 2026-07-27 | PO | po-tick-006 | Session #24 + relay-187–191 sync + prop-ui-043 + Round 8 review | brainstorm | — |
| 2026-07-27 | PO | po-tick-005 | Session #23 + relay-174–186 sync + prop-ui-042 | brainstorm | — |
| 2026-07-27 | PO | po-tick-004 | Session #22 + relay-171–173 close + prop-ui-041 | brainstorm | — |
| 2026-07-27 | PO | po-tick-003 | Session #21 + prop-ui-039 close + prop-ui-040 + dd-004 resolved | brainstorm | — |
| 2026-07-27 | PO | po-tick-002 | Session #20 + relay-170 verify + prop-ui-038 close | brainstorm | — |
| 2026-07-27 | PO | po-tick-001 | Session #19 + relay-149/150 feed + ui-038 refined | brainstorm | — |
| 2026-07-27 | PO | tick-370210-003 | relay-149 VoiceStatusOrb + dd-004 | brainstorm | — |
| 2026-07-27 | PO | tick-370210-002 | ui-016 seed + maint-003 → Code | brainstorm | — |
| 2026-07-27 | B | tick-370210-001 | maint-003 precache AC + ui-015 | brainstorm | — |
| 2026-07-27 | B | ux-relay-001 | 3-lens + ui-010–013 seeded | brainstorm | — |
| 2026-07-27 | B | brainstorm-001 | done | 3 lenses | — |

---

## Cross-feed rules

- Feature-sized items → [`worker-relay/STATE.md`](../worker-relay/STATE.md) BACKLOG (Worker executes)
- UI polish items → **`UI_PROPOSALS` first** → UX agrees → [`ux-relay/STATE.md`](../ux-relay/STATE.md) `UI_POLISH_BACKLOG`
- UX-originated gaps → UX writes [`ux-relay/STATE.md`](../ux-relay/STATE.md) `UX_GAPS`; PO promotes to `UI_PROPOSALS` on next PO tick
- Quality/refactor items → tag **Code window** in QUALITY_BACKLOG
- Open conflicts → `DESIGN_DECISIONS` (both windows must check before shipping)
