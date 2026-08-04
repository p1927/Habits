import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SicknessTimeline } from './SicknessTimeline';
import type { SicknessTimelineEvent } from '../lib/api';

afterEach(() => cleanup());

// Today is 2026-08-04 (set in test environment) — events inside the 90-day
// window (>= 2026-05-06) are kept by SicknessTimeline's visibility filter.
const EVENTS: SicknessTimelineEvent[] = [
  { label: 'Flu', start: '2026-07-20', end: '2026-07-25' },
  { label: 'Cold', start: '2026-07-30', end: '2026-07-30' },
];

describe('SicknessTimeline — ui-072 event activation', () => {
  it('renders the static aria-label when no onEventSelect is provided', () => {
    render(<SicknessTimeline events={EVENTS} />);
    const root = screen.getByRole('img', { name: /sickness timeline/i });
    expect(root).toBeTruthy();
    // No buttons rendered in the non-interactive mode.
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders an aria-label with a group role when onEventSelect is provided', () => {
    render(<SicknessTimeline events={EVENTS} onEventSelect={() => undefined} />);
    const group = screen.getByRole('group', { name: /activate an event to open related notes/i });
    expect(group).toBeTruthy();
  });

  it('exposes one focusable button per event with the open-related-notes label', () => {
    render(<SicknessTimeline events={EVENTS} onEventSelect={() => undefined} />);
    const flu = screen.getByTestId('sickness-timeline-event-Flu');
    const cold = screen.getByTestId('sickness-timeline-event-Cold');
    expect(flu.tagName).toBe('BUTTON');
    expect(cold.tagName).toBe('BUTTON');
    expect(flu.getAttribute('aria-label')).toBe(
      'Open related sickness notes for Flu (2026-07-20 to 2026-07-25)',
    );
    // Single-day events render the date only (no redundant "to" range).
    expect(cold.getAttribute('aria-label')).toBe('Open related sickness notes for Cold (2026-07-30)');
  });

  it('invokes onEventSelect with the matching event when its button is activated', () => {
    const onSelect = vi.fn();
    render(<SicknessTimeline events={EVENTS} onEventSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('sickness-timeline-event-Cold'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(EVENTS[1]);
  });

  it('returns null when there are no events to display', () => {
    const { container } = render(<SicknessTimeline events={[]} onEventSelect={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
