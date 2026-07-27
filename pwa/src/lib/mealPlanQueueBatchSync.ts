import type { FoodTodayResponse } from './api';
import { fetchFoodTodaySnapshot } from './foodTodaySnapshot';
import { vibrateMealPlanSyncFailure, vibrateMealPlanSyncSuccess } from './haptics';
import {
  isOfflineError,
  mealPlanQueueLabel,
  mealPlanSyncUndoLabel,
  setMealPlanQueueSyncStatus,
  type MealPlanSyncSource,
  type QueuedMealPlanLog,
} from './mealPlanQueue';
import { logQueuedMealPlanItem } from './mealPlanQueueSyncApi';
import type { MealPlanBatchSyncCallbacks, MealPlanSyncUndoContext } from './mealPlanQueueSyncTypes';

export async function runMealPlanBatchSync(
  items: QueuedMealPlanLog[],
  syncSource: MealPlanSyncSource,
  ctx: MealPlanSyncUndoContext,
  callbacks: MealPlanBatchSyncCallbacks,
): Promise<void> {
  if (!items.length) return;

  const total = items.length;
  setMealPlanQueueSyncStatus({ syncing: true, done: 0, total, source: syncSource });
  callbacks.onProgress(0, total);

  let synced = 0;
  const labels: string[] = [];
  let lastSummary: FoodTodayResponse | null = null;

  try {
    const beforeRaw = await ctx.getFoodBeforeSync();
    const before = beforeRaw ?? (await fetchFoodTodaySnapshot());
    const beforeRows = ctx.snapshotFoodRows(before);

    for (const item of items) {
      try {
        const summary = await logQueuedMealPlanItem(item);
        if (!summary) continue;
        callbacks.onItemSuccess(item);
        lastSummary = summary;
        synced += 1;
        labels.push(mealPlanQueueLabel(item));
        callbacks.onProgress(synced, total);
        setMealPlanQueueSyncStatus({ syncing: true, done: synced, total, source: syncSource });
        callbacks.onQueueRefresh();
      } catch (e) {
        if (isOfflineError(e)) break;
        callbacks.onItemFailure(item, e);
        break;
      }
    }

    if (synced > 0 && lastSummary) {
      vibrateMealPlanSyncSuccess();
      ctx.onFoodUpdated?.(lastSummary);
      const label = mealPlanSyncUndoLabel(synced, labels);
      const offeredUndo = ctx.offerUndoFromSummary(beforeRows, lastSummary, label);
      ctx.onBatchSynced?.(synced, offeredUndo);
      ctx.afterSync?.();
    }
  } catch (e) {
    if (!isOfflineError(e)) vibrateMealPlanSyncFailure();
    ctx.setError?.(e instanceof Error ? e.message : 'Meal plan sync failed');
  } finally {
    setMealPlanQueueSyncStatus(null);
  }
}
