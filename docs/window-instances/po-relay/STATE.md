# STATE — po-relay

> **po-relay window only.** UX ships from [`ux-relay/STATE.md`](../ux-relay/STATE.md).

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-28T08:58:00Z |
| where_we_are | Session #34 recovery — prop-ui-046 refined status; handoffs unchanged; re-arm |
| confirmed_next | Worker relay-204–207; Code ch-137; maint-004 P1; UX prop-ui-046 triage |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | `2026-07-28T08:58:00Z` |
| current_item_id | `po-tick-016` |
| phase | `9-arm` |
| review_status | `done` |
| review_skip_reason | `—` |
| review_round | `21` |
| last_reviewed_round | `21` |
| review_diff_range | `uncommitted` |
| code_changed | `yes` |
| confirmed_next | `Worker relay-204–207; Code ch-137; maint-004 P1; UX prop-ui-046 triage` |
| loops | `ARMED pid=40106` |
| ritual_step | `9-arm` |
| worktree_status | `none` |
| worktree_path | `—` |
| worktree_branch | `—` |
| worktree_item_id | `—` |
| review_changed_files | `docs/window-instances/po-relay/STATE.md` |
| review_fingerprint | `e2e702f4e8ee2fa3` |
| brainstorm_done | `yes` |
| brainstorm_outcome | `Session #34 — prop-ui-046 status refined; SCAN_COVERAGE sync; Round 21 triaged` |
| execute_started | `yes` |
| fix_verify_done | `yes` |
| reflect_done | `yes` |
| commit_hash | `—` |
| receive_review_done | `yes` |
| design_deliberation_done | `no` |
| design_chosen_approach | `—` |
| design_mitigations | `—` |
| review_tick_applied_at | `2026-07-28T08:58:00+00:00` |

### Loop status (verify with `loop-status.sh`)

| Window | loop_id | Wake sentinel | Status |
|--------|---------|---------------|--------|
| Worker | `worker-relay` | `AGENT_LOOP_WAKE_HABITS` | dynamic — Worker chat |
| UX | `ux-relay` | `AGENT_LOOP_WAKE_UX_RELAY` | dynamic — UX chat |
| Code | `code-health` | `AGENT_LOOP_WAKE_CODE_HEALTH` | dynamic — Code chat |
| PO | `po-relay` | `AGENT_LOOP_WAKE_PO_RELAY` | dynamic — **this chat** |

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
- [ ] maint-003 | Lighthouse PWA score > 90 | ROADMAP | relay-160 hit **97/100/100**; **Code window:** re-run Lighthouse after ch-123 api split |
- [ ] maint-004 | Remove unused legacy CSS (`.card`, `.card-placeholder`, `.btn-decline`) | ux-gap-040 | **P1 Code window:** `.card` L188 + `.card-placeholder`/`.btn-decline` L201/L838 — delete dead rules; UX ux-gap-040 marked shipped prematurely |

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
| prop-ui-044 | refined | po | Settings | OAuth disconnect success + error aria-live | ui-058 shipped — disconnect success banner + role=alert error path | Shipped ui-058 2026-07-27 |
| prop-ui-045 | refined | po | Agent | Empty-state starter chip UX | ui-059 shipped — Gemini wrap pills + dedupe grid; relay-200 owns single-surface polish | Shipped ui-059 2026-07-28 — terminal |
| prop-ui-046 | refined | ux-gap-046 | Agent | Greeting grid Gemini density post-relay-200 | Given empty Agent chat at 390px, When greeting grid visible, Then 2×2 cards use compact Gemini density with visible hover/focus rings and disabled state when offline/scanning; subline matches Gemini Nov2025 | pending UX triage |

**Status values:** `proposed` → UX reviews | `agreed` → copied to UX_STATE `UI_POLISH_BACKLOG` | `refined` → UX sent AC changes, PO updates row | `rejected` → dropped with reason in `ux_response`

