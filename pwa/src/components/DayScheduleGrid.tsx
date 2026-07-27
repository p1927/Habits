import type { CSSProperties } from 'react';
import type { DayCalendarEvent } from '../lib/daySectionShared';
import {
  DAY_GRID_END_HOUR,
  DAY_GRID_SLOT_MINUTES,
  DAY_GRID_START_HOUR,
  calendarEventColor,
  dayGridSlotCount,
  eventDurationMinutes,
  eventStartMinutes,
  formatGridTimeLabel,
  formatScheduleDayLabel,
  isPastEvent,
  partitionCalendarEvents,
} from '../lib/daySectionShared';

export interface DayScheduleGridProps {
  events: DayCalendarEvent[];
  onEventSelect?: (event: DayCalendarEvent) => void;
}

export function DayScheduleGrid({ events, onEventSelect }: DayScheduleGridProps) {
  const { allDay, timed } = partitionCalendarEvents(events);
  const slotCount = dayGridSlotCount();
  const gridStartMinutes = DAY_GRID_START_HOUR * 60;
  const gridEndMinutes = DAY_GRID_END_HOUR * 60;
  const totalMinutes = gridEndMinutes - gridStartMinutes;
  const dayLabel = formatScheduleDayLabel();

  const slots = Array.from({ length: slotCount + 1 }, (_, index) => {
    const minutes = gridStartMinutes + index * DAY_GRID_SLOT_MINUTES;
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return { hour, minute, label: minute === 0 ? formatGridTimeLabel(hour, 0) : '' };
  });

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNowLine = nowMinutes >= gridStartMinutes && nowMinutes <= gridEndMinutes;
  const nowTopPct = showNowLine ? ((nowMinutes - gridStartMinutes) / totalMinutes) * 100 : 0;

  return (
    <div className="schedule-day-grid" aria-label="Day grid view">
      <h3 className="schedule-day-label">{dayLabel}</h3>

      {allDay.length > 0 && (
        <div className="schedule-allday-strip" aria-label="All-day events">
          <span className="schedule-allday-label">All day</span>
          <ul className="schedule-allday-list">
            {allDay.map((event) => (
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
      )}

      <div className="schedule-grid-scroll">
        <div className="schedule-grid" style={{ '--grid-slots': slotCount } as CSSProperties}>
          <div className="schedule-grid-times" aria-hidden="true">
            {slots.map((slot, index) => (
              <span key={`${slot.hour}-${slot.minute}-${index}`} className="schedule-grid-time">
                {slot.label}
              </span>
            ))}
          </div>
          <div className="schedule-grid-body">
            {slots.slice(0, -1).map((slot, index) => (
              <div
                key={`line-${slot.hour}-${slot.minute}-${index}`}
                className={`schedule-grid-line ${slot.minute === 0 ? 'schedule-grid-line--hour' : ''}`}
              />
            ))}
            {showNowLine && (
              <>
                <div className="schedule-grid-now" style={{ top: `${nowTopPct}%` }} aria-hidden="true" />
                <p className="sr-only" role="status">
                  Current time: {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </>
            )}
            {timed.map((event) => {
              const startMin = eventStartMinutes(event.start);
              const clampedStart = Math.max(startMin, gridStartMinutes);
              const duration = eventDurationMinutes(event);
              const visibleDuration =
                startMin < gridStartMinutes
                  ? Math.max(DAY_GRID_SLOT_MINUTES, duration - (gridStartMinutes - startMin))
                  : duration;
              const topPct = ((clampedStart - gridStartMinutes) / totalMinutes) * 100;
              const heightPct = (visibleDuration / totalMinutes) * 100;
              const past = isPastEvent(event.start);

              return (
                <button
                  type="button"
                  key={event.id}
                  className={`schedule-grid-event schedule-grid-event--button ${past ? 'schedule-grid-event--past' : ''}`}
                  style={{
                    '--event-color': calendarEventColor(event.id),
                    top: `${topPct}%`,
                    height: `${Math.min(heightPct, 100 - topPct)}%`,
                  } as CSSProperties}
                  onClick={() => onEventSelect?.(event)}
                  aria-label={`${event.summary}, ${new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                >
                  <span className="schedule-grid-event-title">{event.summary}</span>
                  <time className="schedule-grid-event-time" dateTime={event.start}>
                    {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
