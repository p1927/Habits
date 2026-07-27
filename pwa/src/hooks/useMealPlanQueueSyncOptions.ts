import { type FoodTodayResponse } from '../lib/api';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

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
