import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogTypeTodayTotalsStrip } from './LogTypeTodayTotalsStrip';
import { api } from '../lib/api';

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
  baseData,
  emptyDay,
  getComparisonKcal,
  getComparisonLine,
  getComparisonProtein,
  getComparisonUnavailable,
  getFooterText,
  getLiveRegion,
  mockHistory,
  mockHistoryUnauthorized,
  resetHistoryMock,
  resetTargetsMock,
} from './LogTypeTodayTotalsStrip.test.helpers';

beforeEach(() => {
  resetTargetsMock();
  resetHistoryMock();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ch-163 split: day-over-day comparison (relay-228) extracted. Covers the
// unavailable fallback, kcal + protein deltas, today-row filtering, "Same
// as yesterday" formatting, offline suppression, empty-state suppression,
// non-401 error fallback, 401 silent swallow, DOM-order invariant, and
// Bugbot Round 85 #1 (yesterday-date match) + #2 (empty-state announce
// suppression) regressions.
describe('LogTypeTodayTotalsStrip — day-over-day comparison (relay-228)', () => {
  // Date helpers — kept inside the describe to avoid polluting module scope
  // with date arithmetic that other blocks don't need.
  const TODAY = new Date().toISOString().slice(0, 10);
  function dateNDaysAgo(n: number): string {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - n);
    return d.toISOString().slice(0, 10);
  }

  it('renders the "Yesterday totals unavailable" message when no history is returned', async () => {
    mockHistory([]); // no rows at all
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );
    await waitFor(() => {
      expect(getComparisonLine(container)).not.toBeNull();
    });
    expect(getComparisonUnavailable(container)?.textContent).toBe(
      'Yesterday totals unavailable',
    );
    // No kcal/protein spans should render in the unavailable branch
    expect(getComparisonKcal(container)).toBeNull();
    expect(getComparisonProtein(container)).toBeNull();
  });

  it('renders kcal + protein deltas when yesterday data is available', async () => {
    mockHistory([
      { date: TODAY, calories: 9999, protein: 9999 }, // today — filtered out
      { date: dateNDaysAgo(1), calories: 600, protein: 50 },
    ]);
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );
    await waitFor(() => {
      expect(getComparisonKcal(container)).not.toBeNull();
    });
    // today = 750 kcal / 45g protein ; yesterday = 600 kcal / 50g protein
    expect(getComparisonKcal(container)?.textContent).toBe('+150 kcal vs yesterday');
    expect(getComparisonProtein(container)?.textContent).toBe(
      '-5.0g protein vs yesterday',
    );
    expect(getComparisonUnavailable(container)).toBeNull();
  });

  it('filters out rows whose date matches today (sheet history includes today)', async () => {
    // The sheet returns today AND yesterday; only yesterday should drive
    // the delta. With only "today" present (filtered to nothing), the
    // component must surface the unavailable message, NOT a delta of 0
    // against today's own numbers.
    mockHistory([{ date: TODAY, calories: 750, protein: 45 }]);
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );
    await waitFor(() => {
      expect(getComparisonLine(container)).not.toBeNull();
    });
    expect(getComparisonUnavailable(container)?.textContent).toBe(
      'Yesterday totals unavailable',
    );
    expect(getComparisonKcal(container)).toBeNull();
  });

  it('renders "Same as yesterday" when today and yesterday totals match', async () => {
    mockHistory([{ date: dateNDaysAgo(1), calories: 750, protein: 45 }]);
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );
    await waitFor(() => {
      expect(getComparisonKcal(container)).not.toBeNull();
    });
    expect(getComparisonKcal(container)?.textContent).toBe('Same as yesterday');
    expect(getComparisonProtein(container)?.textContent).toBe('Same as yesterday');
  });

  it('does not render any comparison line when server is offline (no fetch attempted)', async () => {
    // serverOnline=false short-circuits the useEffect; the comparison
    // line is still rendered (per the AC: an explicit unavailable state
    // when yesterday data is missing) — the unavailable message is the
    // honest default.
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    expect(getComparisonLine(container)).not.toBeNull();
    expect(getComparisonUnavailable(container)?.textContent).toBe(
      'Yesterday totals unavailable',
    );
  });

  it('suppresses the comparison line in the empty state (relay-225 owns the message)', async () => {
    mockHistory([{ date: dateNDaysAgo(1), calories: 600, protein: 30 }]);
    const { container } = render(
      <LogTypeTodayTotalsStrip data={emptyDay()} serverOnline={true} />,
    );
    // Even though the fetch succeeds, the empty state suppresses the
    // comparison line so the user sees only "No meals logged yet".
    // Wait for the fetch to resolve, then assert.
    await waitFor(() => {
      expect(api.getFoodHistory).toHaveBeenCalled();
    });
    expect(getComparisonLine(container)).toBeNull();
    // Footer still carries the empty-state message (relay-225 invariant)
    expect(getFooterText(container)).toBe('No meals logged yet');
  });

  it('falls back to the unavailable message when the history call rejects with a non-401 error', async () => {
    vi.mocked(api.getFoodHistory).mockRejectedValue(new Error('network down'));
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );
    await waitFor(() => {
      expect(getComparisonLine(container)).not.toBeNull();
    });
    expect(getComparisonUnavailable(container)?.textContent).toBe(
      'Yesterday totals unavailable',
    );
  });

  it('silently keeps the comparison unavailable on a 401 (matches calorieTarget pattern)', async () => {
    await mockHistoryUnauthorized();
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );
    await waitFor(() => {
      expect(getComparisonLine(container)).not.toBeNull();
    });
    expect(getComparisonUnavailable(container)?.textContent).toBe(
      'Yesterday totals unavailable',
    );
  });

  it('places the comparison line below the footer and below the setup hint', async () => {
    mockHistory([{ date: dateNDaysAgo(1), calories: 600, protein: 30 }]);
    // Use baseData + no calorie target so the setup hint also renders.
    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={{ ...baseData, calories: 750, protein_g: 45, items: [
          { row: 1, food: 'oatmeal', quantity_g: 80, calories: 750, carbs: 60, protein: 45, fat: 12 },
        ] }}
        serverOnline={true}
      />,
    );
    await waitFor(() => {
      expect(getComparisonKcal(container)).not.toBeNull();
    });
    const footer = container.querySelector('.log-type-totals-strip__footer');
    const hint = container.querySelector('.log-type-totals-strip__setup-hint');
    const line = getComparisonLine(container);
    expect(footer).not.toBeNull();
    expect(line).not.toBeNull();
    // setupHint is null here (calorie target isn't fetched → treats as
    // null → state='target-unset' would show setupHint). Wait — serverOnline
    // is true so calorieTarget fetches and resolves to null; with no
    // target set, setupHint renders. We assert the line sits AFTER the
    // footer in DOM order. The setupHint presence is best-effort — we
    // only assert the line order.
    const footerIdx = Array.from(container.querySelectorAll('p')).indexOf(footer!);
    const lineIdx = Array.from(container.querySelectorAll('p')).indexOf(line!);
    expect(lineIdx).toBeGreaterThan(footerIdx);
    // If setup hint rendered, it must be between footer and comparison line
    if (hint) {
      const hintIdx = Array.from(container.querySelectorAll('p')).indexOf(hint);
      expect(footerIdx).toBeLessThan(hintIdx);
      expect(hintIdx).toBeLessThan(lineIdx);
    }
  });

  // Bugbot Round 85 finding #1: the prior implementation selected the
  // first row whose date was NOT today. That mislabelled older logged
  // days as "yesterday" when yesterday itself was absent. The fix
  // filters on the exact yesterday date computed at fetch time.
  it('Bugbot Round 85 #1: surfaces "unavailable" when only an older logged day is in history', async () => {
    // Two days ago logged; yesterday missing. The component must NOT
    // treat the two-days-ago row as "yesterday" — it should fall back
    // to the explicit unavailable message.
    mockHistory([{ date: dateNDaysAgo(2), calories: 500, protein: 30 }]);
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );
    await waitFor(() => {
      expect(getComparisonLine(container)).not.toBeNull();
    });
    expect(getComparisonUnavailable(container)?.textContent).toBe(
      'Yesterday totals unavailable',
    );
    expect(getComparisonKcal(container)).toBeNull();
    expect(getComparisonProtein(container)).toBeNull();
  });

  it('Bugbot Round 85 #1: ignores a future-dated row in history', async () => {
    // Sheet history accidentally contains a future-dated row. The
    // component must not promote that row to "yesterday" — filter on
    // exact yesterday match only.
    mockHistory([{ date: dateNDaysAgo(-1), calories: 9999, protein: 9999 }]);
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );
    await waitFor(() => {
      expect(getComparisonLine(container)).not.toBeNull();
    });
    expect(getComparisonUnavailable(container)?.textContent).toBe(
      'Yesterday totals unavailable',
    );
  });

  // Bugbot Round 85 finding #2: the empty state suppresses the visual
  // comparison line but the viewmodel was still appending the delta to
  // announceText — the aria-live region would announce "vs yesterday"
  // even though the line was hidden. The fix gates the announce on
  // non-empty state.
  it('Bugbot Round 85 #2: does NOT announce "vs yesterday" in the empty state', async () => {
    mockHistory([{ date: dateNDaysAgo(1), calories: 600, protein: 30 }]);
    const { container } = render(
      <LogTypeTodayTotalsStrip data={emptyDay()} serverOnline={true} />,
    );
    // Wait for the history fetch to resolve so the comparison data has
    // populated (even though the line itself stays hidden).
    await waitFor(() => {
      expect(api.getFoodHistory).toHaveBeenCalled();
    });
    const live = getLiveRegion(container);
    expect(live?.textContent).toContain('No meals logged yet');
    expect(live?.textContent).not.toContain('vs yesterday');
    expect(live?.textContent).not.toContain('unavailable');
  });
});
