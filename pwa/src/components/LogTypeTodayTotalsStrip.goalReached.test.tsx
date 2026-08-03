import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogTypeTodayTotalsStrip } from './LogTypeTodayTotalsStrip';
import { baseData } from './LogTypeTodayTotalsStrip.test.helpers';

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
  getFooterText,
  getLiveRegion,
  getStripText,
  mockTargets,
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

// ch-163 split: goal-reached state coverage (progress-fill--goal-reached
// class, "Goal reached" footer, 100% clamp, target-unset suppression, and
// aria-live announcement) extracted from the main test file. ~120 lines.
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
