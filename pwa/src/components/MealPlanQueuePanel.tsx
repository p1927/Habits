import { MealPlanQueueList } from './MealPlanQueueList';
import type { QueuedMealPlanLog } from '../lib/mealPlanQueue';
import { useMealPlanQueuePanelFocus } from '../hooks/useMealPlanQueuePanelFocus';
import { useMealPlanQueueShortcuts } from '../hooks/useMealPlanQueueShortcuts';

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
  onRetryFailed?: () => void;
  onRetry: (item: QueuedMealPlanLog) => void;
  onDismissItem: (id: string) => void;
  onClearAll: () => void;
  scrollToQueueToken?: number;
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
  onRetryFailed,
  onRetry,
  onDismissItem,
  onClearAll,
  scrollToQueueToken = 0,
}: MealPlanQueuePanelProps) {
  const failedCount = queue.filter((item) => failedIds.has(item.id)).length;
  const isHome = variant === 'home';
  const panelClass = isHome ? 'home-meal-plan-queue-panel' : 'meal-plan-queue-panel';
  const progressClass = isHome ? 'home-meal-plan-sync-progress' : 'meal-plan-sync-progress';

  const { panelRef, syncBtnRef, prefersReducedMotion } = useMealPlanQueuePanelFocus({
    queue,
    failedIds,
    failedCount,
    serverOnline,
    syncing,
    retryingId,
    scrollToQueueToken,
  });

  const announceSyncProgress = syncing && syncProgress && !prefersReducedMotion;

  useMealPlanQueueShortcuts({
    enabled: queue.length > 0 || syncing,
    serverOnline,
    syncing,
    retrying: !!retryingId,
    failedCount,
    onSyncAll,
    onRetryFailed: failedCount > 0 ? onRetryFailed : undefined,
  });

  const shortcutHint =
    failedCount > 0 && onRetryFailed
      ? ` · press S or ${syncActionHint} · R retry failed`
      : ` · press S or ${syncActionHint}`;

  const bannerText =
    syncing && syncProgress
      ? `Syncing meal logs (${syncProgress.done}/${syncProgress.total})…`
      : `${queue.length} meal log${queue.length === 1 ? '' : 's'} queued${
          failedCount > 0 ? ` · ${failedCount} failed` : ''
        }${bannerSuffix}${serverOnline ? shortcutHint : ' — will sync when online'}.`;

  return (
    <div
      ref={panelRef}
      id="meal-plan-queue-panel"
      tabIndex={-1}
      className={`${panelClass}${syncing ? ` ${panelClass}--syncing` : ''}${
        isHome && noPlanToday ? ` ${panelClass}--no-plan` : ''
      }${failedCount > 0 ? ` ${panelClass}--has-failed` : ''}`}
      role="status"
    >
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
                className="btn-small"
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
              className="btn-small"
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
          aria-live={announceSyncProgress ? 'polite' : undefined}
          aria-atomic={announceSyncProgress ? 'true' : undefined}
          aria-valuenow={syncProgress.done}
          aria-valuemin={0}
          aria-valuemax={syncProgress.total}
          aria-valuetext={`Syncing meal logs, ${syncProgress.done} of ${syncProgress.total} complete`}
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
      <MealPlanQueueList
        queue={queue}
        failedIds={failedIds}
        retryingId={retryingId}
        serverOnline={serverOnline}
        syncing={syncing}
        onRetry={onRetry}
        onDismissItem={onDismissItem}
      />
    </div>
  );
}
