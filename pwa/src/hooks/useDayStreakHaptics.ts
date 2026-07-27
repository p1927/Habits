import { useCallback, useEffect, useState } from 'react';
import type { HabitsStreaksResponse } from '../lib/api';
import {
  DAY_METRICS,
  readMetricStreakHaptics,
  readStreakLegendOpen,
  STREAK_HAPTIC_METRICS_KEY,
  STREAK_HAPTIC_OVERALL_KEY,
  STREAK_LEGEND_COLLAPSED_KEY,
  STREAK_LEGEND_SEEN_KEY,
} from '../lib/daySectionShared';
import { vibrateFireStreak, vibrateHotStreak, vibrateMetricFireStreak, vibrateMetricHotStreak } from '../lib/haptics';

export function useDayStreakHaptics(streaks: HabitsStreaksResponse | null) {
  const [streakLegendOpen, setStreakLegendOpen] = useState(readStreakLegendOpen);

  useEffect(() => {
    if (localStorage.getItem(STREAK_LEGEND_SEEN_KEY) !== '1') {
      localStorage.setItem(STREAK_LEGEND_SEEN_KEY, '1');
    }
  }, []);

  const toggleStreakLegend = useCallback(() => {
    setStreakLegendOpen((open) => {
      const next = !open;
      localStorage.setItem(STREAK_LEGEND_COLLAPSED_KEY, next ? '0' : '1');
      return next;
    });
  }, []);

  useEffect(() => {
    if (!streaks) return;

    let didVibrate = false;
    const vibrateOnce = (fn: () => void) => {
      if (didVibrate) return;
      fn();
      didVibrate = true;
    };

    const prevOverall = Number(sessionStorage.getItem(STREAK_HAPTIC_OVERALL_KEY) ?? '0');
    if (streaks.overall >= 14 && prevOverall < 14) vibrateOnce(vibrateFireStreak);
    else if (streaks.overall >= 7 && prevOverall < 7) vibrateOnce(vibrateHotStreak);
    if (streaks.overall !== prevOverall) {
      sessionStorage.setItem(STREAK_HAPTIC_OVERALL_KEY, String(streaks.overall));
    }

    const prevMetrics = readMetricStreakHaptics();
    const nextMetrics = { ...prevMetrics };
    for (const { key } of DAY_METRICS) {
      const days = streaks.metrics?.[key] ?? 0;
      const prev = prevMetrics[key] ?? 0;
      if (days >= 14 && prev < 14) vibrateOnce(vibrateMetricFireStreak);
      else if (days >= 7 && prev < 7) vibrateOnce(vibrateMetricHotStreak);
      if (days !== prev) nextMetrics[key] = days;
    }
    sessionStorage.setItem(STREAK_HAPTIC_METRICS_KEY, JSON.stringify(nextMetrics));
  }, [streaks]);

  return { streakLegendOpen, toggleStreakLegend };
}
