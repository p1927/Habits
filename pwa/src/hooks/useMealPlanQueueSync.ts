import { useCallback, useEffect, useState } from 'react';
import { api, type FoodTodayResponse } from '../lib/api';
import { vibrateMealPlanSyncSuccess } from '../lib/haptics';
import {
  addMealPlanFailedId,
  clearMealPlanFailedIds,
  getMealPlanFailedIds,
  getMealPlanQueue,
  isOfflineError,
  MEAL_PLAN_QUEUE_CHANGE,
  mealPlanQueueLabel,
  mealPlanSyncUndoLabel,
  pruneMealPlanFailedIds,
  removeMealPlanQueueItem,
  setMealPlanFailedIds,
  setMealPlanQueueSyncStatus,
  type MealPlanSyncSource,
  type QueuedMealPlanLog,
} from '../lib/mealPlanQueue';

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

  const syncOneMealPlanItem = useCallback(async (item: QueuedMealPlanLog): Promise<FoodTodayResponse | null> => {
    let summary: FoodTodayResponse | null = null;
    if (item.kind === 'all') {
      summary = (await api.logMealPlanToday()).summary;
    } else if (item.meal) {
      summary = (await api.logMealPlanItem(item.meal)).summary;
    } else {
      return null;
    }
    removeMealPlanQueueItem(item.id);
    setFailedMealPlanIds((prev) => {
      if (!prev.has(item.id)) return prev;
      const next = new Set(prev);
      next.delete(item.id);
      setMealPlanFailedIds(next);
      return next;
    });
    return summary;
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

  const runQueueSync = useCallback(
    async (items: QueuedMealPlanLog[]) => {
      if (!active || !serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
      if (!items.length) return;

      setSyncingMealPlanQueue(true);
      clearError?.();
      dismissMealPlanUndo();
      const total = items.length;
      setMealPlanSyncProgress({ done: 0, total });
      setMealPlanQueueSyncStatus({ syncing: true, done: 0, total, source: syncSource });
      let synced = 0;
      const labels: string[] = [];
      let lastSummary: FoodTodayResponse | null = null;

      try {
        const beforeRaw = await getFoodBeforeSync();
        const before = beforeRaw ?? (await api.getFoodToday());
        const beforeRows = snapshotFoodRows(before);

        for (const item of items) {
          try {
            const summary = await syncOneMealPlanItem(item);
            if (summary) {
              lastSummary = summary;
              synced += 1;
              labels.push(mealPlanQueueLabel(item));
              setMealPlanSyncProgress({ done: synced, total });
              setMealPlanQueueSyncStatus({ syncing: true, done: synced, total, source: syncSource });
              syncMealPlanQueue();
            }
          } catch (e) {
          if (isOfflineError(e)) break;
          addMealPlanFailedId(item.id);
          setFailedMealPlanIds((prev) => new Set(prev).add(item.id));
            setError?.(e instanceof Error ? e.message : 'Meal plan sync failed');
            break;
          }
        }

        if (synced > 0 && lastSummary) {
          vibrateMealPlanSyncSuccess();
          onFoodUpdated?.(lastSummary);
          const label = mealPlanSyncUndoLabel(synced, labels);
          const offeredUndo = offerUndoFromSummary(beforeRows, lastSummary, label);
          onBatchSynced?.(synced, offeredUndo);
          afterSync?.();
        }
      } catch (e) {
        setError?.(e instanceof Error ? e.message : 'Meal plan sync failed');
      } finally {
        setSyncingMealPlanQueue(false);
        setMealPlanSyncProgress(null);
        setMealPlanQueueSyncStatus(null);
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
      getFoodBeforeSync,
      snapshotFoodRows,
      offerUndoFromSummary,
      onFoodUpdated,
      onBatchSynced,
      afterSync,
      setError,
      syncOneMealPlanItem,
      syncMealPlanQueue,
      pruneFailedIds,
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
        const beforeRaw = await getFoodBeforeSync();
        const before = beforeRaw ?? (await api.getFoodToday());
        const summary = await syncOneMealPlanItem(item);
        if (summary) {
          vibrateMealPlanSyncSuccess();
          onFoodUpdated?.(summary);
          syncMealPlanQueue();
          const label = mealPlanQueueLabel(item);
          const offeredUndo = offerUndoFromSummary(snapshotFoodRows(before), summary, label);
          onItemLogged?.(label, offeredUndo);
          afterSync?.();
        }
      } catch (e) {
        if (isOfflineError(e)) {
          onItemOffline?.(mealPlanQueueLabel(item));
        } else {
          addMealPlanFailedId(item.id);
          setFailedMealPlanIds((prev) => new Set(prev).add(item.id));
          setError?.(e instanceof Error ? e.message : 'Meal plan sync failed');
        }
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
      getFoodBeforeSync,
      onFoodUpdated,
      onItemLogged,
      onItemOffline,
      afterSync,
      setError,
      syncOneMealPlanItem,
      syncMealPlanQueue,
      snapshotFoodRows,
      offerUndoFromSummary,
    ],
  );

  const dismissMealPlanItem = useCallback(
    (id: string) => {
      removeMealPlanQueueItem(id);
      setFailedMealPlanIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        setMealPlanFailedIds(next);
        return next;
      });
      syncMealPlanQueue();
    },
    [syncMealPlanQueue],
  );

  const resetFailedIds = useCallback(() => {
    clearMealPlanFailedIds();
    setFailedMealPlanIds(new Set());
  }, []);

  useEffect(() => {
    if (!active || !watchQueueChanges) return;
    syncMealPlanQueue();
    const onQueueChange = () => syncMealPlanQueue();
    window.addEventListener(MEAL_PLAN_QUEUE_CHANGE, onQueueChange);
    return () => window.removeEventListener(MEAL_PLAN_QUEUE_CHANGE, onQueueChange);
  }, [active, watchQueueChanges, syncMealPlanQueue]);

  useEffect(() => {
    if (!active || !autoFlushOnMount) return;
    void flushMealPlanQueue();
  }, [active, autoFlushOnMount, flushMealPlanQueue]);

  useEffect(() => {
    if (!active || (!watchOnline && !watchFocus)) return;
    const onWake = () => {
      syncMealPlanQueue();
      void flushMealPlanQueue();
    };
    if (watchOnline) window.addEventListener('online', onWake);
    if (watchFocus) window.addEventListener('focus', onWake);
    return () => {
      if (watchOnline) window.removeEventListener('online', onWake);
      if (watchFocus) window.removeEventListener('focus', onWake);
    };
  }, [active, watchOnline, watchFocus, syncMealPlanQueue, flushMealPlanQueue]);

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