**PO tick:** add/refine rows; never set `agreed` (UX owns triage).

**UX tick:** read this table first; for each `proposed`/`refined`, set status + `ux_response`; on `agreed`, append matching `ui-*` line to [`ux-relay/STATE.md`](../ux-relay/STATE.md).

---

## BRAINSTORM_LOG (newest first)

### 2026-07-28 — Session #34 recovery (PO tick po-tick-016)

**UX lens (ux-heuristics):** **prop-ui-046 status → refined** (Given/When/Then AC complete). Worker **relay-204–207** queued unchanged. **maint-004 still open**. SCAN_COVERAGE updated for `pwa/src/components/*`.

**PO lens (define-prioritization-framework):** Recovery re-arm — no new relay features. Handoffs stable: Worker relay-204 next; Code ch-137; UX triage prop-ui-046.

**Business lens (jobs-to-be-done):** Idle backlog maintenance tick — attach-flow batch + greeting density remain top engagement investments.

---

### 2026-07-28 — Session #33 recovery (PO tick po-tick-015)

**UX lens (ux-heuristics):** **prop-ui-046 refined** — Given/When/Then AC for ux-gap-046 Agent greeting grid density. Worker **relay-204 queued** (not in-flight). **maint-004 still open** — dead CSS at App.css L188/L201/L838.

**PO lens (define-prioritization-framework):** Recovery re-arm tick — Session #32 deliverable preserved. RICE unchanged: **relay-204** > **relay-205** > **relay-206** > **relay-207**. Code **ch-137** queued. UX **prop-ui-046** await triage.

**Business lens (jobs-to-be-done):** Attach-flow batch + greeting density = Coach tab first-impression loop. No new relay features this tick — backlog healthy at 4 open Worker items.

---

### 2026-07-28 — Session #32 SPIN recovery (PO tick po-tick-014)

**UX lens (ux-heuristics):** relay-203 **closed** (552a0e0). Worker **relay-204–206** active — disclaimer hide, attach focus return, min-height stability. **ux-gap-046 proposed** — relay-200 2x2 greeting grid needs Gemini Nov2025 density polish (compact cards, disabled/hover at 390px). **maint-004 still open** — dead CSS at App.css L188/L201/L838.

**PO lens (define-prioritization-framework):** SPIN recovery — Session #31 deliverable preserved. **ch-135/136 done** → Code **ch-137** (Settings.tsx split). Promoted **prop-ui-046** from ux-gap-046. RICE Worker: **relay-204** (disclaimer hide) > **relay-205** (focus return) > **relay-206** (min-height) > **relay-207** (food queue tap).

**Business lens (jobs-to-be-done):** Agent attach-flow polish batch = Coach multimodal credibility. Greeting grid density = first-impression engagement on Coach tab (Hook trigger). maint-004 = Code debt — keep P1.

---

### 2026-07-28 — Session #31 (PO tick po-tick-013)

**UX lens (ux-heuristics):** relay-200 **closed** — single greeting surface (ee37839). relay-201 **closed** — dead agent-tool-chips CSS removed (2d5575c). relay-202 **closed** — greeting cards disabled offline/scanning (4fc6ec6). relay-203 **closed** — greeting hides when attach preview open (552a0e0). Worker **relay-204–206** active — Agent attach-flow polish batch (disclaimer hide, focus return, min-height). **maint-004 still open** — legacy `.card`/`.card-placeholder`/`.btn-decline` at App.css L188/L201/L838. UX backlog **idle**.

**PO lens (define-prioritization-framework):** Session #30 handoffs **closed** (relay-200/201). Agent attach-flow batch **relay-204–206** (Worker-owned). Fed **relay-207** (food queue banner tap → focus pending row) — avoids relay-204 ID collision. Code ch-135 **in progress** (AgentActionFeed split). UX idle — no new UI_PROPOSALS.

