import type { CSSProperties } from 'react';
import type { HabitsStreaksResponse } from '../lib/api';
import type { DayHabitMetricGridProps } from '../lib/dayHabitHoursCardTypes';
import { DAY_METRIC_COLORS, DAY_METRICS, streakTierClass } from '../lib/daySectionShared';

export function DayOverallStreakBanner({ streaks }: { streaks: HabitsStreaksResponse | null }) {
  if (!streaks || streaks.overall <= 0) return null;
  return (
    <p className="streak-banner streak-banner--animated" role="status">
      <span className={`streak-badge streak-badge--overall ${streakTierClass(streaks.overall)}`}>
        {streaks.overall}d
      </span>
      All-target streak
    </p>
  );
}

export function DayHabitMetricGrid({ habits, streaks, saving, onUpdateMetric }: DayHabitMetricGridProps) {
  return (
    <div className="habit-grid" role="group" aria-label="Habit hours">
      {DAY_METRICS.map(({ key, label, target }) => {
        const val = habits?.metrics?.[key];
        const behind = target > 0 && (val ?? 0) < target * 0.5;
        const streak = streaks?.metrics?.[key] ?? 0;
        return (
          <label
            key={key}
            className={`habit-chip habit-chip--${key} ${behind ? 'habit-chip--behind' : ''}`}
            style={{ '--habit-accent': DAY_METRIC_COLORS[key] ?? 'var(--accent)' } as CSSProperties}
          >
            <span className="habit-chip-label">
              {label}
              {target > 0 && streak > 0 && (
                <span className={`streak-badge ${streakTierClass(streak)}`} aria-label={`${streak} day streak`}>
                  {streak}d
                </span>
              )}
            </span>
            <input
              type="number"
              step="0.5"
              min="0"
              value={val ?? ''}
              placeholder="0"
              disabled={saving === key}
              onChange={(e) => onUpdateMetric(key, e.target.value)}
            />
            {target > 0 && <span className="habit-target">/{target}h</span>}
          </label>
        );
      })}
    </div>
  );
}
