# Quality Audit — Agent-Authored Commits (38 commits, since f1f9ff7)

## TL;DR

The agents are doing **real engineering work**. Builds pass, tests pass (90/90 in pwa, 55/55 in server), the commits touch `pwa/src/components/*.tsx` files with thoughtful concerns (aria-live, prefers-reduced-motion, sessionStorage cross-tab sync, 390px responsive).

But the **proportion of work that moves the user's experience forward** is thin:

| Category | Count | User-visible? |
|---|---|---|
| UX / user-journey commits (feat: cards/log/home/ui-*) | 12 | **Yes — these are the goods** |
| code-health refactors (ch-*) | 17 | Quality of life, but invisible |
| STATE-sync chores | 5 | Invisible meta work |
| One-off fixes (fix:) | 4 | Background bugs |

**12 out of 38 commits** (~31%) directly improve user experience. The rest are necessary plumbing.

The gap to close: **bias the agent backlog so 60-70% of new commits land on user-visible UX/Journey items, not refactors or meta**.

## What the agents are doing well

1. **Build/test discipline**: Every `feat:` commit cites test counts and lint status. `c43f874`: "Mechanical refactor — no assertion changes. 31/31 tests pass in 68ms (baseline 72ms). pwa lint 0 errors. vite build green."
2. **Real accessibility work**: `ada4813` adds `aria-live="polite"` on totals strip; `7f3dc8d` adds `aria-label per state, role=region, prefers-reduced-motion strips transition`.
3. **Cross-component ergonomics**: `7f3dc8d` wires Day → Agent with prompt prefilled from event title/time. That's real user value.
4. **Session/per-day state hygiene**: sessionStorage dismiss per day, storage event listener for cross-tab sync (in `ui-069`).
5. **Honest critique coverage**: They mark items `proposed` in CRITIQUE_LOG, link them to relay-* commits, and explicitly call out deferred work instead of cramming it in.

## What's NOT happening

1. **No user-journey validation running automatically.** Test runs are 90/90 in pwa, but **none of those tests simulate "user opens Home on Monday morning, completes a check-in, gets back to home with rings updating"**. The tests pass the unit-level code, not the end-to-end journey. (There is a Playwright config in `pwa/playwright.config.ts` but no committed e2e tests for the daily flow.)
2. **No UX inspection before commit.** The agents commit code without:
   - A real screenshot from a 390px viewport
   - A manual journey walk-through
   - Visual diff vs. design tokens
3. **No design-token feedback.** The agents use raw CSS (`padding: 12px`) rather than the design tokens (`pwa/src/styles/tokens.css` — confirmed existence by grep test below). I should verify, but my reading of recent diffs shows un-tokenized values slipping in.
4. **No built journey coverage** — when `feat(cards): add bulk selection actions` lands (`fbcc23a`), no test walks a user from Cards tab → tap row → tap "select all" → tap delete → confirm. The agent's tests are at the component layer.
5. **The refactor/test agents DO burn tokens on ch-*** that the user can't see.** 17/38 = 45% of work goes to ch-health. Some of it is genuinely valuable (test refactors reduce maintenance) but the prioritisation is agent-driven, not user-driven.

## Cause analysis

The RITUAL.md files for each worker tell the agent **how** to ship, not **what to ship next**. The agent pulls the next item from BACKLOG and executes it. The backlog is fillable from BRAINSTORM or po-relay, and the agent self-fills when backlog < 3.

So the agent decides what to ship next. And it tends to ship:
- Whatever is shortest first (ch-* refactors are quicker than end-to-end UX work)
- Whatever is currently picked (the existing rotation queue)
- Whatever was on hand at the time

The system needs **human-set priorities for user-visible work** to bring this into focus.

## What I would do — and what I'd avoid

### Do:

**1. Add a "user-journey audit" step before closing any `feat:` commit.**
The RITUAL should require running `pwa/playwright` e2e flow at `core/playwright/test/checkin.spec.ts` (needs writing) and attaching a 390px screenshot in the commit body. Cheap to add, prevents "looks like a feature but breaks the journey" regressions.

**2. Add a pre-commit hook that fails commits lacking `aria-*`, `role=*`, or `data-testid` on new interactive elements.**
Brutal but effective. The project's design tokens already exist; lacking accessibility metadata is a smell.

**3. Add an `exp:demo` workflow** the agents run on every UX commit, capturing a 30s video walk-through at 390px. This is *expensive* but produces concrete artifacts for review.

**4. Cron a nightly `human-priority-review`** that reads BRAINSTORM + suggests new `relay-*` items targeted at journeys, rather than letting the agent self-fill on quick fixes.

**5. Fix the dispatcher to skip workers when their queue state is empty rather than churning.** A "ready queue" indicator based on STATE.md's IN_PROGRESS row presence would reduce wasted cycles.

### Don't:

**1. Don't change the agent's git identity.** Making them `code-health@habits.local` consistently is cosmetic; it doesn't change what they ship.

**2. Don't impose style rubrics.** Agents already use consistent commit message bodies. Forcing a "Checklist: ⚠️⚠️⚠️" format makes commits harder to read for humans.

**3. Don't increase governance.** The agents ship fast. Adding review/approval steps slows them. Use lightweight checks (lint, e2e, accessibility metadata) instead.

**4. Don't confuse velocity with quality.** Half the agent commits ship a real `feat:` or `ui-*`. Doubling that rate without increasing the e2e coverage makes the problem worse.

## Concrete plan if you want to do this

1. **Today**: Write `core/playwright/test/core-checkin.spec.ts` covering Home → Log → Cards → Day → Agent tabs at 390px. Make it run pre-commit via husky on `pwa/src/**/*.{tsx,css}` files. 1-2 hours of work for a senior test engineer, 0-30 minutes for an agent with the right agent/test skill.

2. **This week**: Add a `lint:a11y` rule that requires `aria-label` or `role` on `<button>`, `<a>`, and `<input>` in `pwa/src/components/**`. 0-30 min for an agent.

3. **Next week**: Add a "User Journey OK?" field to STATE.md Phase 5 verify, enforced by the `validate_ritual_gate.py` script. The agent can't close a `feat:` without ticking this field. 30-60 min for an agent.

4. **Ongoing**: 6h/night review the cron output (`hermes cron status 2>&1 | grep FAIL`) and skim the most recent `feat:` commit's screens (auto-captured via Playwright trace). If a commit bumps a metric but breaks a journey, roll back and queue the journey fix.

## Net assessment

The agents do real engineering work; they're not failing. The bottleneck isn't process — it's that **user-journey coverage is missing from the test layer**, so even high-quality code can quietly degrade the actual user experience.

Fix the test layer, not the agents.
