export const STREAK_HAPTIC_OVERALL_KEY = 'habits-streak-haptic-overall';
export const STREAK_HAPTIC_METRICS_KEY = 'habits-streak-haptic-metrics';
export const STREAK_LEGEND_SEEN_KEY = 'habits-streak-legend-seen';
export const STREAK_LEGEND_COLLAPSED_KEY = 'habits-streak-legend-collapsed';

export const DAY_METRIC_COLORS: Record<string, string> = {
  sleep: 'var(--ring-habits)',
  work: 'var(--accent)',
  read: 'var(--ok)',
  speak: 'var(--warn)',
  game: 'var(--carbs)',
  wasted: 'var(--err)',
};

export const DAY_METRICS = [
  { key: 'sleep', label: 'Sleep', target: 7 },
  { key: 'work', label: 'Work', target: 4 },
  { key: 'read', label: 'Read', target: 1 },
  { key: 'speak', label: 'Speak', target: 0.5 },
  { key: 'game', label: 'Game', target: 0 },
  { key: 'wasted', label: 'Wasted', target: 0 },
] as const;

export type DayCalendarEvent = { id: string; summary: string; start: string; end?: string };

export const DAY_GRID_START_HOUR = 6;
export const DAY_GRID_END_HOUR = 22;
export const DAY_GRID_SLOT_MINUTES = 30;

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

export const CALENDAR_EVENT_COLORS = ['#8ab4f8', '#81c995', '#f28b82', '#fdd663', '#c58af9', '#78d9ec'] as const;

export function calendarEventColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CALENDAR_EVENT_COLORS[Math.abs(hash) % CALENDAR_EVENT_COLORS.length];
}

export function readStreakLegendOpen(): boolean {
  if (localStorage.getItem(STREAK_LEGEND_COLLAPSED_KEY) === '1') return false;
  return localStorage.getItem(STREAK_LEGEND_SEEN_KEY) !== '1';
}

export function readMetricStreakHaptics(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(STREAK_HAPTIC_METRICS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function weekStripDays(): Date[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

export function streakTierClass(days: number): string {
  if (days >= 14) return 'streak-badge--fire';
  if (days >= 7) return 'streak-badge--hot';
  if (days >= 3) return 'streak-badge--warm';
  return '';
}

export function dayMetricLabel(key: string): string {
  return DAY_METRICS.find((m) => m.key === key)?.label ?? key;
}

export function formatEventTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function isPastEvent(start: string): boolean {
  return new Date(start) < new Date();
}

export function sortEventsByStart(events: DayCalendarEvent[]): DayCalendarEvent[] {
  return [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export function formatScheduleDayLabel(date: Date = new Date()): string {
  const today = new Date();
  if (isSameDay(date, today)) return 'Today';
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (isSameDay(date, tomorrow)) return 'Tomorrow';
  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}
