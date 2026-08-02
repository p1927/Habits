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

import { api } from '../lib/api';

const baseData: FoodTodayResponse = {
  protein_g: 45,
  protein_target_g: 120,
  calories: 750,
  carbs: 80,
  fat: 25,
  items: [],
  sheets_connected: true,
};

// Render with a fresh container per test and read text from THAT container.
// `document.querySelector` would happily return the first match from a stale
// previous test's DOM tree, so we scope to the rendered output via a ref.
function getStripText(container: HTMLElement) {
  const strip = container.querySelector('.log-type-totals-strip');
  return strip ? strip.textContent || '' : '';
}

// Resolve the first aria-live region inside THIS container — not the global
// screen, which can hold leftover nodes from earlier test renders and return
// stale textContent.
function getLiveRegion(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[aria-live="polite"]');
}

describe('LogTypeTodayTotalsStrip — totals aggregation', () => {
  beforeEach(() => {
    vi.mocked(api.getFoodTargets).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders zero totals when data is null (no-data case)', () => {
    render(<LogTypeTodayTotalsStrip data={null} serverOnline={false} />);

    // Initial synchronous render with calorieTarget=null and data=null:
    // footer shows em-dash placeholder, not "remaining"
    expect(screen.getByText('Calories')).toBeTruthy();
    expect(screen.getByText('Protein')).toBeTruthy();
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.queryByText(/kcal remaining/)).toBeNull();
  });

  it('shows consumed only (no target denominator) when calorie_target is 0', async () => {
    vi.mocked(api.getFoodTargets).mockResolvedValue({
      calorie_target: 0,
      protein_target_g: 120,
      sheets_connected: true,
    });

    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );

    await waitFor(() => {
      const text = getStripText(container);
      expect(text).toContain('750');
      expect(text).toContain('kcal');
    });
    // Footer must be "kcal today" not "remaining"
    expect(container.querySelector('.log-type-totals-strip__footer')?.textContent).toBe(
      '750 kcal today',
    );
  });

  it('shows "X kcal remaining" when target is set and under goal', async () => {
    vi.mocked(api.getFoodTargets).mockResolvedValue({
      calorie_target: 2000,
      protein_target_g: 120,
      sheets_connected: true,
    });

    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );

    await waitFor(() => {
      expect(getStripText(container)).toContain('750 kcal / 2000');
    });
    expect(screen.getByText('1250 kcal remaining')).toBeTruthy();
  });

  it('handles zero consumption with target set (2000 kcal remaining)', async () => {
    vi.mocked(api.getFoodTargets).mockResolvedValue({
      calorie_target: 2000,
      protein_target_g: 120,
      sheets_connected: true,
    });

    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={{ ...baseData, calories: 0, protein_g: 0 }}
        serverOnline={true}
      />,
    );

    await waitFor(() => {
      expect(getStripText(container)).toContain('0 kcal / 2000');
    });
    expect(screen.getByText('2000 kcal remaining')).toBeTruthy();
  });

  it('targets unload on 401 (no target, no remaining text)', async () => {
    const { ApiError } = await import('../lib/api');
    vi.mocked(api.getFoodTargets).mockRejectedValue(
      new ApiError(401, 'unauthorized'),
    );

    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );

    await waitFor(() => {
      expect(getStripText(container)).toContain('750 kcal today');
    });
    expect(container.querySelector('.log-type-totals-strip__footer')?.textContent).toBe(
      '750 kcal today',
    );
  });
});

