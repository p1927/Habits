# STATE — worker-relay

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T14:20:00Z |
| where_we_are | relay-171–173 shipped |
| confirmed_next | refill BACKLOG |
| brainstorm_notes | This window = worker-relay only (`AGENT_LOOP_TICK_HABITS`) |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T14:20:00Z |
| confirmed_next | relay-174 |
| next_action | relay-174 Day schedule empty state Agent quick prompt |
| loops | **Worker** dynamic wake — paste `@docs/window-instances/worker-relay/INSTANCE.md keep working` |
| phase | 9-arm |
| review_status | done |
| review_round | `0` |
| code_changed | `yes` |

---

## IN_PROGRESS

*(empty)*

---

## BACKLOG (priority ordered)

- [x] relay-162 | Tap Home calorie trend → open Log History tab | feature | `navigateLogHistory` in App; tappable `HomeCalorieTrendCard` with hint
- [x] relay-163 | Agent chat image attach in first message (no history required) | feature | `image_base64` on `/api/agent/chat`; multimodal user message in agent service
- [x] relay-164 | Day tab streak milestone toast on week complete | feature | StreakMilestoneToast at 7d/14d overall streak

- [x] relay-165 | Agent chat SSE streaming replies | feature | `/api/agent/chat/stream`; token events + streaming bubble
- [x] relay-166 | Home meal photo tap → full-screen gallery | feature | MealPhotoGallery lightbox (ad69715)
- [x] relay-167 | Log tab remember last sub-tab on return | polish | localStorage `habits-log-last-tab`

- [x] relay-168 | Agent chat cancel in-flight stream on new send | polish | AbortController + generation guard; send while streaming
- [x] relay-169 | Day tab export week report PDF from header action | feature | `DaySectionHeader` Week PDF + `useDayWeekReportExport`
- [x] relay-170 | Home rings card share image with streak label | feature | PO round-2 verified shipped — `ringShareCard` streak pill + `useHomeDashboardActions`
- [x] relay-149 | VoiceStatusOrb reflects live mic state from voice iframe postMessage | feature | persist iframe + postMessage → header orb
- [x] relay-150 | Home saved recipe → Log Recipes sub-tab deep link | feature | navigateLogRecipes + refresh on openLogRecipes

- [x] relay-171 | Agent context panel refresh after tool-call stream completes | polish | context.refresh + action feed seed on tool_results
- [x] relay-172 | Log History export CSV from header | feature | Export CSV pill + downloadLogHistoryCsv
- [x] relay-173 | Day timeline tap event → calendar detail sheet | feature | DayCalendarEventSheet + tappable agenda/grid events

- [ ] relay-174 | Day schedule empty state → Agent quick add prompt | feature
- [ ] relay-175 | Log History CSV include meal count per day | polish
- [ ] relay-176 | Home dashboard pull-to-refresh gesture | polish

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Queue sort parity | relay-130 | done |
| Lighthouse PWA | ROADMAP | relay-160 done (97/100/100) |
| ui-038 Agent SSE streaming | maintenance | needs backend |

---

## REVIEW_FINDINGS

| id | severity | finding | source | action | backlog_ref | status |
|----|----------|---------|--------|--------|-------------|--------|
| — | — | — | — | — | — | — |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-173 | done | build | — |
| 2026-07-27 | relay-172 | done | build | ceeeed2 |
| 2026-07-27 | relay-171 | done | build | 3d602a9 |
| 2026-07-27 | relay-150 | done | build | d3c3c18 |
| 2026-07-27 | relay-149 | done | build | 343d27d |
| 2026-07-27 | relay-169 | done | build | f441e32 |
| 2026-07-27 | relay-168 | done | build | 990a581 |
| 2026-07-27 | relay-167 | done | build | cfa947a |
| 2026-07-27 | relay-166 | done | build | ad69715 |
| 2026-07-27 | relay-165 | done | build | e9173b3 |
| 2026-07-27 | relay-164 | done | build | d6ed70d |
| 2026-07-27 | relay-163 | done | build | 8a0dd79 |
| 2026-07-27 | relay-161 | done | build | f4906ad |
| 2026-07-27 | relay-160 | done | lighthouse | — |
| 2026-07-27 | relay-153–158 | done | build | be39deb |
| 2026-07-27 | relay-159 | done | build | 111de02 |
| 2026-07-27 | relay-152 | done | build | 4dfc101 |

---

## Cycle rules

1. Every wake: 9-phase ritual per [RITUAL.md](RITUAL.md)
2. Odd = maintenance | Even = feature
3. **Commit after each completed item** — never commit `.env`
4. BACKLOG < 3: refill from BRAINSTORM + web research
