import { useCallback } from 'react';
import {
  getMealPlanQueue,
  type QueuedMealPlanLog,
  type MealPlanSyncSource,
} from '../lib/mealPlanQueue';
import { canRunMealPlanQueueSync } from '../lib/mealPlanQueueSyncActionBuilders';
import {
  executeMealPlanQueueBatchRun,
  executeMealPlanQueueItemRetry,
} from '../lib/mealPlanQueueSyncRunner';
import { runMealPlanFlushGuarded } from '../lib/mealPlanQueueFlushLock';
import type { MealPlanSyncActionBundle } from '../lib/mealPlanQueueSyncActionBuilders';

interface UseMealPlanQueueSyncActionRunnersOptions {
  active: boolean;
  serverOnline: boolean;
  syncSource: MealPlanSyncSource;
  failedMealPlanIds: Set<string>;
  retryingMealPlanId: string | null;
  undoContext: MealPlanSyncActionBundle['undoContext'];
  batchControls: MealPlanSyncActionBundle['batchControls'];
  retryControls: MealPlanSyncActionBundle['retryControls'];
}

export function useMealPlanQueueSyncActionRunners({
  active,
  serverOnline,
  syncSource,
  failedMealPlanIds,
  retryingMealPlanId,
  undoContext,
  batchControls,
  retryControls,
}: UseMealPlanQueueSyncActionRunnersOptions) {
  const runQueueSync = useCallback(
    async (items: QueuedMealPlanLog[]) => {
      if (!canRunMealPlanQueueSync(active, serverOnline)) return;
      await executeMealPlanQueueBatchRun(items, syncSource, undoContext, batchControls);
    },
    [active, serverOnline, syncSource, undoContext, batchControls],
  );

  const flushMealPlanQueue = useCallback(async () => {
    await runMealPlanFlushGuarded(syncSource, () => runQueueSync(getMealPlanQueue()));
  }, [runQueueSync, syncSource]);

  const retryFailedMealPlanQueue = useCallback(async () => {
    const failed = getMealPlanQueue().filter((item) => failedMealPlanIds.has(item.id));
    await runQueueSync(failed);
  }, [runQueueSync, failedMealPlanIds]);

  const retryMealPlanItem = useCallback(
    async (item: QueuedMealPlanLog) => {
      if (!canRunMealPlanQueueSync(active, serverOnline) || retryingMealPlanId) return;
      await executeMealPlanQueueItemRetry(item, undoContext, retryControls);
    },
    [active, serverOnline, retryingMealPlanId, undoContext, retryControls],
  );

  return {
    runQueueSync,
    flushMealPlanQueue,
    retryFailedMealPlanQueue,
    retryMealPlanItem,
  };
}
