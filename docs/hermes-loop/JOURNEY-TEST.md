# End-to-end Journey Test

## What this is

`pwa/src/__journey__/core-checkin.journey.test.tsx` mounts the real
`<App />` component under jsdom + React Testing Library, stubs the
network, and walks the user from Home → Log → Day → Cards → Home.
Two assertions: every main tab is reachable; the App renders
without throwing on first paint.

The test runs offline in ~1s.

## How to run it

```bash
cd pwa
npm run test:journey        # the journey file
npm test                    # all unit tests
npm run test:all            # journey + unit
```

## Why this exists

Unit tests cover one component at a time. They don't catch "you
broke the tab bar" or "Home no longer renders". This file mounts
the real `<App />` and walks it like a user would.

If you break this test, a refactor that compiled and passed its
unit tests still broke the actual user experience. The journey test
is the lowest-fidelity safety net for that.

## Why so few assertions

A journey test with 200 micro-assertions would be brittle. This one
has two:

1. **`never throws on first paint with the network stubbed`** — The
   app boots. If a new hook relies on `window.matchMedia` /
   `IntersectionObserver` / `IndexedDB`, the stub setup catches it.

2. **`mounts, lands on Home, then taps through every main tab`** —
   Every tab is reachable from Home. If a new tab is mis-navigated
   or a tab crash-loops on tap, this fails. Asserted via the CSS
   class on the `<section>` element (e.g., `home-section`,
   `log-section`) which is the section's stable DOM identity.

When a new journey shape appears in the wild (e.g., "scan a meal"),
add a new `*.journey.test.tsx` file in this directory and append
the test name to the script `test:journey` in `package.json`.

## File layout

```
pwa/src/__journey__/
  setup.ts                        # jsdom polyfills (matchMedia)
  core-checkin.journey.test.tsx   # end-to-end smoke
  scan-add-food.journey.test.tsx  # (when written)
  ...
```

## How this got here

The `commit 1c0aed6` rollout followed the audit at
`docs/hermes-loop/QUALITY-AUDIT.md`. The audit identified that
**agent-authored commits had no enforced end-to-end coverage**, so
despite shipping 38 commits between `f1f9ff7` and `1c0aed6`, there
was no test that walked the user path those commits collectively
shaped. That's the gap this file closes.

The `RITUAL.md` files for `worker-relay` and `ux-relay` now require
`npm run test:journey` in Phase 5 for any `feat:` or `ui-*` commit.
The agent must attach a `test:journey: N passed` line in the commit
body. The loop's dispatcher re-reads RITUAL.md on every tick, so
the rule is live immediately.

## Rollback procedure

If a journey test fails and a fix is not yet ready:

1. **Don't merge.** The RITUAL rule treats this as a regression.
2. Either:
   - Fix the App to pass the journey (preferred).
   - Mark the failing assertion with `it.skip` and add a TODO in
     `STATE.md` IN_PROGRESS row. The next worker that picks it up
     un-skips.

## Known gaps

- **No screenshot capture.** The RITUAL rule verifies state, not
  pixels. A visual regression would still need a Playwright/visual
  test. That's a future-cost item.
- **No real network.** `useServerStatus` is stubbed to `/health`
  returning `{ok: true}` and `/oauth/google/status` returning
  `{connected: false}`. A change to either path that relies on a
  different response shape will not be caught here.
- **No keyboard navigation.** Tap-based interaction only. A
  `user-event`-driven keyboard-equivalent test would close that.
