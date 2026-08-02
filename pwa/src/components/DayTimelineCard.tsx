import { useState } from 'react';
import { Card } from './ui/Card';
import { DayScheduleGrid } from './DayScheduleGrid';
import { DayCalendarEventSheet } from './DayCalendarEventSheet';
import { DayScheduleEmptyPanel } from './DayScheduleEmptyPanel';
import { DayTimelineAgendaPanel } from './DayTimelineAgendaPanel';
import { useDayScheduleShortcuts } from '../hooks/useDayScheduleShortcuts';
import type { DayCalendarEvent, DayScheduleView } from '../lib/daySectionShared';
import { shortcutModifierLabel } from '../lib/logSectionShared';

export type { DayScheduleView };

export interface DayTimelineCardProps {
  events: DayCalendarEvent[];
  onAgentSchedulePrompt?: (prompt?: string) => void;
}

export function DayTimelineCard({ events, onAgentSchedulePrompt }: DayTimelineCardProps) {
  const [view, setView] = useState<DayScheduleView>('agenda');
  const { showShortcutHint, dismissShortcutHint } = useDayScheduleShortcuts(setView);
  const [selectedEvent, setSelectedEvent] = useState<DayCalendarEvent | null>(null);
  const mod = shortcutModifierLabel();

  const selectView = (next: DayScheduleView) => {
    setView(next);
    dismissShortcutHint();
  };

  return (
    <>
      <Card className="day-schedule-card day-schedule-card--calendar">
        <div className="day-schedule-card__header">
          <div>
            <p className="section-eyebrow">Schedule</p>
            <h2>{view === 'agenda' ? 'Agenda' : 'Day'}</h2>
          </div>
          <div className="day-schedule-view-toggle" role="tablist" aria-label="Schedule view">
            <button
              type="button"
              role="tab"
              id="day-schedule-tab-agenda"
              aria-controls="day-schedule-panel-agenda"
              className={`day-schedule-view-pill ${view === 'agenda' ? 'day-schedule-view-pill--active' : ''}`}
              aria-selected={view === 'agenda'}
              tabIndex={view === 'agenda' ? 0 : -1}
              aria-keyshortcuts={`${mod}1`}
              onClick={() => selectView('agenda')}
            >
              Schedule
            </button>
            <button
              type="button"
              role="tab"
              id="day-schedule-tab-day"
              aria-controls="day-schedule-panel-day"
              className={`day-schedule-view-pill ${view === 'day' ? 'day-schedule-view-pill--active' : ''}`}
              aria-selected={view === 'day'}
              tabIndex={view === 'day' ? 0 : -1}
              aria-keyshortcuts={`${mod}2`}
              onClick={() => selectView('day')}
            >
              Day
            </button>
          </div>
        </div>

        {showShortcutHint && (
          <p className="log-shortcut-hint muted day-schedule-shortcut-hint" role="note">
            Tip: press <kbd>{mod}1</kbd> for Schedule, <kbd>{mod}2</kbd> for Day view.{' '}
            <button type="button" className="link-btn" onClick={dismissShortcutHint}>
              Got it
            </button>
          </p>
        )}

        {!events.length ? (
          view === 'day' ? (
            <div role="tabpanel" id="day-schedule-panel-day" aria-labelledby="day-schedule-tab-day">
              <DayScheduleEmptyPanel onAgentSchedulePrompt={onAgentSchedulePrompt} />
            </div>
          ) : (
            <div role="tabpanel" id="day-schedule-panel-agenda" aria-labelledby="day-schedule-tab-agenda">
              <DayScheduleEmptyPanel onAgentSchedulePrompt={onAgentSchedulePrompt} />
            </div>
          )
        ) : view === 'day' ? (
          <div role="tabpanel" id="day-schedule-panel-day" aria-labelledby="day-schedule-tab-day">
            <DayScheduleGrid events={events} onEventSelect={setSelectedEvent} />
          </div>
        ) : (
          <div role="tabpanel" id="day-schedule-panel-agenda" aria-labelledby="day-schedule-tab-agenda">
            <DayTimelineAgendaPanel events={events} onEventSelect={setSelectedEvent} />
          </div>
        )}
      </Card>
      <DayCalendarEventSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  );
}
