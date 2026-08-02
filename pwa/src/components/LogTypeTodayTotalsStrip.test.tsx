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
