import { useMemo } from 'react';
import type { OptimisticFoodEntry } from '../lib/optimisticFoodLog';
import type { UseOptimisticFoodLogOptions } from '../lib/optimisticFoodLogHookTypes';
import { useFoodLogQueueFlush } from './useFoodLogQueueFlush';
import { useOptimisticFoodLogActions } from './useOptimisticFoodLogActions';
import { useOptimisticFoodPendingState } from './useOptimisticFoodPendingState';

export type { OptimisticFoodEntry };

export type { UseOptimisticFoodLogOptions } from '../lib/optimisticFoodLogHookTypes';

export function useOptimisticFoodLog({
  serverOnline,
  setData,
  setSuccess,
  setError,
}: UseOptimisticFoodLogOptions) {
  const {
    pending,
    setPending,
    queueSyncClearedToken,
    setQueueSyncClearedToken,
    syncQueuedFromStorage,
  } = useOptimisticFoodPendingState();

  const { flushQueue } = useFoodLogQueueFlush({
    serverOnline,
    setData,
    setSuccess,
    setError,
    setPending,
    setQueueSyncClearedToken,
    syncQueuedFromStorage,
  });

  const optimisticCtx = useMemo(
    () => ({ serverOnline, setData, setSuccess, setError, setPending }),
    [serverOnline, setData, setSuccess, setError, setPending],
  );

  const actions = useOptimisticFoodLogActions(optimisticCtx, pending);

  return {
    pending,
    ...actions,
    flushQueue,
    queuedCount: pending.filter((x) => x.status === 'queued').length,
    failedCount: pending.filter((x) => x.status === 'failed').length,
    queueSyncClearedToken,
  };
}
