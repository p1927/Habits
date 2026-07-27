import { useState } from 'react';
import { Card } from './ui/Card';
import { DayScheduleGrid } from './DayScheduleGrid';
import type { DayCalendarEvent } from '../lib/daySectionShared';
import {
  calendarEventColor,
  formatEventTime,
  formatScheduleDayLabel,
  isPastEvent,
  sortEventsByStart,
} from '../lib/daySectionShared';
import type { CSSProperties } from 'react';

export type DayScheduleView = 'agenda' | 'day';

export interface DayTimelineCardProps {
  events: DayCalendarEvent[];
}

export function DayTimelineCard({ events }: DayTimelineCardProps) {
  const [view, setView] = useState<DayScheduleView>('agenda');
  const sorted = sortEventsByStart(events);
  const dayLabel = formatScheduleDayLabel();

  return (
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
            className={`day-schedule-view-pill ${view === 'agenda' ? 'day-schedule-view-pill--active' : ''}`}
            aria-selected={view === 'agenda'}
            onClick={() => setView('agenda')}
          >
            Schedule
          </button>
          <button
            type="button"
            role="tab"
            className={`day-schedule-view-pill ${view === 'day' ? 'day-schedule-view-pill--active' : ''}`}
            aria-selected={view === 'day'}
            onClick={() => setView('day')}
          >
            Day
          </button>
        </div>
      </div>

      {!events.length ? (
        view === 'day' ? (
          <DayScheduleGrid events={[]} />
        ) : (
          <p className="muted day-schedule-empty">No events on your schedule today.</p>
        )
      ) : view === 'day' ? (
        <DayScheduleGrid events={events} />
      ) : (
        <div className="schedule-agenda" aria-label="Today's schedule">
          <h3 className="schedule-day-label">{dayLabel}</h3>
          <ul className="schedule-event-list">
            {sorted.map((ev) => {
              const past = isPastEvent(ev.start);
              return (
                <li
                  key={ev.id}
                  className={`schedule-event ${past ? 'schedule-event--past' : 'schedule-event--upcoming'}`}
                  style={{ '--event-color': calendarEventColor(ev.id) } as CSSProperties}
                >
                  <span className="schedule-event-bar" aria-hidden="true" />
                  <time className="schedule-event-time" dateTime={ev.start}>
                    {formatEventTime(ev.start)}
                  </time>
                  <div className="schedule-event-body">
                    <span className="schedule-event-title">{ev.summary}</span>
                    {past && <span className="schedule-event-badge">Passed</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
