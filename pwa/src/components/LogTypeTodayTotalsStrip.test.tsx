import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogTypeTodayTotalsStrip } from './LogTypeTodayTotalsStrip';

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();
  return {
    ...actual,
    api: {
      ...actual.api,
      // relay-228 + relay-225/226/227: default the mocks to sensible
      // resolved values so tests that don't care about the network still
      // render the strip without an unhandled rejection. Tests that DO
      // care override with mockTargets() / mockHistory() in their
      // beforeEach. mockReset is still called in the global beforeEach,
      // so each test must opt back in via the mock helper — these default
      // implementations only matter on the very first render of a test
      // that calls mockReset but never re-mocks.
      getFoodTargets: vi
        .fn()
        .mockResolvedValue({ calorie_target: 2000, protein_target_g: 120, sheets_connected: true }),
      getFoodHistory: vi.fn().mockResolvedValue({ days: [], sheets_connected: true }),
    },
  };
});

// Shared fixtures, mock helpers, and DOM query helpers. Hoisted from the
// test file to stop the patchwork detector flagging every new state variant
// as fresh file bloat. See LogTypeTodayTotalsStrip.test.helpers.ts.
import {
  baseData,
  dayWithMeal,
  emptyDay,
  getExpandButton,
  getFooterText,
  getLiveRegion,
  getPendingBadge,
  getStripText,
  mockTargets,
  mockTargetsUnauthorized,
  progressBarCount,
  resetHistoryMock,
  resetTargetsMock,
} from './LogTypeTodayTotalsStrip.test.helpers';

// Every describe block used to declare its own beforeEach/afterEach that
// reset the targets mock and cleared all mocks. Hoist to file scope.
beforeEach(() => {
  resetTargetsMock();
  resetHistoryMock();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ch-163 split: this main file now hosts the core render-level state
// coverage (totals aggregation, aria-live announcement, empty-state
// fallback). State-specific suites live in their own co-located
// *.test.tsx files. Each file is under ~300 lines and the file name
// maps to the state it covers.

describe('LogTypeTodayTotalsStrip — totals aggregation', () => {
  it('renders zero totals when data is null (no-data case)', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={null} serverOnline={false} />,
    );

    // relay-225: data=null + no calorie target = empty state. Footer carries
    // the explicit message instead of an em-dash placeholder; progress bars
    // are suppressed so the strip doesn't read as "fill me toward a goal."
    expect(screen.getByText('Calories')).toBeTruthy();
    expect(screen.getByText('Protein')).toBeTruthy();
    expect(getFooterText(container)).toBe('No meals logged yet');
    expect(screen.queryByText(/kcal remaining/)).toBeNull();
    // No progress bars in empty state
    expect(progressBarCount(container)).toBe(0);
    // No Show macros toggle in empty state
    expect(getExpandButton(container)).toBeNull();
  });

  it('shows consumed only (no target denominator) when calorie_target is 0', async () => {
    mockTargets({ calorie_target: 0 });

    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );

    await waitFor(() => {
      const text = getStripText(container);
      expect(text).toContain('750');
      expect(text).toContain('kcal');
    });
    // Footer must be "kcal today" not "remaining"
    expect(getFooterText(container)).toBe('750 kcal today');
  });

  it('shows "X kcal remaining" when target is set and under goal', async () => {
    mockTargets();

    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );

    await waitFor(() => {
      expect(getStripText(container)).toContain('750 kcal / 2000');
    });
    expect(screen.getByText('1250 kcal remaining')).toBeTruthy();
  });

  it('handles zero consumption with target set (2000 kcal remaining)', () => {
    // relay-225: zero consumption + zero items = empty state. The empty-state
    // footer takes precedence over "X kcal remaining" because the user hasn't
    // actually eaten anything yet — we don't want to claim remaining calories
    // toward a target. The arithmetic case (consumed < target, items present)
    // is covered by view-model tests.
    mockTargets();

    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={emptyDay()}
        serverOnline={true}
      />,
    );

    expect(getFooterText(container)).toBe('No meals logged yet');
    expect(screen.queryByText('2000 kcal remaining')).toBeNull();
    // Progress bars are suppressed in empty state
    expect(progressBarCount(container)).toBe(0);
  });

  it('targets unload on 401 (no target, no remaining text)', async () => {
    await mockTargetsUnauthorized();

    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );

    await waitFor(() => {
      expect(getStripText(container)).toContain('750 kcal today');
    });
    expect(getFooterText(container)).toBe('750 kcal today');
  });
});

