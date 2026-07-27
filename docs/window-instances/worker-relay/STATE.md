# STATE — worker-relay

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T21:15:00Z |
| where_we_are | relay-187 review complete (round 15) |
| confirmed_next | relay-188 |
| brainstorm_notes | aria-keyshortcuts now match deferred shortcut handler |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | `2026-07-27T21:15:00Z` |
| confirmed_next | `relay-188` |
| next_action | `relay-188 OAuth success banner auto-dismiss after 5s` |
| phase | `8-close` |
| review_status | `skipped` |
| review_skip_reason | `relay-187 round 15 review done; aria fix committed ac57cf8` |
| review_diff_range | `relay-187-r15` |
| code_changed | `no` |
| review_round | `15` |
| last_reviewed_round | `15` |
| worktree_status | `none` |
| current_item_id | `—` |
| worktree_path | `—` |
| worktree_branch | `—` |
| worktree_item_id | `—` |
| review_changed_files | `pwa/src/components/AppTabBar.tsx pwa/src/hooks/useAppTabShortcuts.ts` |
| review_fingerprint | `f1271529cafb5f15` |

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

- [x] relay-177 | Log History list show meal count inline | polish | meal count suffix on history rows when API provides it
- [x] relay-178 | Agent chat copy assistant message | polish | Copy pill on completed coach bubbles via clipboard API
- [x] relay-179 | Day manage-day quadrant tap → expand task list | feature | accordion toggle + task preview when collapsed
- [x] relay-180 | Agent chat regenerate last reply | polish | Regenerate pill re-streams last user turn
- [x] relay-181 | Home decision card tap → Future Self tab | feature | `#futureself` deep link + Open Future Self on decision card
- [x] relay-182 | Log tab keyboard shortcut hint on first visit | polish | verify-only — `useLogTabShortcuts` + LogSubTabs hint (f3af1b5)
- [x] relay-183 | Day tab keyboard shortcut hint on first visit | polish | useDayScheduleShortcuts + DayTimelineCard hint (⌘1/⌘2)
- [x] relay-184 | Agent composer focus shortcut (⌘/Ctrl+K) | polish | useAgentComposerFocusShortcut + disclaimer hint
- [x] relay-185 | Cards tab keyboard shortcut hint on first visit | polish | useCardsFilterShortcuts + CardsFilterBar hint (⌘1–4)
- [x] relay-186 | Settings tab keyboard shortcut from header gear hint | polish | useSettingsOpenShortcut + AppHeader hint (⌘,)
- [x] relay-187 | App tab bar keyboard shortcuts ⌘/Ctrl+1–5 | polish | useAppTabShortcuts + AppTabBar hint; defers on Log/Day/Cards
- [ ] relay-188 | OAuth success banner auto-dismiss after 5s | polish
- [ ] relay-189 | Home rings share sheet keyboard Escape to close | polish

---

## BRAINSTORM (unprioritized)

| Idea | Inspiration | Notes |
|------|-------------|-------|
| Queue sort parity | relay-130 | done |
| Lighthouse PWA | ROADMAP | relay-160 done (97/100/100) |
| ui-038 Agent SSE streaming | maintenance | done relay-165 |
| Tab shortcut hints | relay-182 | extend to Day/Cards |

---

## REVIEW_FINDINGS

| id | severity | finding | source | action | backlog_ref | status |
|----|----------|---------|--------|--------|-------------|--------|
| rf-r0-000 | low | No issues in relay-171–173 diff | round-0 /code-review | closed | — | closed |
| rf-r1-000 | low | No issues in relay-174 diff | round-1 /code-review | closed | — | closed |
| rf-r2-000 | low | No issues in relay-175 diff | round-2 /code-review | closed | — | closed |
| rf-r3-000 | low | relay-176 verify-only tick; STATE checkpoint sync; no new pwa/server feature diff | round-3 /code-review | closed | relay-176 | closed |
| rf-r3-001 | low | No issues in relay-177 diff | round-3 /code-review | closed | — | closed |
| rf-r4-000 | low | No issues in relay-178 diff | round-4 /code-review | closed | — | closed |
| rf-r5-000 | low | No issues in relay-179 diff | round-5 /code-review | closed | — | closed |
| rf-r6-000 | low | No issues in relay-180 diff | round-6 /code-review | closed | — | closed |
| rf-r7-000 | low | No issues in relay-181 diff | round-7 /code-review | closed | — | closed |
| rf-r8-000 | low | No issues in relay-183 diff | round-8 /code-review | closed | — | closed |
| rf-r9-001 | low | Duplicate event title in BottomSheet h2 and Card h3 | round-9 /code-review | fix-now | — | closed |
| rf-r9-002 | low | Unused `.day-event-detail` wrapper CSS after Card refactor | round-9 /code-review | fix-now | — | closed |
| rf-r10-001 | low | No issues in relay-184 composer shortcut diff | round-10 /code-review | closed | — | closed |
| rf-r11-001 | low | Duplicate `last_wake` row in CHECKPOINT from prior 9-arm edit | round-11 /code-review | fix-now | — | closed |
| rf-r12-001 | low | No issues in relay-185 Cards filter shortcut diff | round-12 /code-review | closed | — | closed |
| rf-r13-001 | low | No issues in relay-186 Settings shortcut diff | round-13 /code-review | closed | — | closed |
| rf-r14-001 | low | No issues in relay-187 app tab shortcut diff | round-14 /code-review | closed | — | closed |
| rf-r15-001 | low | No issues in relay-187 aria-keyshortcuts alignment diff | round-15 /code-review | closed | — | closed |

---

## HISTORY (newest first)

| Timestamp | Item | Outcome | Verified | Commit |
|-----------|------|---------|----------|--------|
| 2026-07-27 | relay-187 | done | build | 4c3ad70 |
| 2026-07-27 | relay-186 | done | build | 41d31b5 |
| 2026-07-27 | relay-185 | done | build | 2303dab |
| 2026-07-27 | relay-184 | done | build | ac53858 |
| 2026-07-27 | relay-183 | done | build | 2055d88 |
| 2026-07-27 | relay-182 | done | build | f3af1b5 |
| 2026-07-27 | relay-181 | done | build | f8cbe92 |
| 2026-07-27 | relay-180 | done | build | f32d5a1 |
| 2026-07-27 | relay-179 | done | build | d9fcad8 |
| 2026-07-27 | relay-178 | done | build | 81a3034 |
| 2026-07-27 | relay-177 | done | build | c69908d |
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
