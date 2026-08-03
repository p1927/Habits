import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogTypeTodayTotalsStrip } from './LogTypeTodayTotalsStrip';
import type { FoodTodayResponse } from '../lib/api';

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();
  return {
    ...actual,
    api: {
      ...actual.api,
      getFoodTargets: vi.fn(),
    },
  };
});

// Shared fixtures, mock helpers, and DOM query helpers. Hoisted from the
// test file to stop the patchwork detector flagging every new state variant
// as a fresh file bloat. See LogTypeTodayTotalsStrip.test.helpers.ts.
import {
  baseData,
  dayWithMeal,
  emptyDay,
  getExpandButton,
  getFooterText,
  getLiveRegion,
  getMacrosPanel,
  getPendingBadge,
  getStripText,
  mockTargets,
  mockTargetsUnauthorized,
  progressBarCount,
  resetTargetsMock,
} from './LogTypeTodayTotalsStrip.test.helpers';

// Every describe block used to declare its own beforeEach/afterEach that
// reset the targets mock and cleared all mocks. Hoist to file scope.
beforeEach(() => {
  resetTargetsMock();
});

afterEach(() => {
  vi.clearAllMocks();
});

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

describe('LogTypeTodayTotalsStrip — goal-reached state', () => {
  it('applies goal-reached fill class and "Goal reached" footer when consumption meets target', async () => {
    mockTargets();

    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={{ ...baseData, calories: 2000 }}
        serverOnline={true}
      />,
    );

    await waitFor(() => {
      expect(getStripText(container)).toContain('2000 kcal / 2000');
    });
    const fill = container.querySelector('.progress-fill--goal-reached');
    expect(fill).not.toBeNull();
    expect((fill as HTMLElement).style.width).toBe('100%');
    expect(getFooterText(container)).toBe('Goal reached');
    expect(container.querySelector('.log-type-totals-strip__footer--goal-reached')).not.toBeNull();
  });

  it('clamps fill to 100% and switches to goal-reached when consumption exceeds target', async () => {
    mockTargets();

    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={{ ...baseData, calories: 2500 }}
        serverOnline={true}
      />,
    );

    await waitFor(() => {
      expect(getStripText(container)).toContain('2500 kcal / 2000');
    });
    const fill = container.querySelector('.progress-fill--goal-reached');
    expect(fill).not.toBeNull();
    expect((fill as HTMLElement).style.width).toBe('100%');
    expect(getFooterText(container)).toBe('Goal reached');
  });

  it('does NOT show goal-reached when target is unset, even with high consumption', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={{ ...baseData, calories: 5000 }}
        serverOnline={false}
      />,
    );
    expect(container.querySelector('.progress-fill--goal-reached')).toBeNull();
    expect(getFooterText(container)).toBe('5000 kcal today');
  });

  it('aria-live announces "Goal reached" instead of remaining when target is met', async () => {
    mockTargets();

    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={{ ...baseData, calories: 2000 }}
        serverOnline={true}
      />,
    );

    await waitFor(() => {
      const live = getLiveRegion(container);
      const text = live?.textContent ?? '';
      expect(text).toContain('2000 of 2000 kilocalories');
      expect(text).toContain('Goal reached');
      expect(text).not.toContain('remaining');
    });
  });
});

