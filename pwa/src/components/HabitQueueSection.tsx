import { useEffect, useState } from 'react';
import { formatRelativeTime } from '../lib/relativeTime';
import { HabitQueueEmptyHint } from './HabitQueueEmptyHint';
import type { QueuedHabitEntry } from '../hooks/useOptimisticHabitLog';

export interface HabitQueueSectionProps {
  queuedCount: number;
  failedCount: number;
  pending: QueuedHabitEntry[];
  queueSyncClearedToken: number;
  metricLabel: (metric: string) => string;
  onDismissAll: () => void;
  onRetryAll: () => void;
  onRetry: (entry: QueuedHabitEntry) => void;
  onDismiss: (id: string) => void;
}

export function HabitQueueSection({
  queuedCount,
  failedCount,
  pending,
  queueSyncClearedToken,
  metricLabel,
  onDismissAll,
  onRetryAll,
  onRetry,
  onDismiss,
}: HabitQueueSectionProps) {
  const [announceEmpty, setAnnounceEmpty] = useState(false);

  useEffect(() => {
    if (!queueSyncClearedToken) return;
    setAnnounceEmpty(true);
    const id = window.setTimeout(() => setAnnounceEmpty(false), 1500);
    return () => window.clearTimeout(id);
  }, [queueSyncClearedToken]);

  if (failedCount > 0) {
    return (
      <>
        <div className="banner banner-warn banner-row banner-revolut" role="alert">
          <span>
            {failedCount} habit update{failedCount === 1 ? '' : 's'} failed to save.
          </span>
          <button type="button" className="btn-small btn-pill" onClick={onRetryAll}>
            Retry all
          </button>
        </div>
        <ul className="food-list habit-sync-list" aria-label="Failed habit updates">
          {pending
            .filter((e) => e.status === 'failed')
            .map((entry) => (
              <li key={entry.id} className="food-row food-row--failed" role="alert">
                <div>
                  <strong>{metricLabel(entry.metric)}</strong>
                  <span className="muted"> · {entry.value ?? 0}h · Failed to save</span>
                </div>
                <div className="food-row-actions">
                  <button
                    type="button"
                    className="btn-small"
                    aria-label={`Retry ${metricLabel(entry.metric)}`}
                    onClick={() => onRetry(entry)}
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    className="btn-small btn-danger"
                    aria-label={`Dismiss failed ${metricLabel(entry.metric)}`}
                    onClick={() => onDismiss(entry.id)}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
        </ul>
      </>
    );
  }

  if (queuedCount > 0) {
    return (
      <>
        <div className="banner banner-warn banner-row banner-revolut" role="status">
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
