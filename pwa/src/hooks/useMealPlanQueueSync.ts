import { useMealPlanQueueSyncActions } from './useMealPlanQueueSyncActions';
import type { UseMealPlanQueueSyncOptions } from './useMealPlanQueueSyncOptions';
import { useMealPlanQueueSyncEffects } from './useMealPlanQueueSyncEffects';
import { useMealPlanQueueSyncState } from './useMealPlanQueueSyncState';

export type { UseMealPlanQueueSyncOptions };

export function useMealPlanQueueSync(options: UseMealPlanQueueSyncOptions) {
  const {
    syncSource = 'log',
    active = true,
    autoFlushOnMount = false,
    watchOnline = false,
    watchFocus = false,
    watchQueueChanges = false,
    clearError,
  } = options;

  const syncState = useMealPlanQueueSyncState(clearError);
  const {
    mealPlanQueue,
    syncingMealPlanQueue,
    mealPlanSyncProgress,
    failedMealPlanIds,
    retryingMealPlanId,
    syncMealPlanQueue,
  } = syncState;

  const {
    flushMealPlanQueue,
    retryFailedMealPlanQueue,
    retryMealPlanItem,
    dismissMealPlanItem,
    resetFailedIds,
  } = useMealPlanQueueSyncActions({ ...options, syncState });

  useMealPlanQueueSyncEffects({
    syncSource,
    active,
    autoFlushOnMount,
    watchOnline,
    watchFocus,
    watchQueueChanges,
    syncMealPlanQueue,
    flushMealPlanQueue,
    setFailedMealPlanIds: syncState.setFailedMealPlanIds,
  });

  return {
    mealPlanQueue,
    syncingMealPlanQueue,
    mealPlanSyncProgress,
    failedMealPlanIds,
    retryingMealPlanId,
    syncMealPlanQueue,
    flushMealPlanQueue,
    retryFailedMealPlanQueue,
    retryMealPlanItem,
    dismissMealPlanItem,
    resetFailedIds,
  };
}
