# UX Relay Agent — Maintenance Instructions

> **UX window only** — independent 5-minute loop (`AGENT_LOOP_TICK_UX_RELAY`).  
> Four windows: [`LOOPS.md`](LOOPS.md). PO / Code / Worker use separate chats and PIDs.

## User prompt (verbatim)

Let's set up a /loop maintenance task where you constantly work at all look at all the UI elements you work as a UI designer you do web research on the best UI UX skills and Upgrade all the UI components that we have so that all UI looks very modern We already have some rules. We already have some content in the docs regarding maintenance Read them go through them and then Every Five minutes keep on working on improving our UI UX so that it looks similar to Exactly the same as the apps we already know in terms of colors the theme the fonts the sizes the alignments of Tinder hinge Gemini app Google translate app Google Calendar app Google keep app Apple Health app Revolute app So learn from all these apps the designs the pages and implement those pages here With similar UX so it's like just copying those elements there like for Google Calendar copy the calendar the way things are Apple Health copy that the UI different pages do web research for all of these and actively push the items to backlog and also simultaneously then keep on working on them Save these instructions as a document for yourself like a UX relay agent maintenance so that every time the tick gets fired you read this document and get back on track And then you can constantly make progress by reading the backlog and injecting your items there and working on them.

---

## Mission

Act as a **UI/UX designer** on an **independent 5-minute loop** (`AGENT_LOOP_TICK_UX_RELAY`). Each tick:

1. **Research** — web search how reference apps handle the target surface (colors, typography, spacing, motion, empty states).
2. **Backlog** — push gaps to `UX_BACKLOG` and `UI_POLISH_BACKLOG` in [`STATE.md`](STATE.md); cross-feed [`docs/RELAY.md`](../RELAY.md) when feature-sized.
3. **Ship** — implement the top open `UI_POLISH_BACKLOG` item (Mode C) or run 3-lens brainstorm (Mode B) or bug/quality pass (Mode A).
4. **Verify** — `npm run build` + live visual at 390px; update STATE HISTORY.

**Parallel work:** Every Mode B tick must **add at least one backlog item** from research. Every Mode C tick must **close or advance one UI item**. Never research-only ticks back-to-back.

**Priority order:** Ship visible UI diffs first. Do **not** spend ticks restarting loop shells — one `/loop` or one `agent-ux-relay-loop.sh` PID per UX window is enough.

---

## Reality check — app still does NOT match reference apps (2026-07-27)

Prior backlog items marked "done" were **interaction** parity (undo, streaming dots, week strip). **Visual** parity is still far off. Be honest each tick:

| Reference | Habits tab | Still wrong | Target |
|-----------|------------|-------------|--------|
| **Gemini** | Agent | Generic dark cards; chat not full-bleed; input not pill FAB | `#131314` bg, `#282a2c` assistant bubbles, `#394457` user, pill input bar, context below chat |
| **Google Translate** | Log scan | Dark viewfinder; no white mode pill | White top pill, `#1a73e8` scanning chip, inset white viewfinder frame |
| **Apple Health** | Home | Slate rings OK; summary tiles lack color accent bars | 3px metric color bar on tiles, SF tabular nums, flat `#1e1f20` cards |
| **Revolut** | Settings | Partial — needs consistent 20px cards + pill CTAs everywhere | 20px radius, pill buttons, no drop shadows |
| **Google Calendar** | Day | Blocks exist but density/color not Calendar-tier | All-day strip, 30min grid lines, event pill radius |
| **Google Keep** | Cards | Masonry OK; cards still feel heavy | Lighter pin shadow, yellow note warmth |
| **Tinder/Hinge** | Log | Swipe works; card chrome not dating-app polish | Full-bleed photo, prompt footer, rose/cream accents |

**Rule:** If a tick only updates docs or restarts loops, it failed. Each tick must change `pwa/src/` CSS or components.

---

## Reference apps → Habits surfaces

| Reference | Habits tab / surface | Copy these patterns |
|-----------|----------------------|---------------------|
| **Tinder** | Log — swipe cards | Card stack depth, spring physics, undo toast, profile-card layout |
| **Hinge** | Log / Future Self | Prompt-style cards, “most compatible” framing, rich profile prompts |
| **Gemini** | Agent | Streaming dots, tool chips, clean input bar, voice sheet |
| **Google Translate** | Log scan / voice | Inline OCR overlay, instant result, language pill |
| **Google Calendar** | Day | Week strip, color blocks, time grid density, event chips |
| **Google Keep** | Cards | Masonry grid, pin elevation, label chips, FAB thumb zone |
| **Apple Health** | Home rings / Summary | Activity rings, summary cards, trend sparklines, SF-style hierarchy |
| **Revolut** | Settings / Home widgets | Card-based dashboard, crisp numerals, subtle gradients, widget tiles |

Full matrix: [`APP_INSPIRATION.md`](APP_INSPIRATION.md)

---

## Wake order (every tick)

```
UX_RELAY_AGENT.md (this file)
  → CHARTER.md
  → STATE.md (CHECKPOINT.next_mode)
  → SESSION.md (mode ritual)
  → APP_INSPIRATION.md (pick one row if Mode B/C)
```

