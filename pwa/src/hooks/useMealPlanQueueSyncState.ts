import { useCallback, useState } from 'react';
import {
  clearMealPlanFailedIds,
  getMealPlanFailedIds,
  getMealPlanQueue,
  pruneMealPlanFailedIds,
  removeMealPlanQueueItem,
  setMealPlanFailedIds,
  type QueuedMealPlanLog,
} from '../lib/mealPlanQueue';
import { dismissQueuedMealPlanItem } from '../lib/mealPlanQueueSyncApi';

export function useMealPlanQueueSyncState(clearError?: () => void) {
  const [mealPlanQueue, setMealPlanQueue] = useState<QueuedMealPlanLog[]>(() => getMealPlanQueue());
  const [syncingMealPlanQueue, setSyncingMealPlanQueue] = useState(false);
  const [mealPlanSyncProgress, setMealPlanSyncProgress] = useState<{ done: number; total: number } | null>(null);
  const [failedMealPlanIds, setFailedMealPlanIds] = useState<Set<string>>(
    () => new Set(getMealPlanFailedIds()),
  );
  const [retryingMealPlanId, setRetryingMealPlanId] = useState<string | null>(null);

  const syncMealPlanQueue = useCallback(() => {
    setMealPlanQueue(getMealPlanQueue());
  }, []);

  const applySuccessfulSync = useCallback((item: QueuedMealPlanLog) => {
    removeMealPlanQueueItem(item.id);
    setFailedMealPlanIds((prev) => {
      if (!prev.has(item.id)) return prev;
      const next = new Set(prev);
      next.delete(item.id);
      setMealPlanFailedIds(next);
      return next;
    });
  }, []);

  const markItemFailed = useCallback((itemId: string) => {
    setFailedMealPlanIds((prev) => new Set(prev).add(itemId));
  }, []);

  const pruneFailedIds = useCallback(() => {
    pruneMealPlanFailedIds();
    const remaining = getMealPlanFailedIds();
    if (remaining.length === 0) {
      setFailedMealPlanIds(new Set());
      clearError?.();
      return;
    }
    setFailedMealPlanIds(new Set(remaining));
  }, [clearError]);

  const dismissMealPlanItem = useCallback(
    (id: string) => {
      setFailedMealPlanIds(dismissQueuedMealPlanItem(id));
      syncMealPlanQueue();
    },
    [syncMealPlanQueue],
  );

  const resetFailedIds = useCallback(() => {
    clearMealPlanFailedIds();
    setFailedMealPlanIds(new Set());
  }, []);

  return {
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
  };
}
