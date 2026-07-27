import { useCallback } from 'react';
import { type FoodTodayResponse } from '../lib/api';
import {
  getMealPlanQueue,
  mealPlanQueueLabel,
  type MealPlanSyncSource,
  type QueuedMealPlanLog,
} from '../lib/mealPlanQueue';
import {
  runMealPlanBatchSync,
  runMealPlanSingleSync,
  type MealPlanSyncUndoContext,
} from '../lib/mealPlanQueueSyncRunner';
import { useMealPlanQueueSyncEffects } from './useMealPlanQueueSyncEffects';
import { useMealPlanQueueSyncState } from './useMealPlanQueueSyncState';

export interface UseMealPlanQueueSyncOptions {
  serverOnline: boolean;
  syncSource?: MealPlanSyncSource;
  active?: boolean;
  autoFlushOnMount?: boolean;
  watchOnline?: boolean;
  watchFocus?: boolean;
  watchQueueChanges?: boolean;
  getFoodBeforeSync: () => FoodTodayResponse | null | Promise<FoodTodayResponse | null>;
  onFoodUpdated?: (summary: FoodTodayResponse) => void;
  afterSync?: () => void;
  dismissMealPlanUndo: () => void;
  snapshotFoodRows: (summary: FoodTodayResponse | null) => Set<number>;
  offerUndoFromSummary: (beforeRows: Set<number>, afterSummary: FoodTodayResponse, label: string) => boolean;
  onBatchSynced?: (synced: number, offeredUndo: boolean) => void;
  onItemLogged?: (label: string, offeredUndo: boolean) => void;
  onItemOffline?: (label: string) => void;
  setError?: (message: string) => void;
  clearError?: () => void;
}

export function useMealPlanQueueSync({
  serverOnline,
  syncSource = 'home',
  active = true,
  autoFlushOnMount = false,
  watchOnline = false,
  watchFocus = false,
  watchQueueChanges = false,
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
}: UseMealPlanQueueSyncOptions) {
  const {
    mealPlanQueue,
    syncingMealPlanQueue,
    setSyncingMealPlanQueue,
    mealPlanSyncProgress,
    setMealPlanSyncProgress,
    failedMealPlanIds,
    setFailedMealPlanIds,
    retryingMealPlanId,
    setRetryingMealPlanId,
    syncMealPlanQueue,
    applySuccessfulSync,
    markItemFailed,
    pruneFailedIds,
    dismissMealPlanItem,
    resetFailedIds,
  } = useMealPlanQueueSyncState(clearError);

  const undoContext: MealPlanSyncUndoContext = {
    getFoodBeforeSync,
    snapshotFoodRows,
    offerUndoFromSummary,
    onFoodUpdated,
    onBatchSynced,
    onItemLogged,
    onItemOffline,
    afterSync,
    setError,
  };

  const runQueueSync = useCallback(
    async (items: QueuedMealPlanLog[]) => {
      if (!active || !serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
      if (!items.length) return;

      setSyncingMealPlanQueue(true);
      clearError?.();
      dismissMealPlanUndo();

      try {
        await runMealPlanBatchSync(items, syncSource, undoContext, {
          onProgress: (done, total) => setMealPlanSyncProgress({ done, total }),
          onItemSuccess: applySuccessfulSync,
          onItemFailure: (item, e) => {
            markItemFailed(item.id);
            setError?.(e instanceof Error ? e.message : 'Meal plan sync failed');
          },
          onQueueRefresh: syncMealPlanQueue,
        });
      } finally {
        setSyncingMealPlanQueue(false);
        setMealPlanSyncProgress(null);
        syncMealPlanQueue();
        pruneFailedIds();
      }
    },
    [
      active,
      serverOnline,
      syncSource,
      clearError,
      dismissMealPlanUndo,
      applySuccessfulSync,
      markItemFailed,
      syncMealPlanQueue,
      pruneFailedIds,
      setSyncingMealPlanQueue,
      setMealPlanSyncProgress,
      getFoodBeforeSync,
      snapshotFoodRows,
      offerUndoFromSummary,
      onFoodUpdated,
      onBatchSynced,
      onItemLogged,
      onItemOffline,
      afterSync,
      setError,
    ],
  );

  const flushMealPlanQueue = useCallback(async () => {
    await runQueueSync(getMealPlanQueue());
  }, [runQueueSync]);

  const retryFailedMealPlanQueue = useCallback(async () => {
    const queue = getMealPlanQueue();
    const failed = queue.filter((item) => failedMealPlanIds.has(item.id));
    await runQueueSync(failed);
  }, [runQueueSync, failedMealPlanIds]);

  const retryMealPlanItem = useCallback(
    async (item: QueuedMealPlanLog) => {
      if (!active || !serverOnline || retryingMealPlanId) return;
      setRetryingMealPlanId(item.id);
      clearError?.();
      dismissMealPlanUndo();
      try {
        await runMealPlanSingleSync(item, undoContext, {
          onSuccess: applySuccessfulSync,
          onOffline: () => onItemOffline?.(mealPlanQueueLabel(item)),
          onFailure: (e) => {
            markItemFailed(item.id);
            setError?.(e instanceof Error ? e.message : 'Meal plan sync failed');
          },
          onQueueRefresh: syncMealPlanQueue,
        });
      } finally {
        setRetryingMealPlanId(null);
      }
    },
    [
      active,
      serverOnline,
      retryingMealPlanId,
      clearError,
      dismissMealPlanUndo,
      applySuccessfulSync,
      markItemFailed,
      syncMealPlanQueue,
      setRetryingMealPlanId,
      getFoodBeforeSync,
      snapshotFoodRows,
      offerUndoFromSummary,
      onFoodUpdated,
      onItemLogged,
      onItemOffline,
      afterSync,
      setError,
    ],
  );

  useMealPlanQueueSyncEffects({
    active,
    autoFlushOnMount,
    watchOnline,
    watchFocus,
    watchQueueChanges,
    syncMealPlanQueue,
    flushMealPlanQueue,
    setFailedMealPlanIds,
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
