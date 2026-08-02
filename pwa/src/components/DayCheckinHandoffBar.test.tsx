import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DayCheckinHandoffBar } from './DayCheckinHandoffBar';
import type { DayCalendarEvent } from '../lib/dayCalendarUtils';

const baseEvent: DayCalendarEvent = {
  id: 'evt-1',
  summary: 'Team standup',
  start: '2026-08-02T15:00:00Z',
  end: '2026-08-02T15:30:00Z',
};

function clearSessionStorage() {
  try {
    window.sessionStorage.clear();
  } catch {
    // ignore
  }
}

describe('DayCheckinHandoffBar', () => {
  beforeEach(() => {
    clearSessionStorage();
  });

  afterEach(() => {
    clearSessionStorage();
  });

  it('renders Looking ahead with the next event summary and time when events present', () => {
    const { container } = render(
      <DayCheckinHandoffBar
        events={[baseEvent]}
        onAskCoach={() => {}}
        onReviewRings={() => {}}
      />,
    );
    const bar = container.querySelector('.day-checkin-handoff-bar');
    expect(bar).toBeTruthy();
    expect(bar?.textContent).toMatch(/Team standup/);
    expect(container.querySelector('[aria-label="Ask Coach to plan the next event"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="Review rings on Home"]')).toBeTruthy();
  });

  it('renders fallback copy when no events provided', () => {
    const { container } = render(
      <DayCheckinHandoffBar
        events={[]}
        onAskCoach={() => {}}
        onReviewRings={() => {}}
      />,
    );
    const bar = container.querySelector('.day-checkin-handoff-bar');
    expect(bar).toBeTruthy();
    expect(bar?.textContent).toMatch(/Continue your check-in/);
  });

  it('hides the bar after dismiss', async () => {
    const { container } = render(
      <DayCheckinHandoffBar
        events={[baseEvent]}
        onAskCoach={() => {}}
        onReviewRings={() => {}}
      />,
    );
    expect(container.querySelector('.day-checkin-handoff-bar')).toBeTruthy();
    const dismissBtn = container.querySelector('[aria-label="Dismiss Looking ahead for today"]');
    expect(dismissBtn).toBeTruthy();
    (dismissBtn as HTMLButtonElement).click();
    await waitFor(() =>
      expect(container.querySelector('.day-checkin-handoff-bar')).toBeNull(),
    );
  });

  it('passes an event-aware prompt to onAskCoach', () => {
    const onAskCoach = vi.fn();
    const { container } = render(
      <DayCheckinHandoffBar
        events={[baseEvent]}
        onAskCoach={onAskCoach}
        onReviewRings={() => {}}
      />,
    );
    const askBtn = container.querySelector('[aria-label="Ask Coach to plan the next event"]') as HTMLButtonElement;
    expect(askBtn).toBeTruthy();
    askBtn.click();
    expect(onAskCoach).toHaveBeenCalledTimes(1);
    const prompt = onAskCoach.mock.calls[0][0] as string;
    expect(prompt).toMatch(/Team standup/);
    expect(prompt).toMatch(/Help me plan/);
  });
});
