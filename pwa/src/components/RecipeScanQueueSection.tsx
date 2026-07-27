import { formatRelativeTime } from '../lib/relativeTime';
import type { QueuedRecipeScan } from '../lib/recipeScanQueue';

export interface RecipeScanQueueSectionProps {
  queue: QueuedRecipeScan[];
  onDismiss: () => void;
}

export function RecipeScanQueueSection({ queue, onDismiss }: RecipeScanQueueSectionProps) {
  if (queue.length === 0) return null;

  return (
    <>
      <div className="banner banner-warn banner-row" role="status">
        <span>
          {queue.length} recipe photo{queue.length === 1 ? '' : 's'} queued — will scan when online.
        </span>
        <button
          type="button"
          className="btn-small"
          aria-label="Dismiss recipe scan queue"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
      <ul className="food-list recipe-scan-queue-list" aria-label="Queued recipe photos">
        {queue.map((item) => {
          const queuedAgo = formatRelativeTime(item.created_at);
          return (
            <li key={item.id} className="food-row food-row--queued">
              <div>
                <strong>{item.label}</strong>
                <span className="muted">
                  {queuedAgo ? ` · Queued ${queuedAgo}` : ' · Queued offline'}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
