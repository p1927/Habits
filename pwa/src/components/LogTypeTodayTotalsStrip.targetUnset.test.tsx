import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogTypeTodayTotalsStrip } from './LogTypeTodayTotalsStrip';
import type { FoodTodayResponse } from '../lib/api';

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();
  return {
    ...actual,
    api: {
      ...actual.api,
      // relay-228 + relay-225/226/227: default the mocks to sensible
      // resolved values so tests that don't care about the network still
      // render the strip without an unhandled rejection. Tests that DO
      // care override with mockTargets() in their beforeEach.
      getFoodTargets: vi
        .fn()
        .mockResolvedValue({ calorie_target: 2000, protein_target_g: 120, sheets_connected: true }),
      getFoodHistory: vi.fn().mockResolvedValue({ days: [], sheets_connected: true }),
    },
  };
});

import {
  baseData,
  dayWithMeal,
  getFooterText,
  getStripText,
  mockTargets,
  progressBarCount,
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

// ch-163 split: relay-226 setup-hint visibility belongs to the target-unset
// state family. Each file is now self-contained and ~150 lines, focused on
// the state it covers. Shared lifecycle + fixtures come from the helpers
// module.
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