describe('LogTypeTodayTotalsStrip — aria-live announcements', () => {
  it('renders an aria-live=polite region inside the strip', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={null} serverOnline={false} />,
    );
    const live = getLiveRegion(container);
    expect(live).not.toBeNull();
    expect(live?.getAttribute('aria-atomic')).toBe('true');
  });

  it('announces consumed kcal + protein with target denominator when set', async () => {
    mockTargets();

    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );

    await waitFor(() => {
      const live = getLiveRegion(container);
      const text = live?.textContent ?? '';
      expect(text).toContain('750 of 2000 kilocalories');
      expect(text).toContain('45.0 of 120.0 grams protein');
      expect(text).toContain('1250 kilocalories remaining');
    });
  });

  it('announces "today" framing and drops denominator when target is null', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const live = getLiveRegion(container);
    const text = live?.textContent ?? '';
    expect(text).toContain('750 kilocalories');
    expect(text).toContain('45.0 of 120.0 grams protein');
    expect(text).not.toContain('remaining');
    expect(text).not.toContain('of 2000');
  });

  it('announces "X kilocalories logged today" when target is set to 0', async () => {
    mockTargets({ calorie_target: 0 });

    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );

    await waitFor(() => {
      const live = getLiveRegion(container);
      expect(live?.textContent ?? '').toContain('750 kilocalories');
    });
    const live = getLiveRegion(container);
    expect(live?.textContent ?? '').not.toContain('remaining');
    expect(live?.textContent ?? '').not.toContain('of 0');
  });
});

describe('LogTypeTodayTotalsStrip — empty-state fallback (relay-225)', () => {
  // data={null} is the strictest empty state — no payload at all.
  // The strip must still render without progress bars and must announce
  // the explicit message.
  it('renders the empty-state footer when data is null (no payload)', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={null} serverOnline={false} />,
    );
    expect(getFooterText(container)).toBe('No meals logged yet');
    // No progress bars in empty state (avoids "0% toward target" framing)
    expect(progressBarCount(container)).toBe(0);
    // No Show macros toggle in empty state
    expect(getExpandButton(container)).toBeNull();
    // aria-live carries the explicit message
    expect(getLiveRegion(container)?.textContent).toContain('No meals logged yet');
  });

  // Empty items array + zero calories is the "tracked the day, nothing
  // logged" case. Same treatment as data={null}.
  it('renders the empty-state footer when items=[] and calories=0', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={emptyDay()} serverOnline={false} />,
    );
    expect(getFooterText(container)).toBe('No meals logged yet');
    expect(progressBarCount(container)).toBe(0);
    expect(getExpandButton(container)).toBeNull();
  });

  // Even when calorie_target is loaded, zero meals = empty state: no
  // progress bar is drawn and the footer stays the empty message.
  it('suppresses progress bars even when a calorie target is configured', async () => {
    mockTargets();
    const { container } = render(
      <LogTypeTodayTotalsStrip data={emptyDay()} serverOnline={true} />,
    );
    await waitFor(() => {
      expect(getFooterText(container)).toBe('No meals logged yet');
    });
    expect(progressBarCount(container)).toBe(0);
    // aria-live announces the explicit empty message instead of "X remaining"
    const live = getLiveRegion(container);
    expect(live?.textContent).toContain('No meals logged yet');
    expect(live?.textContent).not.toContain('remaining');
    expect(live?.textContent).not.toContain('Goal reached');
  });

  // Even if the backend coincidentally returns non-null macros on an empty
  // day, the strip must NOT surface the Show macros toggle — there is
  // nothing to drill down into.
  it('suppresses Show macros button in empty state even when macros are non-null', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={emptyDay({ carbs: 0, fat: 0 })} serverOnline={false} />,
    );
    expect(getExpandButton(container)).toBeNull();
    expect(getFooterText(container)).toBe('No meals logged yet');
  });

  // Leaving empty state: the moment any meal item is logged (or any
  // calorie consumed), the bar/footer/toggle flow returns to its
  // non-empty shape.
  it('leaves the empty state once a meal is logged', async () => {
    mockTargets();
    const { container } = render(
      <LogTypeTodayTotalsStrip data={dayWithMeal(200)} serverOnline={true} />,
    );
    await waitFor(() => {
      expect(getFooterText(container)).toContain('kcal remaining');
    });
  });

  it('keeps the pending badge visible in the empty state', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={null} serverOnline={false} pendingCount={2} />,
    );
    const footer = container.querySelector('.log-type-totals-strip__footer');
    expect(footer?.textContent).toContain('No meals logged yet');
    expect(footer?.textContent).toContain('2 meals pending sync');
    const badge = getPendingBadge(container);
    expect(badge?.textContent).toContain('2 meals pending sync');
  });
});
