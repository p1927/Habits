import type { CSSProperties } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import type { DayCalendarEvent } from '../lib/daySectionShared';
import {
  calendarEventColor,
  formatEventDate,
  formatEventDuration,
  formatEventTimeRange,
  isPastEvent,
} from '../lib/daySectionShared';

export interface DayCalendarEventSheetProps {
  event: DayCalendarEvent | null;
  onClose: () => void;
}

export function DayCalendarEventSheet({ event, onClose }: DayCalendarEventSheetProps) {
  if (!event) return null;

  const past = isPastEvent(event.start);
  const color = calendarEventColor(event.id);

  return (
    <BottomSheet open onClose={onClose} title={event.summary || 'Event'}>
      <div className="day-event-detail">
        <div
          className="day-event-detail__swatch"
          style={{ background: color } as CSSProperties}
          aria-hidden="true"
        />
        <dl className="day-event-detail__meta">
          <div className="day-event-detail__row">
            <dt>When</dt>
            <dd>
              {formatEventDate(event.start)}
              <span className="day-event-detail__time">{formatEventTimeRange(event)}</span>
            </dd>
          </div>
          <div className="day-event-detail__row">
            <dt>Duration</dt>
            <dd>{formatEventDuration(event)}</dd>
          </div>
          {past && (
            <div className="day-event-detail__row">
              <dt>Status</dt>
              <dd>
                <span className="schedule-event-badge">Passed</span>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </BottomSheet>
  );
}
