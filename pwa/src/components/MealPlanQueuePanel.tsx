import { MealPlanQueueList } from './MealPlanQueueList';
import { MealPlanQueuePanelBanner } from './MealPlanQueuePanelBanner';
import { MealPlanQueueSyncProgressBar } from './MealPlanQueueSyncProgressBar';
import { useMealPlanQueuePanel } from '../hooks/useMealPlanQueuePanel';
import type { MealPlanQueuePanelProps } from '../lib/mealPlanQueuePanelTypes';

export type { MealPlanQueuePanelProps, MealPlanQueuePanelVariant } from '../lib/mealPlanQueuePanelTypes';

export function MealPlanQueuePanel(props: MealPlanQueuePanelProps) {
  const {
    serverOnline,
    queue,
    syncing,
    syncProgress,
    failedIds,
    retryingId,
    syncAllLabel = 'Sync now',
    clearAllLabel = 'Dismiss all',
    onSyncAll,
    onRetryFailed,
    onRetry,
    onDismissItem,
    onClearAll,
  } = props;

  const panel = useMealPlanQueuePanel(props);

  return (
    <div
      ref={panel.panelRef}
      id="meal-plan-queue-panel"
      tabIndex={-1}
      className={panel.panelClassName}
      role="status"
    >
      <MealPlanQueuePanelBanner
        bannerText={panel.bannerText}
        failedCount={panel.failedCount}
        serverOnline={serverOnline}
        syncing={syncing}
        retryingId={retryingId}
        syncAllLabel={syncAllLabel}
        clearAllLabel={clearAllLabel}
        announceSyncProgress={panel.announceSyncProgress}
        syncBtnRef={panel.syncBtnRef}
        onSyncAll={onSyncAll}
        onRetryFailed={onRetryFailed}
        onClearAll={onClearAll}
      />
      {syncing && syncProgress && (
        <MealPlanQueueSyncProgressBar
          className={panel.progressClassName}
          syncProgress={syncProgress}
          announceSyncProgress={panel.announceSyncProgress}
        />
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