describe('LogTypeTodayTotalsStrip — aria-live announcements', () => {
  beforeEach(() => {
    vi.mocked(api.getFoodTargets).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders an aria-live=polite region inside the strip', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={null} serverOnline={false} />,
    );
    const live = getLiveRegion(container);
    expect(live).not.toBeNull();
    expect(live?.getAttribute('aria-atomic')).toBe('true');
  });

  it('announces consumed kcal + protein with target denominator when set', async () => {
    vi.mocked(api.getFoodTargets).mockResolvedValue({
      calorie_target: 2000,
      protein_target_g: 120,
      sheets_connected: true,
    });

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
    vi.mocked(api.getFoodTargets).mockResolvedValue({
      calorie_target: 0,
      protein_target_g: 120,
      sheets_connected: true,
    });

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
  beforeEach(() => {
    vi.mocked(api.getFoodTargets).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('applies goal-reached fill class and "Goal reached" footer when consumption meets target', async () => {
    vi.mocked(api.getFoodTargets).mockResolvedValue({
      calorie_target: 2000,
      protein_target_g: 120,
      sheets_connected: true,
    });

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
    expect(container.querySelector('.log-type-totals-strip__footer')?.textContent).toBe(
      'Goal reached',
    );
    expect(container.querySelector('.log-type-totals-strip__footer--goal-reached')).not.toBeNull();
  });

  it('clamps fill to 100% and switches to goal-reached when consumption exceeds target', async () => {
    vi.mocked(api.getFoodTargets).mockResolvedValue({
      calorie_target: 2000,
      protein_target_g: 120,
      sheets_connected: true,
    });

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
    expect(container.querySelector('.log-type-totals-strip__footer')?.textContent).toBe(
      'Goal reached',
    );
  });

  it('does NOT show goal-reached when target is unset, even with high consumption', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={{ ...baseData, calories: 5000 }}
        serverOnline={false}
      />,
    );
    expect(container.querySelector('.progress-fill--goal-reached')).toBeNull();
    expect(container.querySelector('.log-type-totals-strip__footer')?.textContent).toBe(
      '5000 kcal today',
    );
  });

  it('aria-live announces "Goal reached" instead of remaining when target is met', async () => {
    vi.mocked(api.getFoodTargets).mockResolvedValue({
      calorie_target: 2000,
      protein_target_g: 120,
      sheets_connected: true,
    });

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
  beforeEach(() => {
    vi.mocked(api.getFoodTargets).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders an expand button with aria-expanded=false when macros are present', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const button = container.querySelector('.log-type-totals-strip__expand');
    expect(button).not.toBeNull();
    expect(button?.getAttribute('aria-expanded')).toBe('false');
    expect(button?.getAttribute('aria-controls')).toBe('log-type-totals-strip-macros');
    expect(button?.textContent).toBe('Show macros');
    // Panel is hidden until clicked
    expect(container.querySelector('[data-testid="log-type-totals-strip-macros"]')).toBeNull();
  });

  it('does not render an expand button when macros are null (backend contract change)', () => {
    const partialData = { ...baseData, carbs: null, fat: null } as unknown as FoodTodayResponse;
    const { container } = render(
      <LogTypeTodayTotalsStrip data={partialData} serverOnline={false} />,
    );
    expect(container.querySelector('.log-type-totals-strip__expand')).toBeNull();
    expect(container.querySelector('[data-testid="log-type-totals-strip-macros"]')).toBeNull();
  });

  it('expanding the panel reveals carbs and fat lines below protein', async () => {
    vi.mocked(api.getFoodTargets).mockResolvedValue({
      calorie_target: 2000,
      protein_target_g: 120,
      sheets_connected: true,
    });

    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );

    await waitFor(() => {
      expect(getStripText(container)).toContain('750 kcal / 2000');
    });

    const button = container.querySelector(
      '.log-type-totals-strip__expand',
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    fireEvent.click(button);

    const panel = container.querySelector('[data-testid="log-type-totals-strip-macros"]');
    expect(panel).not.toBeNull();
    // Carbs row: 80g from baseData, formatted with one decimal place
    expect(panel?.textContent).toContain('Carbs');
    expect(panel?.textContent).toContain('80.0g');
    // Fat row: 25g from baseData
    expect(panel?.textContent).toContain('Fat');
    expect(panel?.textContent).toContain('25.0g');
    // After expansion the button text flips to "Hide macros"
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.textContent).toBe('Hide macros');
  });

  it('tapping the expand button again collapses the panel', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const button = container.querySelector(
      '.log-type-totals-strip__expand',
    ) as HTMLButtonElement;
    fireEvent.click(button);
    expect(
      container.querySelector('[data-testid="log-type-totals-strip-macros"]'),
    ).not.toBeNull();
    fireEvent.click(button);
    expect(container.querySelector('[data-testid="log-type-totals-strip-macros"]')).toBeNull();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.textContent).toBe('Show macros');
  });

  it('expanded panel sits below the protein row and above the footer', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const button = container.querySelector(
      '.log-type-totals-strip__expand',
    ) as HTMLButtonElement;
    fireEvent.click(button);
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
  beforeEach(() => {
    vi.mocked(api.getFoodTargets).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not render the pending badge when pendingCount is 0 (default)', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    expect(
      container.querySelector('[data-testid="log-type-totals-strip-pending-badge"]'),
    ).toBeNull();
  });

  it('renders singular "1 meal pending sync" beside the footer when one entry is queued', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} pendingCount={1} />,
    );
    const badge = container.querySelector(
      '[data-testid="log-type-totals-strip-pending-badge"]',
    );
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toContain('1 meal pending sync');
    expect(badge?.textContent).not.toContain('meals');
    expect(badge?.getAttribute('aria-label')).toBe('1 meal pending sync');
  });

  it('renders plural "3 meals pending sync" when multiple entries are queued', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} pendingCount={3} />,
    );
    const badge = container.querySelector(
      '[data-testid="log-type-totals-strip-pending-badge"]',
    );
    expect(badge?.textContent).toContain('3 meals pending sync');
    expect(badge?.getAttribute('aria-label')).toBe('3 meals pending sync');
  });

  it('keeps the kcal footer intact when the pending badge is present', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip
        data={{ ...baseData, calories: 0 }}
        serverOnline={false}
        pendingCount={2}
      />,
    );
    const footer = container.querySelector('.log-type-totals-strip__footer');
    expect(footer).not.toBeNull();
    // Footer keeps its primary kcal line and appends the badge after a middot
    expect(footer?.textContent).toContain('0 kcal today');
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
    vi.mocked(api.getFoodTargets).mockResolvedValue({
      calorie_target: 2000,
      protein_target_g: 120,
      sheets_connected: true,
    });
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} pendingCount={1} />,
    );
    await waitFor(() => {
      expect(getStripText(container)).toContain('750 kcal / 2000');
    });
    const badge = container.querySelector(
      '[data-testid="log-type-totals-strip-pending-badge"]',
    );
    expect(badge?.textContent).toContain('1 meal pending sync');
    // "remaining" line is preserved next to the badge
    expect(container.querySelector('.log-type-totals-strip__footer')?.textContent).toContain(
      '1250 kcal remaining',
    );
  });
});
