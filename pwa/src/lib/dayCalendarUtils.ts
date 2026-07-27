import {
  CALENDAR_EVENT_COLORS,
  DAY_GRID_END_HOUR,
  DAY_GRID_SLOT_MINUTES,
  DAY_GRID_START_HOUR,
} from './daySectionConstants';

export type DayCalendarEvent = { id: string; summary: string; start: string; end?: string };

export function isAllDayEvent(event: DayCalendarEvent): boolean {
  return !event.start.includes('T');
}

export function eventStartMinutes(iso: string): number {
  if (!iso.includes('T')) return 0;
  const date = new Date(iso);
  return date.getHours() * 60 + date.getMinutes();
}

export function eventDurationMinutes(event: DayCalendarEvent): number {
  if (isAllDayEvent(event)) return DAY_GRID_SLOT_MINUTES;
  if (event.end?.includes('T')) {
    const startMs = new Date(event.start).getTime();
    const endMs = new Date(event.end).getTime();
    return Math.max(DAY_GRID_SLOT_MINUTES, Math.round((endMs - startMs) / 60_000));
  }
  return 60;
}

export function dayGridSlotCount(): number {
  return ((DAY_GRID_END_HOUR - DAY_GRID_START_HOUR) * 60) / DAY_GRID_SLOT_MINUTES;
}

export function formatGridTimeLabel(hour: number, minute: number): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function sortEventsByStart(events: DayCalendarEvent[]): DayCalendarEvent[] {
  return [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export function partitionCalendarEvents(events: DayCalendarEvent[]): {
  allDay: DayCalendarEvent[];
  timed: DayCalendarEvent[];
} {
  const allDay: DayCalendarEvent[] = [];
  const timed: DayCalendarEvent[] = [];
  for (const event of events) {
    if (isAllDayEvent(event)) allDay.push(event);
    else timed.push(event);
  }
  return { allDay, timed: sortEventsByStart(timed) };
}

export function calendarEventColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CALENDAR_EVENT_COLORS[Math.abs(hash) % CALENDAR_EVENT_COLORS.length];
}

export function formatEventTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function formatEventDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

export function formatEventTimeRange(event: DayCalendarEvent): string {
  if (isAllDayEvent(event)) return 'All day';
  const start = formatEventTime(event.start);
  if (!event.end?.includes('T')) return start;
  return `${start} – ${formatEventTime(event.end)}`;
}

export function formatEventDuration(event: DayCalendarEvent): string {
  if (isAllDayEvent(event)) return 'All day';
  const mins = eventDurationMinutes(event);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (rem === 0) return hrs === 1 ? '1 hour' : `${hrs} hours`;
  return `${hrs} hr ${rem} min`;
}

export function isPastEvent(start: string): boolean {
  return new Date(start) < new Date();
}
