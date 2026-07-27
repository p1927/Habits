import { useCallback, useState } from 'react';
import { getFoodLogQueue } from '../lib/foodQueue';
import { queueToOptimisticEntry, type OptimisticFoodEntry } from '../lib/optimisticFoodLog';

export function useOptimisticFoodPendingState() {
  const [pending, setPending] = useState<OptimisticFoodEntry[]>(() =>
    getFoodLogQueue().map(queueToOptimisticEntry),
  );
  const [queueSyncClearedToken, setQueueSyncClearedToken] = useState(0);

  const syncQueuedFromStorage = useCallback(() => {
    setPending((current) => {
      const queued = getFoodLogQueue().map(queueToOptimisticEntry);
      const active = current.filter((x) => x.status !== 'queued');
      const activeIds = new Set(active.map((x) => x.id));
      return [...active, ...queued.filter((q) => !activeIds.has(q.id))];
    });
  }, []);

  return {
    pending,
    setPending,
    queueSyncClearedToken,
    setQueueSyncClearedToken,
    syncQueuedFromStorage,
  };
}

export type OptimisticFoodPendingState = ReturnType<typeof useOptimisticFoodPendingState>;