**Business lens (jobs-to-be-done):** Agent multimodal attach polish = Coach credibility for food logging — relay-203–206 close layout/focus friction. Offline food queue tap-to-review = queue anxiety reduction (investment phase) — relay-207. maint-004 = Code debt — keep P1.

---

### 2026-07-28 — Session #30 (PO tick po-tick-012)

**UX lens (ux-heuristics):** relay-198 **closed** — MealPhotoGallery Escape hint (bbd648c). relay-199 **closed** — Agent starter chips (5aefaef). **prop-ui-045 closed** via ui-059 (55c3a86) — Gemini wrap pills at 390px. Worker **relay-200** dedupes greeting grid vs composer chips (rf-r30-002). **maint-004 still open** — `.card`/`.card-placeholder`/`.btn-decline` at App.css L188/L201/L838.

**PO lens (define-prioritization-framework):** Session #29 handoffs **closed** (relay-197). Escape batch **complete** at relay-198. RICE open Worker: **relay-200** (duplicate prompt surfaces — UX debt from relay-199) > **relay-201** (tool-chips CSS scope). Code ch-134 done → **ch-135** AgentActionFeed split. UX backlog **idle** — no new prop-ui until relay-200 ships.

**Business lens (jobs-to-be-done):** Agent starter chips = Coach tab trigger (Hook) — shipped. Duplicate greeting+chips = cognitive noise before first message — relay-200 closes engagement loop. maint-004 = Code debt blocking clean ship narrative — escalate P1.

---

### 2026-07-28 — Session #29 (PO tick po-tick-011)

**UX lens (ux-heuristics):** relay-197 **closed** — Day event sheet Escape hint shipped (73c3806). UX backlog **idle**. **prop-ui-045 proposed** — Agent starter chips UX polish when relay-199 ships (Gemini chip density + 390px wrap). **maint-004 still open** — dead CSS at App.css L188/L201/L838.

**PO lens (define-prioritization-framework):** Session #28 handoffs **closed** (relay-195/196). **relay-197 closed this session** (73c3806). RICE: **relay-198** (gallery Escape — last polish) > **relay-199** (Agent starter chips). Code ch-132 done → **ch-133**.

**Business lens (jobs-to-be-done):** Escape batch closes at relay-198 — keyboard investment loop complete. relay-199 starter chips = Coach tab engagement trigger (Hook). maint-004 blocks clean maintainability — tag Code P1.

---

### 2026-07-28 — Session #28 (PO tick po-tick-010)

**UX lens (ux-heuristics):** relay-195/196 **closed** — camera + voice Escape hints shipped. UX backlog **idle** (ui-001–058 done). **maint-004 still open** — `.card`/`.card-placeholder`/`.btn-decline` at App.css L188/L201/L838.

**PO lens (define-prioritization-framework):** relay-195/196 **closed** since Session #27. RICE open Worker: **relay-197** (Day event Escape) > **relay-198** (gallery hint). Escape batch **ends at relay-198** — fed **relay-199** (Agent starter chips). Code ch-131 done → **ch-132** api.ts split in progress.

**Business lens (jobs-to-be-done):** Escape batch completion = keyboard investment loop closed. Post-batch refill with Agent engagement feature (starter chips) sustains Coach tab habit. maint-004 = Code debt blocking clean ship narrative.

---

### 2026-07-28 — Session #27 (PO tick po-tick-009)

**UX lens (ux-heuristics):** prop-ui-044 **closed** — ui-058 Settings disconnect banner shipped (d97f0e0). UX backlog **idle**; no new `ux-proposed` gaps. **maint-004 still open** — dead CSS persists despite ux-gap-040 “shipped” note.

**PO lens (define-prioritization-framework):** Session #26 handoffs **closed** (relay-194, ui-058). RICE open Worker: **relay-195** (camera Escape) > **relay-196** (voice) > **relay-197** (Day event). Fed **relay-198** (meal photo gallery Escape hint — key works, no visible hint). Code ch-131 done → **ch-130** line scan.

