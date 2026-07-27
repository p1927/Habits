import {
  DAY_METRICS,
  STREAK_HAPTIC_METRICS_KEY,
  STREAK_LEGEND_COLLAPSED_KEY,
  STREAK_LEGEND_SEEN_KEY,
} from './daySectionConstants';

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

export function streakTierClass(days: number): string {
  if (days >= 14) return 'streak-badge--fire';
  if (days >= 7) return 'streak-badge--hot';
  if (days >= 3) return 'streak-badge--warm';
  return '';
}

export function dayMetricLabel(key: string): string {
  return DAY_METRICS.find((m) => m.key === key)?.label ?? key;
}
