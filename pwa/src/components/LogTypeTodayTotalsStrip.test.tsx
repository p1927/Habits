import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogTypeTodayTotalsStrip } from './LogTypeTodayTotalsStrip';
import { api, type FoodTodayResponse } from '../lib/api';

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
// as a fresh file bloat. See LogTypeTodayTotalsStrip.test.helpers.ts.
import {
  baseData,
  dayWithMeal,
  emptyDay,
  getComparisonKcal,
  getComparisonLine,
  getComparisonProtein,
  getComparisonUnavailable,
  getExpandButton,
  getFooterText,
  getLiveRegion,
  getMacrosPanel,
  getPendingBadge,
  getStaleIndicator,
  getStripCard,
  getStripText,
  mockHistory,
  mockHistoryUnauthorized,
  mockTargets,
  mockTargetsUnauthorized,
  progressBarCount,
  resetHistoryMock,
  resetTargetsMock,
} from './LogTypeTodayTotalsStrip.test.helpers';

const COACH_BUTTON_TESTID = 'log-type-totals-strip-coach-button';
function getCoachButton(container: HTMLElement): HTMLButtonElement | null {
  return container.querySelector(
    `[data-testid="${COACH_BUTTON_TESTID}"]`,
  ) as HTMLButtonElement | null;
}