**Business lens (jobs-to-be-done):** Escape batch = keyboard investment loop completion. Settings disconnect UX = Sheets unlink trust shipped. Dead CSS debt (maint-004) blocks clean maintainability narrative — escalate Code priority.

---

### 2026-07-27 — Session #26 (PO tick po-tick-008)

**UX lens (ux-heuristics):** relay-193 **closed** (Log food edit Escape). **prop-ui-044 refined** — ux-gap-045 narrowed to disconnect success + error aria-live; **UX agreed ui-058** (worktree active). **maint-004 still open** — dead CSS in App.css L201/L838.

**PO lens (define-prioritization-framework):** Session #25 handoffs **closed** (relay-193). RICE open Worker: **relay-194** (attach sheet Escape) > **relay-195** (camera) > **relay-196** (voice). Fed **relay-197** (Day event sheet Escape). Code ch-128 done → **ch-131** useFutureSelfSection split (ch-129 deferred).

**Business lens (jobs-to-be-done):** BottomSheet Escape batch = keyboard investment loop near completion. Settings disconnect UX = trust hygiene on Sheets unlink. Test coverage (ch-129) = reduce offline sync regressions.

---

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
| `pwa/src/components/*` | 2026-07-28 po-tick-016 | 0 |
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
| pr-r10-000 | low | Bugbot: no issues in PO STATE.md doc diff | round-10 bugbot | closed | — | closed |
| pr-r10-001 | low | docs/window-instances/po-relay/STATE.md — prop-ui-044 ux_response synced; UX ui-058 shipping | round-10 /code-review | closed | ui-058 | closed |
| pr-r10-002 | low | docs/window-instances/po-relay/STATE.md — Session #26 UX narrative corrected (ui-058 active) | round-10 /code-review | closed | — | closed |
| pr-r10-003 | low | docs/window-instances/code-health/STATE.md — Code next ch-131 (ch-129 deferred) | round-10 /code-review | closed | ch-131 | closed |
| pr-r10-004 | low | docs/window-instances/po-relay/STATE.md — confirmed_next includes relay-194–197 | round-10 /code-review | closed | relay-197 | closed |
| pr-r10-005 | low | pwa/src/App.css:201 — maint-004 dead `.card-placeholder`/`.btn-decline` still present | round-10 /code-review | backlog | maint-004 | open |
| pr-r11-000 | low | Bugbot: no issues in PO STATE.md doc diff | round-11 bugbot | closed | — | closed |
| pr-r11-001 | low | docs/window-instances/po-relay/STATE.md — Session #27 aligned; relay-194 + ui-058 closed; relay-198 fed | round-11 /code-review | closed | relay-198 | closed |
| pr-r11-002 | low | docs/window-instances/po-relay/STATE.md — confirmed_next includes relay-195–198 | round-11 /code-review | closed | relay-198 | closed |
| pr-r11-003 | low | pwa/src/App.css:188 — maint-004 dead `.card`/`.card-placeholder`/`.btn-decline` still present | round-11 /code-review | backlog | maint-004 | open |
| pr-r12-000 | low | Bugbot: no issues in PO STATE.md doc diff | round-12 bugbot | closed | — | closed |
| pr-r12-001 | low | docs/window-instances/po-relay/STATE.md — Session #28 aligned; relay-195/196 closed; relay-199 fed | round-12 /code-review | closed | relay-199 | closed |
| pr-r12-002 | low | docs/window-instances/po-relay/STATE.md — confirmed_next unified relay-197–199 + ch-132 | round-12 /code-review | closed | — | closed |
| pr-r12-003 | low | pwa/src/App.css:188 — maint-004 dead CSS still present | round-12 /code-review | backlog | maint-004 | open |
| pr-r12-004 | low | docs/window-instances/instances.manifest.json:32 — ux-relay interval_sec 300→120 (out of PO tick scope; verify intent) | round-12 /code-review | closed | — | closed |
| pr-r13-000 | low | Bugbot: no issues in PO STATE.md doc diff | round-13 bugbot | closed | — | closed |
| pr-r13-001 | low | docs/window-instances/po-relay/STATE.md — Session #29 relay-197 closed; relay-198/199 queue synced | round-13 /code-review | closed | relay-198 | closed |
| pr-r13-002 | low | docs/window-instances/po-relay/STATE.md — prop-ui-045 proposed for relay-199 Agent starter chips UX | round-13 /code-review | closed | prop-ui-045 | closed |
| pr-r13-003 | low | pwa/src/App.css:188 — maint-004 dead CSS still present | round-13 /code-review | backlog | maint-004 | open |
| pr-r14-000 | low | Bugbot: no issues in PO STATE.md doc diff | round-14 bugbot | closed | — | closed |
| pr-r14-001 | low | docs/window-instances/po-relay/STATE.md — Session #29 relay-197 closed; prop-ui-045 proposed; handoffs synced | round-14 /code-review | closed | prop-ui-045 | closed |
| pr-r14-002 | low | pwa/src/App.css:188 — maint-004 dead CSS still present | round-14 /code-review | backlog | maint-004 | open |
| pr-r15-000 | low | Bugbot: no issues in PO STATE.md Session #30 doc diff | round-15 bugbot | closed | — | closed |
| pr-r15-001 | medium | docs/window-instances/po-relay/STATE.md — Code handoff stale ch-134 vs ch-135 done | round-15 /code-review | closed | ch-135 | closed |
| pr-r15-002 | low | docs/window-instances/po-relay/STATE.md — confirmed_next drift LAST_REVIEW vs CHECKPOINT | round-15 /code-review | closed | — | closed |
| pr-r15-003 | low | docs/window-instances/po-relay/STATE.md — review_tick_applied_at orphan row broke CHECKPOINT structure | round-15 /code-review | closed | — | closed |
| pr-r15-004 | low | docs/window-instances/po-relay/STATE.md — review_changed_files listed manifest not in diff | round-15 /code-review | closed | — | closed |
| pr-r15-005 | low | docs/window-instances/po-relay/STATE.md — prop-ui-045 refined vs closed terminology | round-15 /code-review | closed | prop-ui-045 | closed |
| pr-r15-006 | low | docs/window-instances/po-relay/STATE.md — maint-004 P1 escalation not in QUALITY_BACKLOG | round-15 /code-review | closed | maint-004 | closed |
| pr-r15-007 | low | pwa/src/App.css:188 — maint-004 dead `.card`/`.card-placeholder`/`.btn-decline` still present | round-15 /code-review | backlog | maint-004 | open |
| pr-r16-000 | low | Bugbot: no new issues in Round 16 post-triage STATE fixes | round-16 bugbot | closed | — | closed |
| pr-r16-001 | low | docs/window-instances/po-relay/STATE.md — Round 15 fix-now applied (ch-135 sync, confirmed_next, CHECKPOINT structure, maint-004 P1) | round-16 /code-review | closed | — | closed |
| pr-r17-000 | low | Bugbot: skipped — no PO-scope diff this tick | round-17 bugbot | closed | — | closed |
| pr-r17-001 | low | docs/window-instances/worker-relay/STATE.md — relay-200/201/202 shipped since Session #30; relay-203 active | round-17 /code-review | closed | relay-203 | closed |
| pr-r17-002 | low | docs/window-instances/po-relay/STATE.md — fed relay-207 food queue banner tap-to-focus (renumbered from relay-204 collision) | round-17 /code-review | closed | relay-207 | closed |
| pr-r17-003 | low | pwa/src/App.css:188 — maint-004 dead `.card`/`.card-placeholder`/`.btn-decline` still present | round-17 /code-review | backlog | maint-004 | open |
| pr-r17-004 | low | docs/window-instances/code-health/STATE.md — ch-135 AgentActionFeed split in progress (worktree active) | round-17 /code-review | closed | ch-135 | closed |
| pr-r18-000 | low | Doc-only PO-scope diff; no executable logic | round-18 bugbot | closed | — | closed |
| pr-r18-001 | high | docs/window-instances/po-relay/STATE.md:133 — relay-204 ID collision; renumbered to relay-207 | round-18 /code-review | closed | relay-207 | closed |
| pr-r18-002 | medium | docs/window-instances/po-relay/STATE.md:12 — stale relay-203 active; Worker shipped relay-203 | round-18 /code-review | closed | relay-203 | closed |
| pr-r18-003 | medium | docs/window-instances/po-relay/STATE.md:133 — false batch-ends-at-relay-203; Worker has relay-204–206 | round-18 /code-review | closed | — | closed |
| pr-r18-004 | low | docs/window-instances/po-relay/STATE.md:45 — receive_review_done=yes while review_status=pending | round-18 /code-review | closed | — | closed |
| pr-r18-005 | low | docs/window-instances/po-relay/STATE.md:25 — stale review_skip_reason vs code_changed=yes round 18 | round-18 /code-review | closed | — | closed |
| pr-r18-006 | low | docs/window-instances/po-relay/STATE.md:117 — prop-ui-045 refined vs shipped terminal narrative | round-18 /code-review | closed | prop-ui-045 | closed |
| pr-r18-007 | low | BRAINSTORM_LOG orphan lens blocks lack session headers | round-18 /code-review | closed | — | closed |
| pr-r18-008 | low | maint-004 dead CSS still at App.css L188/L838 | round-18 /code-review | backlog | maint-004 | open |
| pr-r18-009 | low | relay-207 food-queue tap AC not implemented — FoodQueueBanner dismiss-only | round-18 /code-review | backlog | relay-207 | open |
| pr-r18-010 | low | relay-204 disclaimer hide AC gap — AgentChatPanel still shows disclaimer with attach | round-18 /code-review | backlog | relay-204 | open |
| pr-r18-011 | low | relay-203 shipped — showGreeting wired with attachImage guard | round-18 /code-review | closed | relay-203 | closed |
| pr-r18-012 | low | docs/RELAY.md docs/maintenance/ docs/agents/ absent from repo root — review_scope.py stale | round-18 /code-review | closed | — | closed |
| pr-r18-013 | low | instances.manifest.json unchanged this tick | round-18 /code-review | closed | — | closed |
| pr-r18-014 | low | ch-135 in progress aligns with Code STATE | round-18 /code-review | closed | ch-135 | closed |
| pr-r19-000 | low | Doc-only PO-scope diff; no executable logic | round-19 bugbot | closed | — | closed |
| pr-r19-001 | medium | docs/window-instances/po-relay/STATE.md:133 — Code handoff stale ch-135; ch-135/136 done → ch-137 queued | round-19 /code-review | closed | ch-137 | closed |
| pr-r19-002 | medium | docs/window-instances/po-relay/STATE.md:23 — phase=9-arm with review_status=pending before Round 19 complete | round-19 /code-review | closed | — | closed |
| pr-r19-003 | low | docs/window-instances/po-relay/STATE.md:406 — HISTORY said relay-204 feed; Session #31 fed relay-207 | round-19 /code-review | closed | relay-207 | closed |
| pr-r19-004 | low | docs/window-instances/po-relay/STATE.md:406 — HISTORY cited Round 17; review_round now 19 | round-19 /code-review | closed | — | closed |
| pr-r19-005 | low | docs/window-instances/po-relay/STATE.md:393 — pr-r18-009/010 action=closed but status=open | round-19 /code-review | closed | relay-204 | closed |
| pr-r19-006 | low | docs/window-instances/po-relay/STATE.md:227 — orphan BRAINSTORM blocks lack session headers | round-19 /code-review | closed | — | closed |
| pr-r19-007 | low | docs/window-instances/po-relay/STATE.md:129 — Session #31 relay-200–203 closed matches Worker STATE | round-19 /code-review | closed | — | closed |
| pr-r19-008 | low | docs/window-instances/po-relay/STATE.md:12 — confirmed_next aligned relay-204–207 | round-19 /code-review | closed | — | closed |
| pr-r19-009 | low | docs/window-instances/instances.manifest.json unchanged this tick | round-19 /code-review | closed | — | closed |
| pr-r19-010 | low | docs/RELAY.md docs/maintenance/ docs/agents/ absent — review_paths stale | round-19 /code-review | closed | — | closed |
| pr-r19-011 | low | pwa/src/sections/Agent.tsx:57 — showDisclaimer omits attachImage guard; relay-204 AC unmet | round-19 /code-review | backlog | relay-204 | open |
| pr-r19-012 | low | pwa/src/components/FoodQueueBanner.tsx:22 — no tap-to-focus; relay-207 AC unmet | round-19 /code-review | backlog | relay-207 | open |
| pr-r19-013 | low | pwa/src/components/AgentChatPanel.tsx:26 — showGreeting attach guard; relay-203 shipped | round-19 /code-review | closed | relay-203 | closed |
| pr-r19-014 | low | pwa/src/App.css:188 — maint-004 dead CSS still present | round-19 /code-review | backlog | maint-004 | open |
| pr-r19-015 | low | relay-201 agent-tool-chips CSS removal verified | round-19 /code-review | closed | relay-201 | closed |
| pr-r19-016 | low | docs/window-instances/po-relay/STATE.md — prop-ui-046 proposed from ux-gap-046 Agent grid density | round-19 /code-review | closed | prop-ui-046 | closed |
| pr-r20-000 | low | Bugbot: no issues in PO doc diff | round-20 bugbot | closed | — | closed |
| pr-r20-001 | medium | docs/window-instances/po-relay/STATE.md:23 — phase=9-arm with review_status=pending before Round 20 complete | round-20 /code-review | closed | — | closed |
| pr-r20-002 | low | docs/window-instances/po-relay/STATE.md:45 — receive_review_done=yes while review pending | round-20 /code-review | closed | — | closed |
| pr-r20-003 | low | docs/window-instances/po-relay/STATE.md:40 — brainstorm_outcome cited Round 19 while review_round=20 | round-20 /code-review | closed | — | closed |
| pr-r20-004 | low | docs/window-instances/po-relay/STATE.md:12 — relay-204 described active; Worker queue only | round-20 /code-review | closed | relay-204 | closed |
| pr-r20-005 | low | docs/window-instances/po-relay/STATE.md:240 — orphan BRAINSTORM blocks lack session headers | round-20 /code-review | closed | — | closed |
| pr-r20-006 | low | docs/window-instances/po-relay/STATE.md:130 — Session #32 relay-203/ch-137/prop-ui-046 aligned | round-20 /code-review | closed | — | closed |
| pr-r20-007 | low | docs/window-instances/po-relay/STATE.md:118 — prop-ui-046 AC matches ux-gap-046 | round-20 /code-review | closed | prop-ui-046 | closed |
| pr-r20-008 | low | pwa/src/sections/Agent.tsx:57 — showDisclaimer omits attachImage; relay-204 AC unmet | round-20 /code-review | backlog | relay-204 | open |
| pr-r20-009 | low | pwa/src/components/FoodQueueBanner.tsx:22 — no tap-to-focus; relay-207 AC unmet | round-20 /code-review | backlog | relay-207 | open |
| pr-r20-010 | low | pwa/src/App.css:188 — maint-004 dead CSS still present | round-20 /code-review | backlog | maint-004 | open |
| pr-r20-011 | low | pwa/src/components/AgentChatPanel.tsx:26 — relay-203 showGreeting attach guard shipped | round-20 /code-review | closed | relay-203 | closed |
| pr-r20-012 | low | docs/RELAY.md docs/maintenance/ docs/agents/ absent — review_paths stale | round-20 /code-review | closed | — | closed |
| pr-r20-013 | low | docs/window-instances/instances.manifest.json unchanged this tick | round-20 /code-review | closed | — | closed |
| pr-r20-014 | low | docs/window-instances/po-relay/STATE.md:118 — prop-ui-046 AC refined Given/When/Then Session #33 | round-20 /code-review | closed | prop-ui-046 | closed |
| pr-r21-000 | low | Bugbot: no executable logic in PO doc diff | round-21 bugbot | closed | — | closed |
| pr-r21-001 | medium | docs/window-instances/po-relay/STATE.md:118 — prop-ui-046 status proposed vs refined AC | round-21 /code-review | closed | prop-ui-046 | closed |
| pr-r21-002 | medium | docs/window-instances/po-relay/STATE.md:23 — phase=9-arm with review_status=pending before Round 21 | round-21 /code-review | closed | — | closed |
| pr-r21-003 | low | docs/window-instances/po-relay/STATE.md:45 — receive_review_done=yes while review pending | round-21 /code-review | closed | — | closed |
| pr-r21-004 | low | docs/window-instances/po-relay/STATE.md:40 — brainstorm_outcome cited Round 20; review_round=21 | round-21 /code-review | closed | — | closed |
| pr-r21-005 | low | docs/window-instances/po-relay/STATE.md:12 — relay-204 queued matches Worker BACKLOG | round-21 /code-review | closed | relay-204 | closed |
| pr-r21-006 | low | docs/window-instances/po-relay/STATE.md:13 — ch-137 handoff matches Code STATE | round-21 /code-review | closed | ch-137 | closed |
| pr-r21-007 | low | pwa/src/sections/Agent.tsx:57 — relay-204 disclaimer AC still unmet | round-21 /code-review | backlog | relay-204 | open |
| pr-r21-008 | low | pwa/src/App.css:188 — maint-004 dead CSS still present | round-21 /code-review | backlog | maint-004 | open |

