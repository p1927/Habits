import type { DayCalendarEvent } from './daySectionShared';

export interface DayScheduleGridProps {
  events: DayCalendarEvent[];
  onEventSelect?: (event: DayCalendarEvent) => void;
}

export interface DayScheduleGridSlot {
  hour: number;
  minute: number;
  label: string;
}
