import type { DayHabitFailedSyncListProps } from '../lib/dayHabitHoursCardTypes';

export function DayHabitFailedSyncList({
  failed,
  metricLabel,
  onRetryPending,
  onDismissPending,
}: DayHabitFailedSyncListProps) {
  if (failed.length === 0) return null;

  return (
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
            <button type="button" className="btn-pill btn-pill-outline" onClick={() => onRetryPending(entry)}>
              Retry
            </button>
            <button
              type="button"
              className="keep-card-delete"
              aria-label={`Dismiss failed ${metricLabel(entry.metric)} update`}
              onClick={() => onDismissPending(entry.id)}
            >
              ×
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
