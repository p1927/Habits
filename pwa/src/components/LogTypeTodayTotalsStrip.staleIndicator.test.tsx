import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogTypeTodayTotalsStrip } from './LogTypeTodayTotalsStrip';

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();
  return {
    ...actual,
    api: {
      ...actual.api,
      getFoodTargets: vi
        .fn()
        .mockResolvedValue({ calorie_target: 2000, protein_target_g: 120, sheets_connected: true }),
      getFoodHistory: vi.fn().mockResolvedValue({ days: [], sheets_connected: true }),
    },
  };
});

import {
  dayWithMeal,
  emptyDay,
  getFooterText,
  getLiveRegion,
  getStaleIndicator,
  mockTargets,
  resetHistoryMock,
  resetTargetsMock,
} from './LogTypeTodayTotalsStrip.test.helpers';

beforeEach(() => {
  resetTargetsMock();
  resetHistoryMock();
  // Default each test to real timers so `waitFor` (which uses real
  // setTimeout under the hood) does not hang. Tests that need to
  // advance the interval switch to fake timers locally and restore
  // them in their own finally block.
  vi.useRealTimers();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

// ch-163 split: stale-data indicator (relay-231) extracted. Covers the
// first-paint "Just updated" rendering, the 15s interval tick transition,
// the 60s fresh→stale boundary, the offline variant, the empty-state
// suppression, the restamp-on-new-payload invariant, and the no-leak
// into the aria-live region.
describe('LogTypeTodayTotalsStrip — stale-data indicator (relay-231)', () => {
  it('renders "Just updated" on first paint when the server is online', async () => {
    mockTargets({ calorie_target: 2000 });
    const { container } = render(
      <LogTypeTodayTotalsStrip data={dayWithMeal(750)} serverOnline={true} />,
    );
    await waitFor(() => {
      expect(getStaleIndicator(container)).not.toBeNull();
    });
    expect(getStaleIndicator(container)?.textContent).toBe('Just updated');
    // The kind modifier class is wired through so CSS can distinguish
    // the offline variant (italic + slightly stronger muted colour).
    expect(
      getStaleIndicator(container)?.className.includes('log-type-totals-strip__stale--fresh'),
    ).toBe(true);
  });

  it('updates the relative time after the 15s tick interval fires', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-08-04T12:00:00Z'));
      mockTargets({ calorie_target: 2000 });
      const { container } = render(
        <LogTypeTodayTotalsStrip data={dayWithMeal(750)} serverOnline={true} />,
      );
      // The component captures Date.now() synchronously on first render,
      // so the indicator is present immediately without needing waitFor.
      expect(getStaleIndicator(container)).not.toBeNull();
      expect(getStaleIndicator(container)?.textContent).toBe('Just updated');
      // Advance ONLY the wall clock by 12s (setSystemTime with delta) and
      // then fire the 15s interval so the component re-renders and reads
      // the new Date.now(). The interval fires once at t=15s; after that
      // Date.now() returns 12s (relative to the captured timestamp)
      // because we set the system time and then advanced the interval
      // (which advances by an additional 15s on top, putting the wall
      // clock at 15s + 12s = 27s). For the test we only care that the
      // seconds bucket kicked in (text starts with "Updated"), not the
      // exact second count — that precision is covered by the unit test
      // for formatRelativeUpdatedAt.
      vi.setSystemTime(new Date('2026-08-04T12:00:12Z'));
      // Wrap the timer advance in act() so the setFreshnessTick state
      // update flushes and the component re-renders synchronously under
      // fake timers.
      act(() => {
        vi.advanceTimersByTime(15_000);
      });
      // The wall clock now sits at +27s relative to capture (setSystemTime
      // puts it at +12s; advanceTimersByTime adds +15s). We only assert
      // that the indicator transitioned out of the "Just updated" bucket.
      expect(getStaleIndicator(container)?.textContent).toMatch(/^Updated \d+s ago$/);
    } finally {
      vi.useRealTimers();
    }
  });

  it('transitions to the stale variant after the freshness window elapses', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-08-04T12:00:00Z'));
      mockTargets({ calorie_target: 2000 });
      const { container } = render(
        <LogTypeTodayTotalsStrip data={dayWithMeal(750)} serverOnline={true} />,
      );
      expect(getStaleIndicator(container)).not.toBeNull();
      // Jump past the 60s freshness boundary and tick the interval so
      // the component re-reads Date.now().
      vi.setSystemTime(new Date('2026-08-04T12:02:30Z'));
      act(() => {
        vi.advanceTimersByTime(15_000);
      });
      const node = getStaleIndicator(container);
      expect(node?.textContent).toBe('Updated 2m ago');
      expect(node?.className.includes('log-type-totals-strip__stale--stale')).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders "Showing offline totals" when serverOnline is false but data is still on screen', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-08-04T12:00:00Z'));
      mockTargets({ calorie_target: 2000 });
      const { container } = render(
        <LogTypeTodayTotalsStrip data={dayWithMeal(750)} serverOnline={false} />,
      );
      expect(getStaleIndicator(container)).not.toBeNull();
      const node = getStaleIndicator(container);
      expect(node?.textContent).toBe('Showing offline totals');
      expect(node?.className.includes('log-type-totals-strip__stale--offline')).toBe(true);
      // The aria-live region must NOT include the stale text — it
      // updates on a 15s interval and would be noisy for screen readers.
      expect(getLiveRegion(container)?.textContent ?? '').not.toContain(
        'Showing offline totals',
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not render an indicator in the empty state (relay-225 owns the message)', () => {
    // Empty payload (calories=0, no items) + server online → no stale
    // line. The footer carries "No meals logged yet" and the strip
    // already communicates "there is nothing to time-stamp".
    const { container } = render(
      <LogTypeTodayTotalsStrip data={emptyDay()} serverOnline={true} />,
    );
    expect(getStaleIndicator(container)).toBeNull();
    expect(getFooterText(container)).toBe('No meals logged yet');
  });

  it('restamps the timestamp when a new data payload arrives', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-08-04T12:00:00Z'));
      mockTargets({ calorie_target: 2000 });
      const { container, rerender } = render(
        <LogTypeTodayTotalsStrip data={dayWithMeal(750)} serverOnline={true} />,
      );
      expect(getStaleIndicator(container)).not.toBeNull();
      expect(getStaleIndicator(container)?.textContent).toBe('Just updated');
      // Advance time, then mount a new payload — the captured
      // Date.now() must update so the next render reads "Just updated"
      // rather than the stale carry-over from the previous render.
      vi.setSystemTime(new Date('2026-08-04T12:05:00Z'));
      // Wrap the rerender in act() so the data-changed useEffect fires
      // and the captured Date.now() (in the ref) updates to the new
      // wall-clock value. The effect commit + the subsequent render
      // both happen inside this act() call.
      act(() => {
        rerender(
          <LogTypeTodayTotalsStrip data={dayWithMeal(900)} serverOnline={true} />,
        );
      });
      // Immediately after the rerender, freshnessMs is computed from
      // Date.now() (the new wall-clock value) minus the freshly-
      // captured timestamp — so the indicator should read "Just updated".
      expect(getStaleIndicator(container)?.textContent).toBe('Just updated');
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not duplicate the indicator inside the aria-live region', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-08-04T12:00:00Z'));
      mockTargets({ calorie_target: 2000 });
      const { container } = render(
        <LogTypeTodayTotalsStrip data={dayWithMeal(750)} serverOnline={true} />,
      );
      expect(getStaleIndicator(container)).not.toBeNull();
      const live = getLiveRegion(container);
      expect(live).not.toBeNull();
      // The relative-time string must NOT leak into the polite announce
      // region: it ticks every 15s and would re-announce on every
      // update, which is hostile to screen reader users.
      expect(live?.textContent ?? '').not.toContain('Just updated');
      expect(live?.textContent ?? '').not.toContain('Showing offline totals');
    } finally {
      vi.useRealTimers();
    }
  });
});
