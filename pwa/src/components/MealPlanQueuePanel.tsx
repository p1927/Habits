import { mealPlanQueueLabel, type QueuedMealPlanLog } from '../lib/mealPlanQueue';

export type MealPlanQueuePanelVariant = 'home' | 'default';

export interface MealPlanQueuePanelProps {
  serverOnline: boolean;
  queue: QueuedMealPlanLog[];
  syncing: boolean;
  syncProgress: { done: number; total: number } | null;
  failedIds: Set<string>;
  retryingId: string | null;
  variant?: MealPlanQueuePanelVariant;
  noPlanToday?: boolean;
  syncAllLabel?: string;
  clearAllLabel?: string;
  bannerSuffix?: string;
  syncActionHint?: string;
  onSyncAll: () => void;
  onRetry: (item: QueuedMealPlanLog) => void;
  onDismissItem: (id: string) => void;
  onClearAll: () => void;
}

export function MealPlanQueuePanel({
  serverOnline,
  queue,
  syncing,
  syncProgress,
  failedIds,
  retryingId,
  variant = 'default',
  noPlanToday = false,
  syncAllLabel = 'Sync now',
  clearAllLabel = 'Dismiss all',
  bannerSuffix = '',
  syncActionHint = 'Sync now',
  onSyncAll,
  onRetry,
  onDismissItem,
  onClearAll,
}: MealPlanQueuePanelProps) {
  const failedCount = queue.filter((item) => failedIds.has(item.id)).length;
  const isHome = variant === 'home';
  const panelClass = isHome ? 'home-meal-plan-queue-panel' : 'meal-plan-queue-panel';
  const progressClass = isHome ? 'home-meal-plan-sync-progress' : 'meal-plan-sync-progress';

  const bannerText =
    syncing && syncProgress
      ? `Syncing meal logs (${syncProgress.done}/${syncProgress.total})…`
      : `${queue.length} meal log${queue.length === 1 ? '' : 's'} queued${
          failedCount > 0 ? ` · ${failedCount} failed` : ''
        }${bannerSuffix}${serverOnline ? ` — tap Retry or ${syncActionHint}` : ' — will sync when online'}.`;

  return (
    <div
      className={`${panelClass}${syncing ? ` ${panelClass}--syncing` : ''}${
        isHome && noPlanToday ? ` ${panelClass}--no-plan` : ''
      }${failedCount > 0 ? ` ${panelClass}--has-failed` : ''}`}
      role="status"
    >
      <div className={`banner banner-row${failedCount > 0 ? ' banner-err' : ' banner-warn'}`}>
        <span>{bannerText}</span>
        {serverOnline && (
          <button
            type="button"
            className="btn-small"
            disabled={syncing || !!retryingId}
            onClick={() => void onSyncAll()}
          >
            {syncing ? 'Syncing…' : syncAllLabel}
          </button>
        )}
        <button
          type="button"
          className="btn-small"
          aria-label="Dismiss meal plan log queue"
          disabled={syncing}
          onClick={onClearAll}
        >
          {clearAllLabel}
        </button>
      </div>
      {syncing && syncProgress && syncProgress.total > 0 && (
        <div
          className={progressClass}
          role="progressbar"
          aria-valuenow={syncProgress.done}
          aria-valuemin={0}
          aria-valuemax={syncProgress.total}
          aria-label="Meal plan sync progress"
        >
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(syncProgress.done / syncProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
      {queue.length > 0 && (
        <ul className="food-list meal-plan-queue-list" aria-label="Queued meal logs">
          {queue.map((item) => {
            const failed = failedIds.has(item.id);
            const retrying = retryingId === item.id;
            const label = mealPlanQueueLabel(item);
            return (
              <li
                key={item.id}
                className={`food-row food-row--${failed ? 'failed' : 'queued'}`}
                role={failed ? 'alert' : undefined}
              >
                <div>
                  <strong>{label}</strong>
                  <span className={`muted${failed ? ' meal-plan-queue-item-failed' : ''}`}>
                    {item.description ? ` · ${item.description}` : ''}
                    {retrying ? ' · Syncing…' : failed ? ' · Failed to sync' : ' · Queued offline'}
                  </span>
                </div>
                <div className="food-row-actions">
                  {serverOnline && (
                    <button
                      type="button"
                      className="btn-small"
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
      )}
    </div>
  );
}
