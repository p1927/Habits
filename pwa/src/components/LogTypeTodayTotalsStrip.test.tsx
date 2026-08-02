import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
