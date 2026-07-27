# STATE — po-relay

> **po-relay window only.** UX ships from [`ux-relay/STATE.md`](../ux-relay/STATE.md).

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T11:22:00Z |
| where_we_are | Session #19 — ui-038 unblocked; relay-149/150 fed Worker |
| confirmed_next | UX verify ui-038; Worker relay-169; triage dd-004 vs relay-149 |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T13:35:00Z |
| current_item_id | po-tick-001 |
| phase | `9-arm` |
| review_status | `done` |
| review_skip_reason | — |
| confirmed_next | UX verify ui-038; Worker relay-169 |
| loops | po-relay backup wake pid 24470 (658177 aborted → re-armed) |

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
- [ ] maint-003 | Lighthouse PWA score > 90 | ROADMAP | relay-160 hit **97/100/100**; **Code window:** re-run mobile Lighthouse on `vite preview /Habits/` after ch-006–114 refactor batch lands; confirm precache still ~500 KiB

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
| dd-004 | VoiceStatusOrb: iframe postMessage vs polling? | **verify** — `VoiceEmbed` + `parseVoiceIframeMessage` shipped; relay-149 scoped to E2E mic-state parity test |

---

## UI_PROPOSALS (PO → UX handshake)

> **PO proposes here.** UX triages on every UX tick. Do **not** write directly to `ux-relay/STATE.md` `UI_POLISH_BACKLOG` — only `agreed` items move there.

| id | status | origin | surface | proposal | acceptance criteria | ux_response |
|----|--------|--------|---------|----------|---------------------|-------------|
| prop-ui-038 | refined | po | Agent | Token-by-token streaming assistant bubble | **Backend live** (relay-165 SSE + `agentChatStream`); UX verify Gemini bubble + blinking cursor; no layout shift; mark ui-038 done if pass | UX: verify on device |
| prop-ui-039 | proposed | po | Home → Log | Saved recipe “See full recipe” deep link | Given saved recipe on Home, When user taps secondary link, Then navigate to Log **Recipes** sub-tab with sheet data loaded | — |

**Status values:** `proposed` → UX reviews | `agreed` → copied to UX_STATE `UI_POLISH_BACKLOG` | `refined` → UX sent AC changes, PO updates row | `rejected` → dropped with reason in `ux_response`

**PO tick:** add/refine rows; never set `agreed` (UX owns triage).

**UX tick:** read this table first; for each `proposed`/`refined`, set status + `ux_response`; on `agreed`, append matching `ui-*` line to [`ux-relay/STATE.md`](../ux-relay/STATE.md).

---

## BRAINSTORM_LOG (newest first)

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

**PO lens:** Published [`LOOPS.md`](LOOPS.md) — Worker / UX / Code / PO; one PID per chat; PO = `AGENT_LOOP_TICK_PO_RELAY`. maint-003 workbox fix → **Code window** next.

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
| pr-001 | info | relay-165/168 shipped SSE streaming + cancel; ui-038 backend done | git log | UX verify ui-038 | ui-038 | open |
| pr-002 | low | relay-149/150 brainstormed in #18 but missing from Worker BACKLOG | PO audit | Added relay-149/150 | worker BACKLOG | closed |
| pr-003 | info | Code window ch-006–114 structural refactors uncommitted | git status | Code continues; no PO action | ch-115+ | open |

---

## Product review — 2026-07-27

- **Shipped vs backlog:** relay-163–168 on main (vision attach, SSE stream, streak toast, gallery, log tab memory, stream cancel). Worker next: relay-169/170.
- **Missing features:** relay-149 VoiceStatusOrb E2E, relay-150 Home→Recipes deep link (now queued).
- **UI proposals:** prop-ui-038 refined (backend live); prop-ui-039 new (Home deep link).
- **Quality flags:** maint-003 near done (Lighthouse 97); Code ch-batch uncommitted.
- **AC gaps:** relay-170 may overlap existing `ringShareCard` streak pill — Worker confirm delta vs done.

---

## HISTORY (PO / brainstorm)

| Timestamp | Mode | Item | Outcome | Verified | Commit |
|-----------|------|------|---------|----------|--------|
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
