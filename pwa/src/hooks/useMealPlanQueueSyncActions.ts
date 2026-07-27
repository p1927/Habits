import { useMemo } from 'react';
import { buildMealPlanSyncActionBundle } from '../lib/mealPlanQueueSyncActionBuilders';
import type { useMealPlanQueueSyncState } from './useMealPlanQueueSyncState';
import type { UseMealPlanQueueSyncOptions } from './useMealPlanQueueSyncOptions';
import { useMealPlanSyncStableCallbacks } from './useMealPlanSyncStableCallbacks';
import { useMealPlanQueueSyncActionRunners } from './useMealPlanQueueSyncActionRunners';

export type { UseMealPlanQueueSyncOptions } from './useMealPlanQueueSyncOptions';

type SyncState = ReturnType<typeof useMealPlanQueueSyncState>;

interface UseMealPlanQueueSyncActionsOptions extends UseMealPlanQueueSyncOptions {
  syncState: SyncState;
}

export function useMealPlanQueueSyncActions({
  serverOnline,
  syncSource = 'home',
  active = true,
  getFoodBeforeSync,
  onFoodUpdated,
  afterSync,
  dismissMealPlanUndo,
  snapshotFoodRows,
  offerUndoFromSummary,
  onBatchSynced,
  onItemLogged,
  onItemOffline,
  setError,
  clearError,
  syncState,
}: UseMealPlanQueueSyncActionsOptions) {
  const {
    failedMealPlanIds,
    retryingMealPlanId,
    setSyncingMealPlanQueue,
    setMealPlanSyncProgress,
    setRetryingMealPlanId,
    syncMealPlanQueue,
    applySuccessfulSync,
    markItemFailed,
    pruneFailedIds,
    dismissMealPlanItem,
    resetFailedIds,
  } = syncState;

  const stableCallbacks = useMealPlanSyncStableCallbacks({
    getFoodBeforeSync,
    onFoodUpdated,
    afterSync,
    onBatchSynced,
    onItemLogged,
    onItemOffline,
    setError,
    clearError,
  });

  const { undoContext, batchControls, retryControls } = useMemo(
    () =>
      buildMealPlanSyncActionBundle({
        getFoodBeforeSync: stableCallbacks.stableGetFoodBeforeSync,
        snapshotFoodRows,
        offerUndoFromSummary,
        onFoodUpdated: stableCallbacks.stableOnFoodUpdated,
        onBatchSynced: stableCallbacks.stableOnBatchSynced,
        onItemLogged: stableCallbacks.stableOnItemLogged,
        onItemOffline: stableCallbacks.stableOnItemOffline,
        afterSync: stableCallbacks.stableAfterSync,
        setError: stableCallbacks.stableSetError,
        dismissMealPlanUndo,
        clearError: stableCallbacks.stableClearError,
        setSyncingMealPlanQueue,
        setMealPlanSyncProgress,
        applySuccessfulSync,
        markItemFailed,
        syncMealPlanQueue,
        pruneFailedIds,
        setRetryingMealPlanId,
      }),
    [
      stableCallbacks,
      snapshotFoodRows,
      offerUndoFromSummary,
      dismissMealPlanUndo,
      setSyncingMealPlanQueue,
      setMealPlanSyncProgress,
      applySuccessfulSync,
      markItemFailed,
      syncMealPlanQueue,
      pruneFailedIds,
      setRetryingMealPlanId,
    ],
  );

  const runners = useMealPlanQueueSyncActionRunners({
    active,
    serverOnline,
    syncSource,
    failedMealPlanIds,
    retryingMealPlanId,
    undoContext,
    batchControls,
    retryControls,
  });

  return {
    ...runners,
    dismissMealPlanItem,
    resetFailedIds,
  };
}
