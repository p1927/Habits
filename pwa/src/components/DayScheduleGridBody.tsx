import type { CSSProperties, RefObject } from 'react';
import type { DayCalendarEvent } from '../lib/daySectionShared';
import {
  DAY_GRID_SLOT_MINUTES,
  calendarEventColor,
  eventDurationMinutes,
  eventStartMinutes,
  isPastEvent,
} from '../lib/daySectionShared';
import type { DayScheduleGridSlot } from '../lib/dayScheduleGridTypes';

interface DayScheduleGridBodyProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  nowLineRef: RefObject<HTMLDivElement | null>;
  slots: DayScheduleGridSlot[];
  slotCount: number;
  gridStartMinutes: number;
  totalMinutes: number;
  showNowLine: boolean;
  nowTopPct: number;
  now: Date;
  nowLineVisible: boolean;
  timed: DayCalendarEvent[];
  onEventSelect?: (event: DayCalendarEvent) => void;
  onJumpToNow: () => void;
}

export function DayScheduleGridBody({
  scrollRef,
  nowLineRef,
  slots,
  slotCount,
  gridStartMinutes,
  totalMinutes,
  showNowLine,
  nowTopPct,
  now,
  nowLineVisible,
  timed,
  onEventSelect,
  onJumpToNow,
}: DayScheduleGridBodyProps) {
  return (
    <div className="schedule-grid-scroll-wrap">
      <div className="schedule-grid-scroll" ref={scrollRef}>
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
                <div
                  ref={nowLineRef}
                  className="schedule-grid-now"
                  style={{ top: `${nowTopPct}%` }}
                  aria-hidden="true"
                />
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
      {showNowLine && !nowLineVisible && (
        <button
          type="button"
          className="schedule-jump-now"
          onClick={onJumpToNow}
          aria-label="Jump to current time on schedule"
        >
          Jump to now
        </button>
      )}
    </div>
  );
}
