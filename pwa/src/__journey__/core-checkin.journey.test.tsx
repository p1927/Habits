/**
 * End-to-end journey test: open the app, tab through every section,
 * assert that the user actually gets to the screen they tapped on.
 *
 * Why this exists: feature commits land with unit tests, but no
 * committed test walks the user through Home -> Log -> Day -> Cards.
 * This is the single source of truth for "does the app still navigate
 * after my change".
 *
 * Run:
 *   npm test -- src/__journey__/core-checkin.journey.test.tsx
 *   npm run test:journey       # all *.journey.test.tsx
 *
 * Conventions enforced by the agent ritual:
 *  - any feat: commit must include a passing journey-test invocation in
 *    its commit body. See docs/window-instances/worker-relay/RITUAL.md.
 */
import React from 'react';
import { render, screen, waitFor, act, fireEvent, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

// ---------- network stubs ----------
// useServerStatus pings /health and /oauth/google/status. Stub both so
// the journey test runs offline and never blocks on a real server.
const originalFetch = globalThis.fetch;
function stubNetwork() {
  globalThis.fetch = vi.fn(async (url: RequestInfo | URL) => {
    const u = typeof url === 'string' ? url : (url as URL).toString();
    if (u.endsWith('/health')) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (u.includes('/oauth/google/status')) {
      return new Response(JSON.stringify({ connected: false }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof globalThis.fetch;
}
function restoreNetwork() {
  globalThis.fetch = originalFetch;
}
beforeEach(() => {
  stubNetwork();
});
afterEach(() => {
  restoreNetwork();
});

// ---------- helpers ----------
/**
 * Find the bottom app tab bar (the <nav aria-label="Main">). All tab
 * queries are scoped to within() this nav so we never collide with
 * other elements that contain "Log"/"Day"/"Cards" elsewhere on the
 * page (form fields, modal titles, etc).
 */
async function mainTabBar() {
  return await screen.findByRole('navigation', { name: 'Main' });
}

async function tapTab(label: string) {
  const nav = await mainTabBar();
  const btn = within(nav).getByRole('button', { name: new RegExp(`^${label}$`, 'i') });
  fireEvent.click(btn);
}

/**
 * Each section renders <section className="section log-section"
 * aria-labelledby="log-heading">. We assert that the visible section
 * carries the expected class. (We can't always rely on a heading
 * element — Home and Day currently lack one — so we use the class.)
 */
async function expectActiveSection(className: string) {
  await waitFor(
    () => {
      const sec = document.querySelector(`section.${className}`);
      expect(sec).toBeTruthy();
    },
    { timeout: 2000 },
  );
}

// ===========================================================================
//                                Tests
// ===========================================================================

describe('core journey — every section is reachable from Home', () => {
  it('mounts, lands on Home, then taps through every main tab', async () => {
    render(<App />);

    // 1. Boot: there's a <main>, and the main tabs are present.
    expect(screen.getByRole('main')).toBeTruthy();
    const nav = await mainTabBar();
    expect(within(nav).getByRole('button', { name: /^home$/i })).toBeTruthy();
    expect(within(nav).getByRole('button', { name: /^log$/i })).toBeTruthy();
    expect(within(nav).getByRole('button', { name: /^day$/i })).toBeTruthy();
    expect(within(nav).getByRole('button', { name: /^cards$/i })).toBeTruthy();

    // 2. We start on Home.
    await expectActiveSection('home-section');

    // 3. Hop to Log.
    await act(async () => {
      await tapTab('Log');
    });
    await expectActiveSection('log-section');

    // 4. Hop to Day.
    await act(async () => {
      await tapTab('Day');
    });
    await expectActiveSection('day-section');

    // 5. Hop to Cards.
    await act(async () => {
      await tapTab('Cards');
    });
    await expectActiveSection('cards-section');

    // 6. Back to Home — the assertion every commit should keep alive.
    await act(async () => {
      await tapTab('Home');
    });
    await expectActiveSection('home-section');
  });

  it('never throws on first paint with the network stubbed', async () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
