import type { RefObject } from 'react';

interface MealPlanQueuePanelBannerProps {
  bannerText: string;
  failedCount: number;
  serverOnline: boolean;
  syncing: boolean;
  retryingId: string | null;
  syncAllLabel: string;
  clearAllLabel: string;
  announceSyncProgress: boolean;
  syncBtnRef: RefObject<HTMLButtonElement | null>;
  onSyncAll: () => void;
  onRetryFailed?: () => void;
  onClearAll: () => void;
}

export function MealPlanQueuePanelBanner({
  bannerText,
  failedCount,
  serverOnline,
  syncing,
  retryingId,
  syncAllLabel,
  clearAllLabel,
  announceSyncProgress,
  syncBtnRef,
  onSyncAll,
  onRetryFailed,
  onClearAll,
}: MealPlanQueuePanelBannerProps) {
  return (
    <div className={`banner banner-row banner-revolut${failedCount > 0 ? ' banner-err' : ' banner-warn'}`}>
      <span
        aria-live={announceSyncProgress ? 'polite' : undefined}
        aria-atomic={announceSyncProgress ? 'true' : undefined}
      >
        {bannerText}
      </span>
      {serverOnline && (
        <>
          {failedCount > 0 && onRetryFailed && (
            <button
              type="button"
              className="btn-pill btn-pill-outline"
              disabled={syncing || !!retryingId}
              aria-keyshortcuts="R"
              onClick={() => void onRetryFailed()}
            >
              Retry failed
            </button>
          )}
          <button
            type="button"
            ref={syncBtnRef}
            className="btn-pill"
            disabled={syncing || !!retryingId}
            aria-keyshortcuts="S"
            onClick={() => void onSyncAll()}
          >
            {syncing ? 'Syncing…' : syncAllLabel}
          </button>
        </>
      )}
      <button
        type="button"
        className="btn-pill btn-pill-outline"
        aria-label="Dismiss meal plan log queue"
        disabled={syncing}
        onClick={onClearAll}
      >
        {clearAllLabel}
      </button>
    </div>
  );
}
