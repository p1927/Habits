import { useCallback } from 'react';
import type { FoodTodayResponse } from '../lib/api';
import { dismissAllMealPlanQueue, type MealPlanSyncSource } from '../lib/mealPlanQueue';
import { useMealPlanUndo } from './useMealPlanUndo';
import { useMealPlanQueueSync } from './useMealPlanQueueSync';
import { useMealPlanEntryLogging } from './useMealPlanEntryLogging';
import { useMealPlanShellSyncContext } from './useMealPlanShellSyncContext';

interface UseMealPlanShellOptions {
  serverOnline: boolean;
  syncSource: MealPlanSyncSource;
  setMessage: (msg: string) => void;
  setError: (msg: string) => void;
  active?: boolean;
  autoFlushOnMount?: boolean;
  watchFocus?: boolean;
  watchQueueChanges?: boolean;
  food?: FoodTodayResponse | null;
  onFoodUpdated?: (summary: FoodTodayResponse) => void;
  afterSync?: () => void;
  onAfterLog?: () => void;
}

export function useMealPlanShell({
  serverOnline,
  syncSource,
  setMessage,
  setError,
  active = true,
  autoFlushOnMount = true,
  watchFocus = false,
  watchQueueChanges = false,
  food,
  onFoodUpdated,
  afterSync,
  onAfterLog,
}: UseMealPlanShellOptions) {
  const {
    undoLog: mealPlanUndo,
    undoing: mealPlanUndoing,
    dismissUndo: dismissMealPlanUndo,
    snapshotRows: snapshotFoodRows,
    offerUndoFromSummary,
    handleUndo: handleMealPlanUndo,
  } = useMealPlanUndo(serverOnline);

  const {
    getFoodBeforeSync,
    clearError,
    onBatchSynced,
    onItemLogged,
    onItemOffline,
  } = useMealPlanShellSyncContext({ food, setMessage, setError });

  const {
    mealPlanQueue,
    syncingMealPlanQueue,
    mealPlanSyncProgress,
    failedMealPlanIds,
    retryingMealPlanId,
    syncMealPlanQueue,
    flushMealPlanQueue,
    retryFailedMealPlanQueue,
    retryMealPlanItem,
    dismissMealPlanItem,
  } = useMealPlanQueueSync({
    serverOnline,
    syncSource,
    active,
    autoFlushOnMount,
    watchOnline: true,
    watchFocus,
    watchQueueChanges,
    getFoodBeforeSync,
    onFoodUpdated,
    afterSync,
    dismissMealPlanUndo,
    snapshotFoodRows,
    offerUndoFromSummary,
    onBatchSynced,
    onItemLogged,
    onItemOffline,
    setError,
    clearError,
  });

  const { loggingMealKey, loggingMeals, logMealPlanEntry, logAllMealPlan } = useMealPlanEntryLogging({
    serverOnline,
    syncSource,
    syncMealPlanQueue,
    dismissMealPlanUndo,
    snapshotFoodRows,
    offerUndoFromSummary,
    setMessage,
    setError,
    getFoodBeforeSync,
    onFoodUpdated,
    onAfterLog,
  });

  const clearMealPlanQueue = useCallback(() => {
    dismissAllMealPlanQueue();
    syncMealPlanQueue();
    setMessage('Meal plan log queue cleared');
  }, [syncMealPlanQueue, setMessage]);

  return {
    mealPlanUndo,
    mealPlanUndoing,
    dismissMealPlanUndo,
    handleMealPlanUndo,
    mealPlanQueue,
    syncingMealPlanQueue,
    mealPlanSyncProgress,
    failedMealPlanIds,
    retryingMealPlanId,
    syncMealPlanQueue,
    flushMealPlanQueue,
    retryFailedMealPlanQueue,
    retryMealPlanItem,
    dismissMealPlanItem,
    loggingMealKey,
    loggingMeals,
    logMealPlanEntry,
    logAllMealPlan,
    clearMealPlanQueue,
  };
}
