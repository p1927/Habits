# STATE — worker-relay

> **Wake order:** LAST_REVIEW → CHECKPOINT → IN_PROGRESS → BACKLOG top item.

---

## LAST_REVIEW

| Field | Value |
|-------|-------|
| reviewed_at | 2026-07-27T11:22:00Z |
| git_branch | main |
| uncommitted_files | window-instances + code-health refactor WIP |
| where_we_are | relay-168 shipped; relay-149/150 queued from PO |
| confirmed_next | relay-169 |
| brainstorm_notes | This window = worker-relay only (`AGENT_LOOP_TICK_HABITS`) |

---

## CHECKPOINT

| Field | Value |
|-------|-------|
| last_wake | 2026-07-27T11:25:00Z |
| current_item_id | — |
| phase | `9-arm` |
| review_status | `done` |
| confirmed_next | relay-169 |
| next_action | relay-169 Day tab week report PDF export |
| loops | **Worker** dynamic wake — paste `@docs/window-instances/worker-relay/INSTANCE.md keep working` |

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
- [ ] relay-169 | Day tab export week report PDF from header action | feature
- [ ] relay-170 | Home rings card share image with streak label | feature
- [ ] relay-149 | VoiceStatusOrb reflects live mic state from voice iframe postMessage | feature | Given voice coach iframe open or persisted, When mic toggles, Then header orb matches `listening`/`thinking`/`speaking` within 200ms; pairs dd-004
- [ ] relay-150 | Home saved recipe → Log Recipes sub-tab deep link | feature | Given `HomeSavedRecipeCard` shows saved recipe, When user taps “See full recipe”, Then App navigates to Log tab Recipes sub-tab and refreshes sheet data

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
