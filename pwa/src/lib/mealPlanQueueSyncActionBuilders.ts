import type { FoodTodayResponse } from './api';
import type { QueuedMealPlanLog } from './mealPlanQueue';
import type {
  MealPlanQueueBatchRunControls,
  MealPlanQueueItemRetryControls,
  MealPlanSyncUndoContext,
} from './mealPlanQueueSyncRunner';

export interface MealPlanSyncUndoContextInput {
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

export function buildMealPlanSyncUndoContext(input: MealPlanSyncUndoContextInput): MealPlanSyncUndoContext {
  return {
    getFoodBeforeSync: input.getFoodBeforeSync,
    snapshotFoodRows: input.snapshotFoodRows,
    offerUndoFromSummary: input.offerUndoFromSummary,
    onFoodUpdated: input.onFoodUpdated,
    onBatchSynced: input.onBatchSynced,
    onItemLogged: input.onItemLogged,
    onItemOffline: input.onItemOffline,
    afterSync: input.afterSync,
    setError: input.setError,
  };
}

export interface MealPlanQueueBatchRunControlsInput {
  dismissMealPlanUndo: () => void;
  clearError?: () => void;
  setError?: (message: string) => void;
  setSyncingMealPlanQueue: (syncing: boolean) => void;
  setMealPlanSyncProgress: (progress: { done: number; total: number } | null) => void;
  applySuccessfulSync: (item: QueuedMealPlanLog) => void;
  markItemFailed: (id: string) => void;
  syncMealPlanQueue: () => void;
  pruneFailedIds: () => void;
}

export function buildMealPlanQueueBatchRunControls(
  input: MealPlanQueueBatchRunControlsInput,
): MealPlanQueueBatchRunControls {
  return {
    dismissMealPlanUndo: input.dismissMealPlanUndo,
    clearError: input.clearError,
    setSyncing: input.setSyncingMealPlanQueue,
    setProgress: input.setMealPlanSyncProgress,
    onItemSuccess: input.applySuccessfulSync,
    onItemFailure: (item, e) => {
      input.markItemFailed(item.id);
      input.setError?.(e instanceof Error ? e.message : 'Meal plan sync failed');
    },
    onQueueRefresh: input.syncMealPlanQueue,
    pruneFailedIds: input.pruneFailedIds,
  };
}

export interface MealPlanQueueItemRetryControlsInput {
  dismissMealPlanUndo: () => void;
  clearError?: () => void;
  setError?: (message: string) => void;
  onItemOffline?: (label: string) => void;
  setRetryingMealPlanId: (id: string | null) => void;
  applySuccessfulSync: (item: QueuedMealPlanLog) => void;
  markItemFailed: (id: string) => void;
  syncMealPlanQueue: () => void;
}

export function buildMealPlanQueueItemRetryControls(
  input: MealPlanQueueItemRetryControlsInput,
): MealPlanQueueItemRetryControls {
  return {
    dismissMealPlanUndo: input.dismissMealPlanUndo,
    clearError: input.clearError,
    setRetryingId: input.setRetryingMealPlanId,
    onItemSuccess: input.applySuccessfulSync,
    markItemFailed: input.markItemFailed,
    onQueueRefresh: input.syncMealPlanQueue,
    onItemOffline: input.onItemOffline,
    setError: input.setError,
  };
}

export function canRunMealPlanQueueSync(active: boolean, serverOnline: boolean): boolean {
  return active && serverOnline && (typeof navigator === 'undefined' || navigator.onLine);
}

export interface MealPlanSyncActionBundleInput extends MealPlanSyncUndoContextInput, MealPlanQueueBatchRunControlsInput {
  onItemOffline?: (label: string) => void;
  setRetryingMealPlanId: (id: string | null) => void;
}

export interface MealPlanSyncActionBundle {
  undoContext: MealPlanSyncUndoContext;
  batchControls: MealPlanQueueBatchRunControls;
  retryControls: MealPlanQueueItemRetryControls;
}

export function buildMealPlanSyncActionBundle(input: MealPlanSyncActionBundleInput): MealPlanSyncActionBundle {
  return {
    undoContext: buildMealPlanSyncUndoContext(input),
    batchControls: buildMealPlanQueueBatchRunControls(input),
    retryControls: buildMealPlanQueueItemRetryControls(input),
  };
}
