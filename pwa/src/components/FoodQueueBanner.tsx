import { useEffect, useState } from 'react';
import { FoodQueueEmptyHint } from './FoodQueueEmptyHint';

export interface FoodQueueBannerProps {
  queuedCount: number;
  queueSyncClearedToken: number;
  onDismiss: () => void;
  onFocusQueue?: () => void;
}

export function FoodQueueBanner({
  queuedCount,
  queueSyncClearedToken,
  onDismiss,
  onFocusQueue,
}: FoodQueueBannerProps) {
  const [announceEmpty, setAnnounceEmpty] = useState(false);

  useEffect(() => {
    if (!queueSyncClearedToken) return;
    setAnnounceEmpty(true);
    const id = window.setTimeout(() => setAnnounceEmpty(false), 1500);
    return () => window.clearTimeout(id);
  }, [queueSyncClearedToken]);

  if (queuedCount > 0) {
    const queueLabel = `${queuedCount} food log${queuedCount === 1 ? '' : 's'} queued offline — tap to view queue`;

    return (
      <div className="banner banner-warn banner-row banner-revolut" role="status">
        {onFocusQueue ? (
          <button
            type="button"
            className="food-queue-banner__body"
            aria-label={queueLabel}
            onClick={onFocusQueue}
          >
            {queuedCount} food log{queuedCount === 1 ? '' : 's'} queued offline — tap to view queue
          </button>
        ) : (
          <span>
            {queuedCount} food log{queuedCount === 1 ? '' : 's'} queued offline — will sync when online.
          </span>
        )}
        <button
          type="button"
          className="btn-pill btn-pill-outline"
          aria-label="Dismiss offline food log queue"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (announceEmpty) {
    return <FoodQueueEmptyHint announce />;
  }

  return null;
}
