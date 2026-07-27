export const STREAK_HAPTIC_OVERALL_KEY = 'habits-streak-haptic-overall';
export const STREAK_HAPTIC_METRICS_KEY = 'habits-streak-haptic-metrics';
export const STREAK_LEGEND_SEEN_KEY = 'habits-streak-legend-seen';
export const STREAK_LEGEND_COLLAPSED_KEY = 'habits-streak-legend-collapsed';

export const DAY_SHORTCUT_HINT_KEY = 'habits-day-shortcuts-hint-seen';

export type DayScheduleView = 'agenda' | 'day';

export const DAY_SCHEDULE_VIEWS: DayScheduleView[] = ['agenda', 'day'];

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

export const DAY_GRID_START_HOUR = 6;
export const DAY_GRID_END_HOUR = 22;
export const DAY_GRID_SLOT_MINUTES = 30;

export const CALENDAR_EVENT_COLORS = ['#8ab4f8', '#81c995', '#f28b82', '#fdd663', '#c58af9', '#78d9ec'] as const;