---

## HISTORY (PO / brainstorm)

| Timestamp | Mode | Item | Outcome | Verified | Commit |
|-----------|------|------|---------|----------|--------|
| 2026-07-28 | PO | po-tick-016 | Session #34 recovery + prop-ui-046 status + Round 21 review | brainstorm | — |
| 2026-07-28 | PO | po-tick-015 | Session #33 recovery + prop-ui-046 refine + Round 20 review | brainstorm | — |
| 2026-07-28 | PO | po-tick-014 | Session #32 SPIN + prop-ui-046 + ch-137 sync + Round 19 review | brainstorm | — |
| 2026-07-28 | PO | po-tick-013 | Session #31 + relay-207 feed + Round 18 review | brainstorm | — |
| 2026-07-28 | PO | po-tick-012 | Session #30 + relay-198/199 sync + prop-ui-045 close + Round 15 review | brainstorm | — |
| 2026-07-28 | PO | po-tick-011 | Session #29 + relay-197 sync + prop-ui-045 + Round 13 review | brainstorm | — |
| 2026-07-28 | PO | po-tick-010 | Session #28 + relay-195/196 sync + relay-199 feed + Round 12 review | brainstorm | — |
| 2026-07-28 | PO | po-tick-009 | Session #27 + relay-194/ui-058 sync + relay-198 feed + Round 11 review | brainstorm | — |
| 2026-07-27 | PO | po-tick-008 | Session #26 + relay-193 sync + prop-ui-044 refine + relay-197 feed + Round 10 review | brainstorm | — |
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
