# Code Health — Line-by-Line Evaluation Checklist

Apply **every dimension** to each file/function reviewed. Score: pass / warn / fail. Fail → backlog item.

## Pass 1 — standing (start of tick)

- [ ] Read [`AGENT_WAKE.md`](AGENT_WAKE.md) then [`CHARTER.md`](CHARTER.md)
- [ ] `git log -10 --oneline` + `git diff --stat` — note patchwork clusters
- [ ] `cd pwa && npm run build` passes (or note blocker)
- [ ] No staged secrets (`.env`, credentials, `*.db`)
- [ ] Loops running: `pgrep -f AGENT_LOOP_TICK_CODE_HEALTH`

## Pass 2 — per-file dimensions (line by line)

### Correctness & bugs

- [ ] Null/undefined guards on external data (API, localStorage, props)
- [ ] Error paths handled; no silent swallow except documented 401
- [ ] Race conditions: stale closures, missing effect deps, unmounted setState
- [ ] Offline/queue paths consistent with sibling tabs
- [ ] Type assertions justified; no `any` leaks

### Robustness & maintainability

- [ ] No symptomatic patchwork (3+ tiny commits fixing same surface → root refactor)
- [ ] Business rules live in one place (lib/hooks), not duplicated in sections
- [ ] Side effects isolated; pure helpers where possible
- [ ] Constants/maps colocated with domain (`lib/`), not scattered in JSX files

### Structure & separation of concerns

- [ ] Section files orchestrate; components present; hooks fetch/subscribe
- [ ] Presentation separate from data fetching
- [ ] CSS class semantics match component responsibility (no cross-domain class reuse)
- [ ] Server routes thin; service layer owns logic

### Readability

- [ ] Names describe intent (`remoteMealPlanSync` not `sync2`)
- [ ] Functions ≤ ~40 lines; extract when branching depth > 2
- [ ] No mystery booleans; named predicates (`shouldShowRemoteBanner`)
- [ ] Imports grouped: react → lib → hooks → components

### File naming (LLM clarity)

- [ ] One primary export per file; filename matches export (`MealPlanRemoteSyncBanner.tsx`)
- [ ] No generic names (`utils.ts`, `helpers.tsx`, `index` re-export maze)
- [ ] Hooks prefixed `use`; lib modules domain-named (`mealPlanQueue.ts`)
- [ ] Distinct from similarly named files (Remote vs Pending vs Queue)

### DRY & modularity

- [ ] Repeated JSX blocks (≥2 sites) → shared component
- [ ] Repeated conditionals (≥2 sites) → hook or helper
- [ ] Copy-pasted hook calls in sections → composite hook or slot component
- [ ] Shared types in `lib/` or `types/`, not duplicated interfaces

### Patchwork signals (from git history)

- [ ] Same file touched in 3+ consecutive fix commits → refactor candidate
- [ ] Rename-only commit after feature → naming was wrong upfront; fix root
- [ ] Banner/toast/hint added per tab → extract cross-tab awareness component
- [ ] Incremental `failedCount` / dismiss fixes → centralize queue state machine

## Pass 3 — pre-ship (after implement)

- [ ] Diff scope matches current backlog item only
- [ ] Build green
- [ ] STATE HISTORY + SCAN_COVERAGE updated
- [ ] RELAY fed if item affects feature backlog

## Definition of done

- Build passes
- Checklist dimensions evaluated and logged in STATE
- No new warn/fail on touched files without backlog entry
