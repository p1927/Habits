import type { CSSProperties } from 'react';
import type { DayCalendarEvent } from '../lib/daySectionShared';
import {
  calendarEventColor,
  formatEventTime,
  formatScheduleDayLabel,
  isPastEvent,
  sortEventsByStart,
} from '../lib/daySectionShared';

interface DayTimelineAgendaPanelProps {
  events: DayCalendarEvent[];
  onEventSelect: (event: DayCalendarEvent) => void;
}

export function DayTimelineAgendaPanel({ events, onEventSelect }: DayTimelineAgendaPanelProps) {
  const sorted = sortEventsByStart(events);
  const dayLabel = formatScheduleDayLabel();

  return (
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
                onClick={() => onEventSelect(ev)}
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
  );
}
