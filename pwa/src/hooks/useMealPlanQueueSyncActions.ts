import { useCallback, useMemo } from 'react';
import { type FoodTodayResponse } from '../lib/api';
import {
  getMealPlanQueue,
  type MealPlanSyncSource,
  type QueuedMealPlanLog,
} from '../lib/mealPlanQueue';
import {
  executeMealPlanQueueBatchRun,
  executeMealPlanQueueItemRetry,
  type MealPlanSyncUndoContext,
} from '../lib/mealPlanQueueSyncRunner';
import type { useMealPlanQueueSyncState } from './useMealPlanQueueSyncState';

type SyncState = ReturnType<typeof useMealPlanQueueSyncState>;

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

  const undoContext = useMemo<MealPlanSyncUndoContext>(
    () => ({
      getFoodBeforeSync,
      snapshotFoodRows,
      offerUndoFromSummary,
      onFoodUpdated,
      onBatchSynced,
      onItemLogged,
      onItemOffline,
      afterSync,
      setError,
    }),
    [
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

  const batchControls = useMemo(
    () => ({
      dismissMealPlanUndo,
      clearError,
      setSyncing: setSyncingMealPlanQueue,
      setProgress: setMealPlanSyncProgress,
      onItemSuccess: applySuccessfulSync,
      onItemFailure: (item: QueuedMealPlanLog, e: unknown) => {
        markItemFailed(item.id);
        setError?.(e instanceof Error ? e.message : 'Meal plan sync failed');
      },
      onQueueRefresh: syncMealPlanQueue,
      pruneFailedIds,
    }),
    [
      dismissMealPlanUndo,
      clearError,
      setSyncingMealPlanQueue,
      setMealPlanSyncProgress,
      applySuccessfulSync,
      markItemFailed,
      syncMealPlanQueue,
      pruneFailedIds,
      setError,
    ],
  );

  const runQueueSync = useCallback(
    async (items: QueuedMealPlanLog[]) => {
      if (!active || !serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
      await executeMealPlanQueueBatchRun(items, syncSource, undoContext, batchControls);
    },
    [active, serverOnline, syncSource, undoContext, batchControls],
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
      await executeMealPlanQueueItemRetry(item, undoContext, {
        dismissMealPlanUndo,
        clearError,
        setRetryingId: setRetryingMealPlanId,
        onItemSuccess: applySuccessfulSync,
        markItemFailed,
        onQueueRefresh: syncMealPlanQueue,
        onItemOffline,
        setError,
      });
    },
    [
      active,
      serverOnline,
      retryingMealPlanId,
      undoContext,
      dismissMealPlanUndo,
      clearError,
      setRetryingMealPlanId,
      applySuccessfulSync,
      markItemFailed,
      syncMealPlanQueue,
      onItemOffline,
      setError,
    ],
  );

  return {
    runQueueSync,
    flushMealPlanQueue,
    retryFailedMealPlanQueue,
    retryMealPlanItem,
    dismissMealPlanItem,
    resetFailedIds,
  };
}
