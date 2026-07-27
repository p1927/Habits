import { Card } from './ui/Card';
import type { FoodLogItem, FoodTodayResponse } from '../lib/api';
import type { OptimisticFoodEntry } from '../hooks/useOptimisticFoodLog';
import { formatRelativeTime } from '../lib/relativeTime';

export interface LogTypeTodayListProps {
  pending: OptimisticFoodEntry[];
  data: FoodTodayResponse | null;
  onRetryPending: (entry: OptimisticFoodEntry) => void;
  onDismissPending: (id: string) => void;
  onDeleteItem: (row: number) => void;
}

export function LogTypeTodayList({
  pending,
  data,
  onRetryPending,
  onDismissPending,
  onDeleteItem,
}: LogTypeTodayListProps) {
  return (
    <Card className="log-type-card home-export-card--health">
      <p className="section-eyebrow">Today</p>
      <h2>Today&apos;s log</h2>
      {!pending.length && !data?.items.length ? (
        <p className="muted">No entries yet.</p>
      ) : (
        <ul className="food-list">
          {pending.map((entry) => {
            const queuedAgo = entry.created_at ? formatRelativeTime(entry.created_at) : '';
            const statusSuffix =
              entry.status === 'pending'
                ? ' · Saving…'
                : entry.status === 'queued'
                  ? queuedAgo
                    ? ` · Queued ${queuedAgo}`
                    : ' · Queued offline'
                  : ' · Failed to save';
            return (
              <li key={entry.id} className={`food-row food-row--${entry.status}`}>
                <div>
                  <strong>{entry.food}</strong>
                  <span className="muted">
                    {entry.quantity_g > 0 ? ` · ${entry.quantity_g}g` : ''}
                    {entry.source === 'macros' ? ' · Open Food Facts' : ''}
                    {statusSuffix}
                  </span>
                </div>
                {entry.status === 'failed' && (
                  <div className="food-row-actions">
                    <button type="button" className="btn-pill btn-pill-outline" onClick={() => onRetryPending(entry)}>
                      Retry
                    </button>
                    <button
                      type="button"
                      className="keep-card-delete"
                      aria-label="Dismiss failed entry"
                      onClick={() => onDismissPending(entry.id)}
                    >
                      ×
                    </button>
                  </div>
                )}
              </li>
            );
          })}
          {data?.items.map((item: FoodLogItem) => (
            <li key={item.row} className="food-row">
              <div>
                <strong>{item.food}</strong>
                <span className="muted">
                  {' '}
                  · {item.quantity_g}g · {item.protein.toFixed(1)}g protein
                </span>
              </div>
              <button
                type="button"
                className="keep-card-delete"
                aria-label={`Remove ${item.food}`}
                onClick={() => onDeleteItem(item.row)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
