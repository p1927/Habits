import { useState } from 'react';
import { Card } from './ui/Card';
import { DayScheduleGrid } from './DayScheduleGrid';
import { DayCalendarEventSheet } from './DayCalendarEventSheet';
import { useDayScheduleShortcuts } from '../hooks/useDayScheduleShortcuts';
import type { DayCalendarEvent, DayScheduleView } from '../lib/daySectionShared';
import {
  calendarEventColor,
  formatEventTime,
  formatScheduleDayLabel,
  isPastEvent,
  sortEventsByStart,
} from '../lib/daySectionShared';
import { shortcutModifierLabel } from '../lib/logSectionShared';
import type { CSSProperties } from 'react';

export type { DayScheduleView };

export interface DayTimelineCardProps {
  events: DayCalendarEvent[];
  onAgentSchedulePrompt?: () => void;
}

export function DayTimelineCard({ events, onAgentSchedulePrompt }: DayTimelineCardProps) {
  const [view, setView] = useState<DayScheduleView>('agenda');
  const { showShortcutHint, dismissShortcutHint } = useDayScheduleShortcuts(setView);
  const [selectedEvent, setSelectedEvent] = useState<DayCalendarEvent | null>(null);
  const sorted = sortEventsByStart(events);
  const dayLabel = formatScheduleDayLabel();
  const mod = shortcutModifierLabel();

  const selectView = (next: DayScheduleView) => {
    setView(next);
    dismissShortcutHint();
  };

  const emptySchedule = (
    <div className="day-schedule-empty">
      <p className="muted">No events on your schedule today.</p>
      {onAgentSchedulePrompt && (
        <button
          type="button"
          className="btn-pill btn-pill-outline day-schedule-empty__cta"
          onClick={onAgentSchedulePrompt}
        >
          Add with Coach
        </button>
      )}
    </div>
  );

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
            {emptySchedule}
          </div>
        ) : (
          <div role="tabpanel" id="day-schedule-panel-agenda" aria-labelledby="day-schedule-tab-agenda">
            {emptySchedule}
          </div>
        )
      ) : view === 'day' ? (
        <div role="tabpanel" id="day-schedule-panel-day" aria-labelledby="day-schedule-tab-day">
            <DayScheduleGrid events={events} onEventSelect={setSelectedEvent} />
          </div>
      ) : (
        <div role="tabpanel" id="day-schedule-panel-agenda" aria-labelledby="day-schedule-tab-agenda">
          <div className="schedule-agenda" aria-label="Today's schedule">
          <h3 className="schedule-day-label">{dayLabel}</h3>
          <ul className="schedule-event-list">
            {sorted.map((ev) => {
              const past = isPastEvent(ev.start);
              return (
                <li key={ev.id}>
                  <button
                    type="button"
                    className={`schedule-event schedule-event--button ${past ? 'schedule-event--past' : 'schedule-event--upcoming'}`}
                    style={{ '--event-color': calendarEventColor(ev.id) } as CSSProperties}
                    onClick={() => setSelectedEvent(ev)}
                    aria-label={`${ev.summary}, ${formatEventTime(ev.start)}`}
                  >
                    <span className="schedule-event-bar" aria-hidden="true" />
                    <time className="schedule-event-time" dateTime={ev.start}>
                      {formatEventTime(ev.start)}
                    </time>
                    <div className="schedule-event-body">
                      <span className="schedule-event-title">{ev.summary}</span>
                      {past && <span className="schedule-event-badge">Passed</span>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        </div>
      )}
    </Card>
    <DayCalendarEventSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  );
}