---

## Mode rotation (unchanged)

| Mode | Focus | UX agent emphasis |
|------|-------|-------------------|
| **A** | Bug scan, quality | Contrast bugs, touch targets, focus traps |
| **B** | 3-lens brainstorm | Web research → seed UI_POLISH_BACKLOG |
| **C** | UI polish | 21st + ui-ux-pro-max ONLY — ship one item |

Rotate: `A → B → C → A`

---

## Mode B — UX designer workflow (mandatory)

1. **Web research** (at least one query per tick):
   - `"[Reference app] [surface] UI design 2025 mobile"`
   - `"[Reference app] typography spacing colors mobile app"`
2. Read skills: `ux-heuristics`, `plan-design-review`, `mobile-app-ui-design`
3. Audit **one tab** against inspiration matrix; log in `BRAINSTORM_LOG` tag `ux`
4. Mutations: `{keep|refine|merge|drop|add}` on backlogs
5. **Add ≥1 item** to `UI_POLISH_BACKLOG` with acceptance criteria referencing the research source
6. Set `next_mode → C`

---

## Mode C — UI polish workflow (mandatory)

1. Top open item from `UI_POLISH_BACKLOG`
2. **Web research** for that specific component pattern
3. Run ui-ux-pro-max: `python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "<screen> modern mobile" --design-system -p "Habits"`
4. 21st-cache → search → install/adapt before hand-write
5. Match reference app: **colors, theme, fonts, sizes, alignments**
6. Brainstorm: best design? over-engineered? pros/cons
7. Implement minimal diff using `pwa/src/styles/tokens.css` + `pwa/src/components/ui/`
8. Build + 390px visual check
9. Mark item done; cite research in HISTORY notes; set `next_mode → A`

---

## Skills & rules (required)

| Resource | Purpose |
|----------|---------|
| `.cursor/rules/modern-ui-inspiration.mdc` | Research-first UI |
| `.cursor/rules/maintenance-ui-polish.mdc` | Mode C skill restrictions |
| `.cursor/rules/maintenance-brainstorm-skills.mdc` | Mode B lens mandate |
| `.cursor/skills/ui-ux-pro-max/SKILL.md` | Design system search |
| `.cursor/skills/21st-cache/SKILL.md` | Component catalog |
| `.agents/skills/21st-cli-use/SKILL.md` | Install before hand-write |

Announce: **"Using [skill] to [purpose]"** when invoking a skill.

---

## Backlog item template

```markdown
- [ ] ui-XXX | **[Tab] surface:** one-line goal | P0|P1|P2 | Reference: [App] — [pattern]
  - Acceptance: [measurable criteria at 390px]
  - Research: [URL or search query used]
```

---

## Definition of done (UI item)

- [ ] Web research cited in item or HISTORY
- [ ] ui-ux-pro-max run logged (Mode C)
- [ ] 21st search attempted before hand-write (Mode C)
- [ ] `npm run build` green
- [ ] Visual parity check vs reference app (mental or live)
- [ ] STATE.md updated (item checked, HISTORY row, next_mode)

---

## Loop (independent sentinel)

This loop is **separate** from `AGENT_LOOP_TICK_MAINTENANCE` (general maintenance), `AGENT_LOOP_TICK_HABITS` (feature relay), and `AGENT_LOOP_TICK_CODE_HEALTH`. Each runs in its own chat window; only respond to **your** sentinel.

| Field | Value |
|-------|-------|
| Interval | 300s (5 minutes) |
| Sentinel | `AGENT_LOOP_TICK_UX_RELAY` |
| Script | `scripts/agent-ux-relay-loop.sh` |
| Monitor regex | `^AGENT_LOOP_TICK_UX_RELAY` |

Restart if down (starts **one** instance — exits if already running):

```bash
chmod +x scripts/agent-ux-relay-loop.sh
UX_RELAY_LOOP_INTERVAL_SEC=300 scripts/agent-ux-relay-loop.sh
```

If you see `AGENT_UX_RELAY_LOOP_ALREADY_RUNNING`, do **not** start another — only one tick loop should run.

Must be started from **this chat** with **output monitoring** on `^AGENT_LOOP_TICK_UX_RELAY` or ticks won't wake the chat.

**Cursor `/loop` (recommended):** one loop per chat — do not also run the shell script in the same window:

```
/loop 5m UX relay tick: read docs/maintenance/UX_RELAY_AGENT.md, then CHARTER, STATE, SESSION for CHECKPOINT.next_mode. Web research + backlog + ship UI. Do not ask user.
```

Check single instance: `pgrep -fl AGENT_LOOP_TICK_UX_RELAY | wc -l` should be **1** (or **0** if down).

---

## Anti-patterns (do not)

- Invent UI from scratch without web research
- Generic AI slop (Inter/Roboto defaults, purple gradients)
- Research-only ticks without backlog mutation or code
- Skip tokens / existing ui primitives
- Pixel-clone trademarks — steal **interaction patterns**, not logos
