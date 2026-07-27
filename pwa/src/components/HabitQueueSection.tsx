import { useEffect, useState } from 'react';
import { formatRelativeTime } from '../lib/relativeTime';
import { HabitQueueEmptyHint } from './HabitQueueEmptyHint';
import type { QueuedHabitEntry } from '../hooks/useOptimisticHabitLog';

export interface HabitQueueSectionProps {
  queuedCount: number;
  pending: QueuedHabitEntry[];
  queueSyncClearedToken: number;
  metricLabel: (metric: string) => string;
  onDismissAll: () => void;
}

export function HabitQueueSection({
  queuedCount,
  pending,
  queueSyncClearedToken,
  metricLabel,
  onDismissAll,
}: HabitQueueSectionProps) {
  const [announceEmpty, setAnnounceEmpty] = useState(false);

  useEffect(() => {
    if (!queueSyncClearedToken) return;
    setAnnounceEmpty(true);
    const id = window.setTimeout(() => setAnnounceEmpty(false), 1500);
    return () => window.clearTimeout(id);
  }, [queueSyncClearedToken]);

  if (queuedCount > 0) {
    return (
      <>
        <div className="banner banner-warn banner-row" role="status">
          <span>
            {queuedCount} habit update{queuedCount === 1 ? '' : 's'} queued — will sync when online.
          </span>
          <button
            type="button"
            className="btn-small"
            aria-label="Dismiss offline habit update queue"
            onClick={onDismissAll}
          >
            Dismiss
          </button>
        </div>
        <ul className="food-list habit-sync-list" aria-label="Queued habit updates">
          {pending
            .filter((e) => e.status === 'queued')
            .map((entry) => {
              const queuedAgo = formatRelativeTime(entry.created_at);
              return (
                <li key={entry.id} className="food-row food-row--queued">
                  <div>
                    <strong>{metricLabel(entry.metric)}</strong>
                    <span className="muted">
                      {' '}
                      · {entry.value ?? 0}h
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

  if (announceEmpty) {
    return <HabitQueueEmptyHint announce />;
  }

  return null;
}
