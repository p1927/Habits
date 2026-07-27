import { api, type FoodTodayResponse } from './api';
import { vibrateMealPlanSyncFailure, vibrateMealPlanSyncSuccess } from './haptics';
import {
  addMealPlanFailedId,
  isOfflineError,
  mealPlanQueueLabel,
  mealPlanSyncUndoLabel,
  setMealPlanQueueSyncStatus,
  type MealPlanSyncSource,
  type QueuedMealPlanLog,
} from './mealPlanQueue';
import { logQueuedMealPlanItem } from './mealPlanQueueSyncApi';

export interface MealPlanSyncUndoContext {
  getFoodBeforeSync: () => FoodTodayResponse | null | Promise<FoodTodayResponse | null>;
  snapshotFoodRows: (summary: FoodTodayResponse | null) => Set<number>;
  offerUndoFromSummary: (beforeRows: Set<number>, afterSummary: FoodTodayResponse, label: string) => boolean;
  onFoodUpdated?: (summary: FoodTodayResponse) => void;
  onBatchSynced?: (synced: number, offeredUndo: boolean) => void;
  onItemLogged?: (label: string, offeredUndo: boolean) => void;
  onItemOffline?: (label: string) => void;
  afterSync?: () => void;
  setError?: (message: string) => void;
}

export interface MealPlanBatchSyncCallbacks {
  onProgress: (done: number, total: number) => void;
  onItemSuccess: (item: QueuedMealPlanLog) => void;
  onItemFailure: (item: QueuedMealPlanLog, error: unknown) => void;
  onQueueRefresh: () => void;
}

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
    const before = beforeRaw ?? (await api.getFoodToday());
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
    const before = beforeRaw ?? (await api.getFoodToday());
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
