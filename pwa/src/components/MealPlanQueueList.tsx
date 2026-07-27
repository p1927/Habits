import { mealPlanQueueLabel, type QueuedMealPlanLog } from '../lib/mealPlanQueue';
import { mealPlanQueueItemId } from '../lib/mealPlanQueueFocus';
import { formatRelativeTime } from '../lib/relativeTime';

export interface MealPlanQueueListProps {
  queue: QueuedMealPlanLog[];
  failedIds: Set<string>;
  retryingId: string | null;
  serverOnline: boolean;
  syncing: boolean;
  onRetry: (item: QueuedMealPlanLog) => void;
  onDismissItem: (id: string) => void;
}

export function MealPlanQueueList({
  queue,
  failedIds,
  retryingId,
  serverOnline,
  syncing,
  onRetry,
  onDismissItem,
}: MealPlanQueueListProps) {
  if (!queue.length) return null;

  return (
    <ul className="food-list meal-plan-queue-list" aria-label="Queued meal logs">
      {queue.map((item) => {
        const failed = failedIds.has(item.id);
        const retrying = retryingId === item.id;
        const label = mealPlanQueueLabel(item);
        const queuedAgo = formatRelativeTime(item.created_at);
        const statusSuffix = retrying
          ? ' · Syncing…'
          : failed
            ? ' · Failed to sync'
            : queuedAgo
              ? ` · Queued ${queuedAgo}`
              : ' · Queued offline';
        return (
          <li
            key={item.id}
            id={mealPlanQueueItemId(item.id)}
            tabIndex={failed ? -1 : undefined}
            className={`food-row food-row--${failed ? 'failed' : 'queued'}`}
            role={failed ? 'alert' : undefined}
          >
            <div>
              <strong>{label}</strong>
              <span className={`muted${failed ? ' meal-plan-queue-item-failed' : ''}`}>
                {item.description ? ` · ${item.description}` : ''}
                {statusSuffix}
              </span>
            </div>
            <div className="food-row-actions">
              {serverOnline && (
                <button
                  type="button"
                  className="btn-small"
                  data-meal-plan-retry=""
                  disabled={syncing || !!retryingId}
                  onClick={() => void onRetry(item)}
                >
                  {retrying ? 'Syncing…' : 'Retry'}
                </button>
              )}
              <button
                type="button"
                className="btn-small btn-danger"
                aria-label={`Dismiss queued ${label}`}
                disabled={retrying || syncing}
                onClick={() => onDismissItem(item.id)}
              >
                ×
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
