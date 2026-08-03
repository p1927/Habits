import React from 'react';
import { render, waitFor } from '@testing-library/react';
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
  baseData,
  getFooterText,
  getLiveRegion,
  getPendingBadge,
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

// ch-163 split: pending-sync badge (relay-223) extracted. Covers singular
// vs plural noun, footer-intact invariant, empty-state badge visibility,
// and aria-live announce behavior.
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
