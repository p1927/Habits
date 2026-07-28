import type { CSSProperties } from 'react';
import type { DayCalendarEvent } from '../lib/daySectionShared';
import { calendarEventColor } from '../lib/daySectionShared';

interface DayScheduleAllDayStripProps {
  events: DayCalendarEvent[];
  onEventSelect?: (event: DayCalendarEvent) => void;
}

export function DayScheduleAllDayStrip({ events, onEventSelect }: DayScheduleAllDayStripProps) {
  if (events.length === 0) return null;

  return (
    <div className="schedule-allday-strip" aria-label="All-day events">
      <span className="schedule-allday-label">All day</span>
      <ul className="schedule-allday-list">
        {events.map((event) => (
          <li key={event.id}>
            <button
              type="button"
              className="schedule-allday-chip schedule-allday-chip--button"
              style={{ '--event-color': calendarEventColor(event.id) } as CSSProperties}
              onClick={() => onEventSelect?.(event)}
              aria-label={`All day: ${event.summary}`}
            >
              {event.summary}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
