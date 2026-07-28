import {
  countFailedMealPlanQueueItems,
  mealPlanQueueBannerText,
  mealPlanQueuePanelClasses,
  mealPlanQueueProgressClass,
  mealPlanQueueShortcutHint,
} from '../lib/mealPlanQueuePanelCopy';
import type { MealPlanQueuePanelProps } from '../lib/mealPlanQueuePanelTypes';
import { useMealPlanQueuePanelFocus } from './useMealPlanQueuePanelFocus';
import { useMealPlanQueueShortcuts } from './useMealPlanQueueShortcuts';

export function useMealPlanQueuePanel({
  serverOnline,
  queue,
  syncing,
  syncProgress,
  failedIds,
  retryingId,
  variant = 'default',
  noPlanToday = false,
  bannerSuffix = '',
  syncActionHint = 'Sync now',
  onSyncAll,
  onRetryFailed,
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

  return {
    failedCount,
    panelRef,
    syncBtnRef,
    announceSyncProgress,
    bannerText,
    panelClassName: mealPlanQueuePanelClasses(variant, { syncing, noPlanToday, failedCount }),
    progressClassName: mealPlanQueueProgressClass(variant),
  };
}
