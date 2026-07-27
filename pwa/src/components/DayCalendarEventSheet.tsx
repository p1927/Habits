import type { CSSProperties } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import { Card } from './ui/Card';
import type { DayCalendarEvent } from '../lib/daySectionShared';
import {
  calendarEventColor,
  formatEventDate,
  formatEventDuration,
  formatEventTimeRange,
  isAllDayEvent,
  isPastEvent,
} from '../lib/daySectionShared';

export interface DayCalendarEventSheetProps {
  event: DayCalendarEvent | null;
  onClose: () => void;
}

export function DayCalendarEventSheet({ event, onClose }: DayCalendarEventSheetProps) {
  if (!event) return null;

  const past = isPastEvent(event.start);
  const allDay = isAllDayEvent(event);
  const color = calendarEventColor(event.id);
  const title = event.summary || 'Event';

  return (
    <BottomSheet open onClose={onClose} title={title} showTitle={false}>
      <Card className="day-event-detail-card home-export-card--health">
        <div
          className="day-event-detail__swatch"
          style={{ background: color } as CSSProperties}
          aria-hidden="true"
        />
        <p className="section-eyebrow">Event details</p>
        <h3 className="day-event-detail__title">{title}</h3>
        <div className="day-event-detail__time-pill" style={{ borderColor: color, color }}>
          {formatEventTimeRange(event)}
        </div>
        <dl className="day-event-detail__meta">
          <div className="day-event-detail__row">
            <dt>Date</dt>
            <dd>{formatEventDate(event.start)}</dd>
          </div>
          {!allDay && (
            <div className="day-event-detail__row">
              <dt>Duration</dt>
              <dd>{formatEventDuration(event)}</dd>
            </div>
          )}
          {past && (
            <div className="day-event-detail__row">
              <dt>Status</dt>
              <dd>
                <span className="schedule-event-badge">Passed</span>
              </dd>
            </div>
          )}
        </dl>
      </Card>
      <div className="settings-actions day-event-detail__actions">
        <button type="button" className="btn-pill btn-pill-outline" onClick={onClose}>
          Close
        </button>
      </div>
    </BottomSheet>
  );
}