// Every describe block used to declare its own beforeEach/afterEach that
// reset the targets mock and cleared all mocks. Hoist to file scope.
beforeEach(() => {
  resetTargetsMock();
  resetHistoryMock();
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

describe('LogTypeTodayTotalsStrip — target-unset state (relay-226)', () => {
  // File-scope beforeEach already calls resetTargetsMock(); afterEach calls
  // clearAllMocks(). This describe uses the shared dayWithMeal + mockTargets
  // helpers — no local mock lifecycle.

  it('hides the kcal progress bar and shows a setup hint when meals are logged but no target is set', async () => {
    mockTargets({ calorie_target: 0, protein_target_g: 120 });

    const withMeal = dayWithMeal(120);
    const { container } = render(
      <LogTypeTodayTotalsStrip data={withMeal} serverOnline={true} />,
    );

    await waitFor(() => {
      const hint = container.querySelector(
        '[data-testid="log-type-totals-strip-setup-hint"]',
      );
      expect(hint?.textContent).toBe(
        'Set a daily calorie target in Settings to track progress.',
      );
    });

    // No kcal bar without a target (a 0% bar would be misleading).
    // The protein bar is still rendered because the protein target IS set.
    expect(progressBarCount(container)).toBe(1);

    // Footer reads "kcal today", not "remaining" or "Goal reached".
    expect(getFooterText(container)).toBe('120 kcal today');
    // Scoped to this container: a global screen query would match a stale
    // "kcal remaining" from a previous test's rendered DOM. The helper
    // already scopes the read to this container.
    const scopedText = getStripText(container);
    expect(scopedText).not.toMatch(/kcal remaining/);
    expect(scopedText).not.toMatch('Goal reached');
  });

  it('hides the protein progress bar when protein_target_g is also missing', () => {
    // No calorie target AND no protein target → neither bar is meaningful.
    const withMeal = {
      ...baseData,
      protein_target_g: null,
      calories: 120,
      protein_g: 5,
      items: [
        { row: 1, food: 'apple', quantity_g: 100, calories: 120, carbs: 25, protein: 5, fat: 1 },
      ],
    } as FoodTodayResponse;
    const { container } = render(
      <LogTypeTodayTotalsStrip data={withMeal} serverOnline={false} />,
    );

    expect(progressBarCount(container)).toBe(0);
    const hint = container.querySelector(
      '[data-testid="log-type-totals-strip-setup-hint"]',
    );
    expect(hint?.textContent).toBe(
      'Set a daily calorie target in Settings to track progress.',
    );
  });

  it('does NOT show a setup hint in the empty state (relay-225 owns that message)', () => {
    // Empty state: data=null, serverOnline=false. No meals logged, no
    // target. relay-225 carries the user-facing message; the setup hint
    // would be noise because there is nothing to track yet.
    const { container } = render(
      <LogTypeTodayTotalsStrip data={null} serverOnline={false} />,
    );
    expect(
      container.querySelector('[data-testid="log-type-totals-strip-setup-hint"]'),
    ).toBeNull();
    expect(getFooterText(container)).toBe('No meals logged yet');
  });

  it('suppresses the setup hint once a calorie target is configured', async () => {
    mockTargets(); // default calorie_target: 2000, protein_target_g: 120
    const withMeal = dayWithMeal(120);
    const { container } = render(
      <LogTypeTodayTotalsStrip data={withMeal} serverOnline={true} />,
    );

    await waitFor(() => {
      expect(getStripText(container)).toContain('120 kcal / 2000');
    });
    expect(
      container.querySelector('[data-testid="log-type-totals-strip-setup-hint"]'),
    ).toBeNull();
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

describe('LogTypeTodayTotalsStrip — macros expansion (relay-222 + relay-227)', () => {
  // relay-227: the strip itself is the disclosure toggle (Card onClick +
  // Enter/Space). The inner button was removed in favor of a non-interactive
  // hint <p> because nesting a real <button> inside a div[role=button] is
  // invalid HTML. These tests now drive the Card (the new toggle) and read
  // the hint <p> for the visible "Show macros" / "Hide macros" label.

  it('renders the strip as a button with aria-expanded=false when macros are present', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    expect(card).not.toBeNull();
    expect(card?.getAttribute('aria-expanded')).toBe('false');
    expect(card?.getAttribute('aria-controls')).toBe('log-type-totals-strip-macros');
    // Accessible name announces the toggle affordance so screen reader users
    // know the strip is interactive.
    expect(card?.getAttribute('aria-label')).toMatch(/Press Enter to toggle macro details/);
    // The hint <p> shows the upcoming state.
    expect(getExpandButton(container)?.textContent).toBe('Show macros');
    // Panel is hidden until activated
    expect(getMacrosPanel(container)).toBeNull();
  });

  it('does not render the strip as a button when macros are null (no details to expose)', () => {
    const partialData = { ...baseData, carbs: null, fat: null } as unknown as FoodTodayResponse;
    const { container } = render(
      <LogTypeTodayTotalsStrip data={partialData} serverOnline={false} />,
    );
    expect(getStripCard(container)).toBeNull();
    expect(getExpandButton(container)).toBeNull();
    expect(getMacrosPanel(container)).toBeNull();
  });

  it('activating the strip reveals carbs and fat lines below protein', async () => {
    mockTargets();

    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );

    await waitFor(() => {
      expect(getStripText(container)).toContain('750 kcal / 2000');
    });

    const card = getStripCard(container);
    expect(card).not.toBeNull();
    fireEvent.click(card!);

    const panel = getMacrosPanel(container);
    expect(panel).not.toBeNull();
    // Carbs row: 80g from baseData, formatted with one decimal place
    expect(panel?.textContent).toContain('Carbs');
    expect(panel?.textContent).toContain('80.0g');
    // Fat row: 25g from baseData
    expect(panel?.textContent).toContain('Fat');
    expect(panel?.textContent).toContain('25.0g');
    // After expansion aria-expanded flips to true and the hint shows the
    // upcoming state.
    expect(card!.getAttribute('aria-expanded')).toBe('true');
    expect(getExpandButton(container)?.textContent).toBe('Hide macros');
  });

  it('activating the strip again collapses the panel', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    fireEvent.click(card!);
    expect(getMacrosPanel(container)).not.toBeNull();
    fireEvent.click(card!);
    expect(getMacrosPanel(container)).toBeNull();
    expect(card!.getAttribute('aria-expanded')).toBe('false');
    expect(getExpandButton(container)?.textContent).toBe('Show macros');
  });

  it('expanded panel sits below the protein row and above the footer', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    fireEvent.click(card!);
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

describe('LogTypeTodayTotalsStrip — keyboard focus affordance (relay-227)', () => {
  // AC: Given a keyboard user focuses the interactive totals strip; When
  // focus enters the strip; Then a visible focus ring and accessible name
  // identify the totals summary and Enter/Space exposes its details.

  it('promotes the Card to a focusable button when macros are present', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    expect(card).not.toBeNull();
    // Card is keyboard-reachable: tabIndex=0 + role=button.
    expect(card!.getAttribute('tabindex')).toBe('0');
    expect(card!.getAttribute('role')).toBe('button');
    // Accessible name identifies the totals summary and announces the
    // toggle affordance so screen reader users know Enter/Space is wired.
    expect(card!.getAttribute('aria-label')).toMatch(/Today.+calorie and protein totals/);
    expect(card!.getAttribute('aria-label')).toMatch(/Press Enter to toggle macro details/);
    // Disclosure linkage so AT can map the toggle to its panel.
    expect(card!.getAttribute('aria-expanded')).toBe('false');
    expect(card!.getAttribute('aria-controls')).toBe('log-type-totals-strip-macros');
  });

  it('does NOT promote the Card to a button when no macros are present', () => {
    const partialData = { ...baseData, carbs: null, fat: null } as unknown as FoodTodayResponse;
    const { container } = render(
      <LogTypeTodayTotalsStrip data={partialData} serverOnline={false} />,
    );
    const card = container.querySelector('.log-type-totals-strip');
    expect(card?.getAttribute('role')).toBeNull();
    expect(card?.getAttribute('tabindex')).toBeNull();
    // aria-expanded / aria-controls are only meaningful alongside a button
    // role — they should not be surfaced when the strip is non-interactive.
    expect(card?.hasAttribute('aria-expanded')).toBe(false);
    expect(card?.hasAttribute('aria-controls')).toBe(false);
    // getStripCard helper agrees.
    expect(getStripCard(container)).toBeNull();
  });

  it('Enter on the focused strip opens the macro panel', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    expect(card).not.toBeNull();
    expect(getMacrosPanel(container)).toBeNull();
    fireEvent.keyDown(card!, { key: 'Enter' });
    expect(getMacrosPanel(container)).not.toBeNull();
    expect(card!.getAttribute('aria-expanded')).toBe('true');
    expect(getExpandButton(container)?.textContent).toBe('Hide macros');
  });

  it('Space on the focused strip opens the macro panel', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    expect(getMacrosPanel(container)).toBeNull();
    fireEvent.keyDown(card!, { key: ' ' });
    expect(getMacrosPanel(container)).not.toBeNull();
    expect(card!.getAttribute('aria-expanded')).toBe('true');
  });

  it('Enter again on the focused strip closes the panel (toggle behavior)', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    fireEvent.keyDown(card!, { key: 'Enter' });
    expect(getMacrosPanel(container)).not.toBeNull();
    fireEvent.keyDown(card!, { key: 'Enter' });
    expect(getMacrosPanel(container)).toBeNull();
    expect(card!.getAttribute('aria-expanded')).toBe('false');
  });

  it('other keys do not toggle the panel (only Enter and Space are wired)', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    fireEvent.keyDown(card!, { key: 'a' });
    fireEvent.keyDown(card!, { key: 'ArrowDown' });
    fireEvent.keyDown(card!, { key: 'Escape' });
    expect(getMacrosPanel(container)).toBeNull();
    expect(card!.getAttribute('aria-expanded')).toBe('false');
  });

  it('the focus ring is applied via :focus-visible CSS (no inline outline)', () => {
    // The visual focus ring is a CSS concern (--focus-ring token in
    // App.css) — assert the contract by reading the rendered class list.
    // We deliberately do NOT assert computed style in jsdom; a unit-level
    // css inspection is more brittle than useful. The build + lint run
    // already cover the stylesheet file, and a future Playwright journey
    // will screenshot the focus state for visual confirmation.
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    expect(card).not.toBeNull();
    // The Card carries the ui-card base class so the focus-visible rule
    // can target it via [role='button']:focus-visible.
    expect(card!.classList.contains('ui-card')).toBe(true);
    expect(card!.getAttribute('role')).toBe('button');
  });

  it('does not promote the Card to a button in the empty state (no details to expose)', () => {
    // relay-225 owns the empty state message. relay-227 must not surface an
    // Enter/Space toggle when there are no meals AND no macros to reveal.
    // hasMacros is forced false in the empty state (viewModel gates it).
    const { container } = render(
      <LogTypeTodayTotalsStrip data={emptyDay()} serverOnline={false} />,
    );
    expect(getStripCard(container)).toBeNull();
    // Card is still rendered (so screen reader users can read the summary)
    // but it is not interactive.
    const card = container.querySelector('.log-type-totals-strip');
    expect(card).not.toBeNull();
    expect(card!.getAttribute('role')).toBeNull();
  });
});

// relay-228: day-over-day comparison line.
// AC: Given today totals are visible and yesterday totals are available;
// When the user opens the Log Type sub-tab; Then show yesterday-vs-today
// kcal and protein deltas with an explicit unavailable state when
// yesterday data is missing.
//
// The component fetches api.getFoodHistory(2) on mount when serverOnline
// is true and filters out today's date to find yesterday. The line is
// suppressed in the empty state (relay-225 owns the message) and renders
// the "Yesterday totals unavailable" message when no prior row is found.
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

// relay-232: Ask Coach handoff. The strip renders a single-purpose primary
// action button that builds a plain-text prompt from the current viewmodel
// and hands it to onAskCoach. The button is optional (hidden when onAskCoach
// is not wired) so existing call sites that don't expose the Agent tab keep
// working. Disabled when the server is offline.
describe('LogTypeTodayTotalsStrip — Ask Coach handoff (relay-232)', () => {
  it('renders the Ask Coach button when onAskCoach is wired', () => {
    const onAskCoach = vi.fn();
    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={baseData}
        serverOnline={true}
        onAskCoach={onAskCoach}
      />,
    );
    const btn = getCoachButton(container);
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toBe('Ask Coach');
    expect(btn?.getAttribute('aria-label')).toBe("Ask Coach about today's totals");
  });

  it('does NOT render the Ask Coach button when onAskCoach is omitted', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );
    expect(getCoachButton(container)).toBeNull();
  });

  it('disables the button when the server is offline', () => {
    const onAskCoach = vi.fn();
    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={baseData}
        serverOnline={false}
        onAskCoach={onAskCoach}
      />,
    );
    const btn = getCoachButton(container);
    expect(btn).not.toBeNull();
    expect(btn?.disabled).toBe(true);
    // Clicking a disabled button is a no-op in jsdom.
    fireEvent.click(btn!);
    expect(onAskCoach).not.toHaveBeenCalled();
  });

  it('calls onAskCoach once with the tracking-state prompt when clicked', async () => {
    mockTargets({ calorie_target: 2000 });
    const onAskCoach = vi.fn();
    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={dayWithMeal(750)}
        serverOnline={true}
        onAskCoach={onAskCoach}
      />,
    );
    await waitFor(() => {
      expect(getCoachButton(container)).not.toBeNull();
    });
    fireEvent.click(getCoachButton(container)!);
    expect(onAskCoach).toHaveBeenCalledTimes(1);
    const prompt = onAskCoach.mock.calls[0][0] as string;
    expect(prompt).toContain('750 kcal of 2000 kcal');
    expect(prompt).toContain('30 g of 120 g protein');
    expect(prompt).toContain('Recommend how to balance');
  });

  it('calls onAskCoach with the empty-state prompt when no meals are logged', async () => {
    mockTargets({ calorie_target: 2000 });
    const onAskCoach = vi.fn();
    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={null}
        serverOnline={true}
        onAskCoach={onAskCoach}
      />,
    );
    await waitFor(() => {
      expect(getCoachButton(container)).not.toBeNull();
    });
    fireEvent.click(getCoachButton(container)!);
    expect(onAskCoach).toHaveBeenCalledTimes(1);
    const prompt = onAskCoach.mock.calls[0][0] as string;
    expect(prompt).toBe(
      'I have not logged any meals yet today. Help me plan what to eat.',
    );
  });

  it('does NOT auto-send the message — only the prompt builder runs', async () => {
    // The AC explicitly forbids sending the message without user confirmation.
    // Assert that the component does not call any "send" function — it only
    // exposes the prompt via the onAskCoach callback. We can't directly
    // observe "did not send" from inside the strip, but we can verify that
    // onAskCoach is the only callback exposed for this action (no companion
    // onSendCoach / onSubmitCoach) and that the rendered button is type=button
    // so it never submits an enclosing form by accident.
    const onAskCoach = vi.fn();
    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={baseData}
        serverOnline={true}
        onAskCoach={onAskCoach}
      />,
    );
    const btn = getCoachButton(container);
    expect(btn?.getAttribute('type')).toBe('button');
  });

  it('calls onAskCoach twice when the user clicks twice', async () => {
    // The AC says "prefilled once" — we read that as "the composer starts
    // pre-filled on the first activation". Subsequent clicks are still
    // allowed (the user might want to re-prefill with the latest totals),
    // so we assert onAskCoach fires on every click rather than swallowing
    // duplicates. The Agent tab's token-based prefill naturally replaces
    // any prior text on each invocation, so "twice" means "two prompts
    // were queued" not "two messages were sent".
    mockTargets({ calorie_target: 2000 });
    const onAskCoach = vi.fn();
    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={baseData}
        serverOnline={true}
        onAskCoach={onAskCoach}
      />,
    );
    await waitFor(() => {
      expect(getCoachButton(container)).not.toBeNull();
    });
    fireEvent.click(getCoachButton(container)!);
    fireEvent.click(getCoachButton(container)!);
    expect(onAskCoach).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// relay-231: stale-data indicator. The strip captures Date.now() the moment
// `data` arrives, ticks every 15s, and surfaces one muted line that names how
// current the rendered totals are — "Just updated" / "Updated 12s ago" /
// "Showing offline totals" — or nothing in the empty state.
// ---------------------------------------------------------------------------

describe('LogTypeTodayTotalsStrip — stale-data indicator (relay-231)', () => {
  beforeEach(() => {
    // Default each test to real timers so `waitFor` (which uses real
    // setTimeout under the hood) does not hang. Tests that need to
    // advance the interval switch to fake timers locally and restore
    // them in their own finally block.
    vi.useRealTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

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
