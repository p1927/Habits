import { fetchFoodTodaySnapshot } from './foodTodaySnapshot';
import { vibrateMealPlanSyncFailure, vibrateMealPlanSyncSuccess } from './haptics';
import {
  addMealPlanFailedId,
  isOfflineError,
  mealPlanQueueLabel,
  type QueuedMealPlanLog,
} from './mealPlanQueue';
import { logQueuedMealPlanItem } from './mealPlanQueueSyncApi';
import type { MealPlanSyncUndoContext } from './mealPlanQueueSyncTypes';

export async function runMealPlanSingleSync(
  item: QueuedMealPlanLog,
  ctx: MealPlanSyncUndoContext,
  callbacks: {
    onSuccess: (item: QueuedMealPlanLog) => void;
    onOffline: () => void;
    onFailure: (error: unknown) => void;
    onQueueRefresh: () => void;
  },
): Promise<void> {
  try {
    const beforeRaw = await ctx.getFoodBeforeSync();
    const before = beforeRaw ?? (await fetchFoodTodaySnapshot());
    const summary = await logQueuedMealPlanItem(item);
    if (summary) {
      callbacks.onSuccess(item);
      vibrateMealPlanSyncSuccess();
      ctx.onFoodUpdated?.(summary);
      callbacks.onQueueRefresh();
      const label = mealPlanQueueLabel(item);
      const offeredUndo = ctx.offerUndoFromSummary(ctx.snapshotFoodRows(before), summary, label);
      ctx.onItemLogged?.(label, offeredUndo);
      ctx.afterSync?.();
    }
  } catch (e) {
    if (isOfflineError(e)) {
      callbacks.onOffline();
    } else {
      addMealPlanFailedId(item.id);
      vibrateMealPlanSyncFailure();
      callbacks.onFailure(e);
    }
  }
}
