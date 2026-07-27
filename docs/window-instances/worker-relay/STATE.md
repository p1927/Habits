# STATE — worker-relay

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T14:35:00Z |
| where_we_are | relay-176 verified shipped (e9b67a1) |
| confirmed_next | relay-177 |
| brainstorm_notes | This window = worker-relay only (`AGENT_LOOP_TICK_HABITS`) |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T14:35:00Z |
| confirmed_next | relay-177 |
| next_action | relay-177 Log History list show meal count inline |
| loops | **Worker** dynamic wake — paste `@docs/window-instances/worker-relay/INSTANCE.md keep working` |
| phase | 8-close |
| review_status | skipped |
| review_skip_reason | relay-176 verify-only tick; no new worker diff (shipped e9b67a1/f13d681) |
| review_round | `2` |
| review_diff_range | — |
| code_changed | `no` |

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

- [x] relay-174 | Day schedule empty state → Agent quick add prompt | feature | Add with Coach → navigateAgentPrompt + composer prefill
- [x] relay-175 | Log History CSV include meal count per day | polish | Followed col B → meal_count; CSV date,meals,calories,protein
- [x] relay-176 | Home dashboard pull-to-refresh gesture | polish | usePullToRefresh + HomePullRefreshIndicator (e9b67a1)

- [ ] relay-177 | Log History list show meal count inline | polish
- [ ] relay-178 | Agent chat copy assistant message | polish
- [ ] relay-179 | Day manage-day quadrant tap → expand task list | feature

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Queue sort parity | relay-130 | done |
| Lighthouse PWA | ROADMAP | relay-160 done (97/100/100) |
| ui-038 Agent SSE streaming | maintenance | done relay-165 |

---

## REVIEW_FINDINGS

| id | severity | finding | source | action | backlog_ref | status |
|----|----------|---------|--------|--------|-------------|--------|
| rf-r0-000 | low | No issues in relay-171–173 diff | round-0 /code-review | closed | — | closed |
| rf-r1-000 | low | No issues in relay-174 diff | round-1 /code-review | closed | — | closed |
| rf-r2-000 | low | No issues in relay-175 diff | round-2 /code-review | closed | — | closed |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-176 | done | build | e9b67a1 |
| 2026-07-27 | relay-175 | done | build | c3d1f04 |
| 2026-07-27 | relay-174 | done | build | e8edd4b |
| 2026-07-27 | relay-173 | done | build | 8b0e3d3 |
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
