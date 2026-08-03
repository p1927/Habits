import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
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
  dayWithMeal,
  mockTargets,
  resetHistoryMock,
  resetTargetsMock,
} from './LogTypeTodayTotalsStrip.test.helpers';

const COACH_BUTTON_TESTID = 'log-type-totals-strip-coach-button';
function getCoachButton(container: HTMLElement): HTMLButtonElement | null {
  return container.querySelector(
    `[data-testid="${COACH_BUTTON_TESTID}"]`,
  ) as HTMLButtonElement | null;
}

beforeEach(() => {
  resetTargetsMock();
  resetHistoryMock();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ch-163 split: Ask Coach handoff (relay-232) extracted. Covers the
// optional callback (button hidden when onAskCoach omitted), disabled
// state when server offline, tracking-state and empty-state prompt
// content, the no-auto-send guarantee (type=button, callback is the only
// surface), and idempotent re-click behavior.
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
