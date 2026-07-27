import type { CSSProperties } from 'react';
import { Card } from './ui/Card';
import type { HabitsStreaksResponse, HabitsTodayResponse } from '../lib/api';
import type { QueuedHabitEntry } from '../hooks/useOptimisticHabitLog';
import {
  DAY_METRIC_COLORS,
  DAY_METRICS,
  streakTierClass,
} from '../lib/daySectionShared';

export interface DayHabitHoursCardProps {
  habits: HabitsTodayResponse | null;
  streaks: HabitsStreaksResponse | null;
  saving: string | null;
  streakLegendOpen: boolean;
  pending: QueuedHabitEntry[];
  onToggleLegend: () => void;
  onUpdateMetric: (key: string, value: string) => void;
  onRetryPending: (entry: QueuedHabitEntry) => void;
  onDismissPending: (id: string) => void;
  metricLabel: (key: string) => string;
}

export function DayHabitHoursCard({
  habits,
  streaks,
  saving,
  streakLegendOpen,
  pending,
  onToggleLegend,
  onUpdateMetric,
  onRetryPending,
  onDismissPending,
  metricLabel,
}: DayHabitHoursCardProps) {
  const failed = pending.filter((e) => e.status === 'failed');

  return (
    <Card>
      <div className="habit-hours-header">
        <h2>Habit hours</h2>
        <button
          type="button"
          className="btn-small streak-legend-toggle"
          aria-expanded={streakLegendOpen}
          aria-controls="streak-tier-legend"
          onClick={onToggleLegend}
        >
          {streakLegendOpen ? 'Hide legend' : 'Show legend'}
        </button>
      </div>
      {streakLegendOpen && (
        <ul id="streak-tier-legend" className="streak-tier-legend" aria-label="Streak badge tiers">
          <li>
            <span className="streak-badge streak-badge--warm streak-tier-legend-badge" aria-hidden="true">
              3d
            </span>
            <span className="muted">Warm · 3+ days</span>
          </li>
          <li>
            <span className="streak-badge streak-badge--hot streak-tier-legend-badge" aria-hidden="true">
              7d
            </span>
            <span className="muted">Hot · 7+ days</span>
          </li>
          <li>
            <span className="streak-badge streak-badge--fire streak-tier-legend-badge" aria-hidden="true">
              14d
            </span>
            <span className="muted">Fire · 14+ days</span>
          </li>
        </ul>
      )}
      {streaks && streaks.overall > 0 && (
        <p className="streak-banner streak-banner--animated" role="status">
          <span className={`streak-badge streak-badge--overall ${streakTierClass(streaks.overall)}`}>
            {streaks.overall}d
          </span>
          All-target streak
        </p>
      )}
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
      {failed.length > 0 && (
        <ul className="food-list habit-sync-list" aria-label="Failed habit syncs">
          {failed.map((entry) => (
            <li key={entry.id} className="food-row food-row--failed">
              <div>
                <strong>{metricLabel(entry.metric)}</strong>
                <span className="muted">
                  {' '}
                  · {entry.value ?? 0}h · Failed to sync
                </span>
              </div>
              <div className="food-row-actions">
                <button type="button" className="btn-small" onClick={() => onRetryPending(entry)}>
                  Retry
                </button>
                <button
                  type="button"
                  className="btn-small btn-danger"
                  aria-label={`Dismiss failed ${metricLabel(entry.metric)} update`}
                  onClick={() => onDismissPending(entry.id)}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
