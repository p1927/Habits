import type { FoodTodayResponse } from './api';
import type { QueuedMealPlanLog } from './mealPlanQueue';

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

export interface MealPlanQueueBatchRunControls {
  dismissMealPlanUndo: () => void;
  clearError?: () => void;
  setSyncing: (syncing: boolean) => void;
  setProgress: (progress: { done: number; total: number } | null) => void;
  onItemSuccess: (item: QueuedMealPlanLog) => void;
  onItemFailure: (item: QueuedMealPlanLog, error: unknown) => void;
  onQueueRefresh: () => void;
  pruneFailedIds: () => void;
}

export interface MealPlanQueueItemRetryControls {
  dismissMealPlanUndo: () => void;
  clearError?: () => void;
  setRetryingId: (id: string | null) => void;
  onItemSuccess: (item: QueuedMealPlanLog) => void;
  markItemFailed: (id: string) => void;
  onQueueRefresh: () => void;
  onItemOffline?: (label: string) => void;
  setError?: (message: string) => void;
}
