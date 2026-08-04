import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Cards } from './Cards';
import { api as apiModule } from '../lib/api';
import type { KeepCard, SicknessTimelineEvent } from '../lib/api';

const SICK_CARDS: KeepCard[] = [
  {
    id: 'sickness:1',
    type: 'sickness',
    title: 'Flu 2026-07',
    body: 'Bed rest, two days off work',
    row: 1,
  },
  {
    id: 'sickness:2',
    type: 'sickness',
    title: 'Cold notes',
    body: 'Sore throat, runny nose',
    row: 2,
  },
];

function makeSicknessApi(events: SicknessTimelineEvent[], cards: KeepCard[] = SICK_CARDS) {
  return {
    getCards: vi.fn().mockImplementation((type?: string) => {
      if (type && type !== 'all') {
        return Promise.resolve({ cards: cards.filter((c) => c.type === type), sheets_connected: true });
      }
      return Promise.resolve({ cards, sheets_connected: true });
    }),
    getSicknessTimeline: vi.fn().mockResolvedValue({ events, sheets_connected: true }),
    createCard: vi.fn().mockResolvedValue({ cards }),
    deleteCard: vi.fn().mockResolvedValue({ cards }),
  };
}

let getCardsSpy: ReturnType<typeof vi.fn>;
let getTimelineSpy: ReturnType<typeof vi.fn>;

function installApiMock(events: SicknessTimelineEvent[], cards: KeepCard[] = SICK_CARDS) {
  const next = makeSicknessApi(events, cards);
  getCardsSpy = next.getCards;
  getTimelineSpy = next.getSicknessTimeline;
  vi.spyOn(apiModule, 'getCards').mockImplementation(getCardsSpy);
  vi.spyOn(apiModule, 'getSicknessTimeline').mockImplementation(getTimelineSpy);
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Cards — ui-072 sickness timeline → related notes handoff (crit-081)', () => {
  it('renders a focusable event button for each timeline event with a clear aria-label', async () => {
    installApiMock([{ label: 'Flu', start: '2026-07-20', end: '2026-07-25' }]);
    render(<Cards serverOnline />);
    const btn = await screen.findByTestId('sickness-timeline-event-Flu');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.getAttribute('aria-label')).toBe(
      'Open related sickness notes for Flu (2026-07-20 to 2026-07-25)',
    );
  });

  it('when a timeline event is activated, switches the filter to sickness and prefills search', async () => {
    installApiMock([{ label: 'Flu', start: '2026-07-20', end: '2026-07-25' }]);
    render(<Cards serverOnline />);
    const btn = await screen.findByTestId('sickness-timeline-event-Flu');
    fireEvent.click(btn);
    // The Sickness filter tab is now aria-selected=true.
    await waitFor(() => {
      const sicknessTab = screen.getByRole('tab', { name: 'Sickness' });
      expect(sicknessTab.getAttribute('aria-selected')).toBe('true');
    });
    // The search input is pre-filled with the event label.
    const search = screen.getByLabelText('Search cards') as HTMLInputElement;
    expect(search.value).toBe('Flu');
  });

  it('announces the handoff via aria-live after activation', async () => {
    installApiMock([{ label: 'Flu', start: '2026-07-20', end: '2026-07-25' }]);
    render(<Cards serverOnline />);
    const btn = await screen.findByTestId('sickness-timeline-event-Flu');
    fireEvent.click(btn);
    const live = await screen.findByRole('status');
    expect(live.getAttribute('aria-live')).toBe('polite');
    expect(live.textContent).toContain('Showing sickness notes for Flu');
  });

  it('prefills a fresh search when a second event is activated', async () => {
    installApiMock([
      { label: 'Flu', start: '2026-07-20', end: '2026-07-25' },
      { label: 'Cold', start: '2026-07-30', end: '2026-07-30' },
    ]);
    render(<Cards serverOnline />);
    const flu = await screen.findByTestId('sickness-timeline-event-Flu');
    fireEvent.click(flu);
    const cold = await screen.findByTestId('sickness-timeline-event-Cold');
    fireEvent.click(cold);
    const search = screen.getByLabelText('Search cards') as HTMLInputElement;
    expect(search.value).toBe('Cold');
  });
});
