import { runMealPlanBatchSync } from './mealPlanQueueBatchSync';
import { runMealPlanSingleSync } from './mealPlanQueueSingleSync';
import { mealPlanQueueLabel, type MealPlanSyncSource, type QueuedMealPlanLog } from './mealPlanQueue';
import type {
  MealPlanQueueBatchRunControls,
  MealPlanQueueItemRetryControls,
  MealPlanSyncUndoContext,
} from './mealPlanQueueSyncTypes';

export async function executeMealPlanQueueBatchRun(
  items: QueuedMealPlanLog[],
  syncSource: MealPlanSyncSource,
  undoContext: MealPlanSyncUndoContext,
  controls: MealPlanQueueBatchRunControls,
): Promise<void> {
  if (!items.length) return;

  controls.setSyncing(true);
  controls.clearError?.();
  controls.dismissMealPlanUndo();

  try {
    await runMealPlanBatchSync(items, syncSource, undoContext, {
      onProgress: (done, total) => controls.setProgress({ done, total }),
      onItemSuccess: controls.onItemSuccess,
      onItemFailure: controls.onItemFailure,
      onQueueRefresh: controls.onQueueRefresh,
    });
  } finally {
    controls.setSyncing(false);
    controls.setProgress(null);
    controls.onQueueRefresh();
    controls.pruneFailedIds();
  }
}

export async function executeMealPlanQueueItemRetry(
  item: QueuedMealPlanLog,
  undoContext: MealPlanSyncUndoContext,
  controls: MealPlanQueueItemRetryControls,
): Promise<void> {
  controls.setRetryingId(item.id);
  controls.clearError?.();
  controls.dismissMealPlanUndo();

  try {
    await runMealPlanSingleSync(item, undoContext, {
      onSuccess: controls.onItemSuccess,
      onOffline: () => controls.onItemOffline?.(mealPlanQueueLabel(item)),
      onFailure: (e) => {
        controls.markItemFailed(item.id);
        controls.setError?.(e instanceof Error ? e.message : 'Meal plan sync failed');
      },
      onQueueRefresh: controls.onQueueRefresh,
    });
  } finally {
    controls.setRetryingId(null);
  }
}