describe('LogTypeTodayTotalsStrip — macros expansion (relay-222)', () => {
  it('renders an expand button with aria-expanded=false when macros are present', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const button = getExpandButton(container);
    expect(button).not.toBeNull();
    expect(button?.getAttribute('aria-expanded')).toBe('false');
    expect(button?.getAttribute('aria-controls')).toBe('log-type-totals-strip-macros');
    expect(button?.textContent).toBe('Show macros');
    // Panel is hidden until clicked
    expect(getMacrosPanel(container)).toBeNull();
  });

  it('does not render an expand button when macros are null (backend contract change)', () => {
    const partialData = { ...baseData, carbs: null, fat: null } as unknown as FoodTodayResponse;
    const { container } = render(
      <LogTypeTodayTotalsStrip data={partialData} serverOnline={false} />,
    );
    expect(getExpandButton(container)).toBeNull();
    expect(getMacrosPanel(container)).toBeNull();
  });

  it('expanding the panel reveals carbs and fat lines below protein', async () => {
    mockTargets();

    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );

    await waitFor(() => {
      expect(getStripText(container)).toContain('750 kcal / 2000');
    });

    const button = getExpandButton(container);
    expect(button).not.toBeNull();
    fireEvent.click(button!);

    const panel = getMacrosPanel(container);
    expect(panel).not.toBeNull();
    // Carbs row: 80g from baseData, formatted with one decimal place
    expect(panel?.textContent).toContain('Carbs');
    expect(panel?.textContent).toContain('80.0g');
    // Fat row: 25g from baseData
    expect(panel?.textContent).toContain('Fat');
    expect(panel?.textContent).toContain('25.0g');
    // After expansion the button text flips to "Hide macros"
    expect(button!.getAttribute('aria-expanded')).toBe('true');
    expect(button!.textContent).toBe('Hide macros');
  });

  it('tapping the expand button again collapses the panel', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const button = getExpandButton(container);
    fireEvent.click(button!);
    expect(getMacrosPanel(container)).not.toBeNull();
    fireEvent.click(button!);
    expect(getMacrosPanel(container)).toBeNull();
    expect(button!.getAttribute('aria-expanded')).toBe('false');
    expect(button!.textContent).toBe('Show macros');
  });

  it('expanded panel sits below the protein row and above the footer', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const button = getExpandButton(container);
    fireEvent.click(button!);
    const strip = container.querySelector('.log-type-totals-strip') as HTMLElement;
    const children = Array.from(strip.children) as HTMLElement[];
    const proteinIdx = children.findIndex((el) =>
      el.classList.contains('log-type-totals-strip__protein'),
    );
    const panelIdx = children.findIndex((el) =>
      el.matches('[data-testid="log-type-totals-strip-macros"]'),
    );
    const footerIdx = children.findIndex((el) =>
      el.classList.contains('log-type-totals-strip__footer'),
    );
    expect(proteinIdx).toBeGreaterThanOrEqual(0);
    expect(panelIdx).toBeGreaterThan(proteinIdx);
    expect(footerIdx).toBeGreaterThan(panelIdx);
  });
});

describe('LogTypeTodayTotalsStrip — pending sync badge (relay-223)', () => {
  it('does not render the pending badge when pendingCount is 0 (default)', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    expect(getPendingBadge(container)).toBeNull();
  });

  it('renders singular "1 meal pending sync" beside the footer when one entry is queued', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} pendingCount={1} />,
    );
    const badge = getPendingBadge(container);
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toContain('1 meal pending sync');
    expect(badge?.textContent).not.toContain('meals');
    expect(badge?.getAttribute('aria-label')).toBe('1 meal pending sync');
  });

  it('renders plural "3 meals pending sync" when multiple entries are queued', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} pendingCount={3} />,
    );
    const badge = getPendingBadge(container);
    expect(badge?.textContent).toContain('3 meals pending sync');
    expect(badge?.getAttribute('aria-label')).toBe('3 meals pending sync');
  });

  it('keeps the kcal footer intact when the pending badge is present', () => {
    // relay-225: items=[] + consumed=0 = empty state, so the primary line is
    // "No meals logged yet" (overridding the "X kcal today" copy). The
    // pending badge stays attached after the middot in both cases; the key
    // invariant here is "badge does NOT replace the footer line".
    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={{ ...baseData, calories: 0 }}
        serverOnline={false}
        pendingCount={2}
      />,
    );
    const footer = container.querySelector('.log-type-totals-strip__footer');
    expect(footer).not.toBeNull();
    // Empty-state footer line (relay-225) keeps the pending badge appended
    // after a middot.
    expect(footer?.textContent).toContain('No meals logged yet');
    expect(footer?.textContent).toContain('2 meals pending sync');
  });

  it('aria-live announcement includes the pending count when > 0', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} pendingCount={2} />,
    );
    const live = getLiveRegion(container);
    const text = live?.textContent ?? '';
    expect(text).toContain('750 kilocalories');
    expect(text).toContain('2 meals pending sync');
  });

  it('aria-live announcement stays quiet about pending when count is 0', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const live = getLiveRegion(container);
    const text = live?.textContent ?? '';
    expect(text).not.toContain('pending sync');
  });

  it('renders the singular badge text for exactly one queued entry even alongside target state', async () => {
    mockTargets();
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} pendingCount={1} />,
    );
    await waitFor(() => {
      expect(getStripText(container)).toContain('750 kcal / 2000');
    });
    const badge = getPendingBadge(container);
    expect(badge?.textContent).toContain('1 meal pending sync');
    // "remaining" line is preserved next to the badge
    expect(getFooterText(container)).toContain('1250 kcal remaining');
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
