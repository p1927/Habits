import { MealPlanQueueList } from './MealPlanQueueList';
import { MealPlanQueuePanelBanner } from './MealPlanQueuePanelBanner';
import { MealPlanQueueSyncProgressBar } from './MealPlanQueueSyncProgressBar';
import type { QueuedMealPlanLog } from '../lib/mealPlanQueue';
import {
  countFailedMealPlanQueueItems,
  mealPlanQueueBannerText,
  mealPlanQueuePanelClasses,
  mealPlanQueueProgressClass,
  mealPlanQueueShortcutHint,
  type MealPlanQueuePanelVariant,
} from '../lib/mealPlanQueuePanelCopy';
import { useMealPlanQueuePanelFocus } from '../hooks/useMealPlanQueuePanelFocus';
import { useMealPlanQueueShortcuts } from '../hooks/useMealPlanQueueShortcuts';

export type { MealPlanQueuePanelVariant } from '../lib/mealPlanQueuePanelCopy';

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
  const failedCount = countFailedMealPlanQueueItems(queue, failedIds);

  const { panelRef, syncBtnRef, prefersReducedMotion } = useMealPlanQueuePanelFocus({
    queue,
    failedIds,
    failedCount,
    serverOnline,
    syncing,
    retryingId,
    scrollToQueueToken,
  });

  const announceSyncProgress = syncing && !!syncProgress && !prefersReducedMotion;

  useMealPlanQueueShortcuts({
    enabled: queue.length > 0 || syncing,
    serverOnline,
    syncing,
    retrying: !!retryingId,
    failedCount,
    onSyncAll,
    onRetryFailed: failedCount > 0 ? onRetryFailed : undefined,
  });

  const bannerText = mealPlanQueueBannerText(
    queue.length,
    failedCount,
    serverOnline,
    syncing,
    syncProgress,
    bannerSuffix,
    mealPlanQueueShortcutHint(failedCount, onRetryFailed, syncActionHint),
  );

  return (
    <div
      ref={panelRef}
      id="meal-plan-queue-panel"
      tabIndex={-1}
      className={mealPlanQueuePanelClasses(variant, { syncing, noPlanToday, failedCount })}
      role="status"
    >
      <MealPlanQueuePanelBanner
        bannerText={bannerText}
        failedCount={failedCount}
        serverOnline={serverOnline}
        syncing={syncing}
        retryingId={retryingId}
        syncAllLabel={syncAllLabel}
        clearAllLabel={clearAllLabel}
        announceSyncProgress={announceSyncProgress}
        syncBtnRef={syncBtnRef}
        onSyncAll={onSyncAll}
        onRetryFailed={onRetryFailed}
        onClearAll={onClearAll}
      />
      {syncing && syncProgress && (
        <MealPlanQueueSyncProgressBar
          className={mealPlanQueueProgressClass(variant)}
          syncProgress={syncProgress}
          announceSyncProgress={announceSyncProgress}
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
