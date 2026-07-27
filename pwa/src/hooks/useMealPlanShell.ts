import { useCallback } from 'react';
import { api, type FoodTodayResponse } from '../lib/api';
import { dismissAllMealPlanQueue, type MealPlanSyncSource } from '../lib/mealPlanQueue';
import { useMealPlanUndo } from './useMealPlanUndo';
import { useMealPlanQueueSync } from './useMealPlanQueueSync';
import { useMealPlanEntryLogging } from './useMealPlanEntryLogging';

interface UseMealPlanShellOptions {
  serverOnline: boolean;
  syncSource: MealPlanSyncSource;
  setMessage: (msg: string) => void;
  setError: (msg: string) => void;
  active?: boolean;
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

  const getFoodBeforeSync = useCallback(async () => {
    if (food !== undefined) return food ?? (await api.getFoodToday());
    return api.getFoodToday();
  }, [food]);

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
    autoFlushOnMount: true,
    watchOnline: true,
    watchFocus,
    watchQueueChanges,
    getFoodBeforeSync,
    onFoodUpdated,
    afterSync,
    dismissMealPlanUndo,
    snapshotFoodRows,
    offerUndoFromSummary,
    onBatchSynced: (synced, offeredUndo) => {
      if (!offeredUndo) {
        setMessage(`Synced ${synced} queued meal log${synced === 1 ? '' : 's'}`);
      }
    },
    onItemLogged: (label, offeredUndo) => {
      if (!offeredUndo) setMessage(`Logged ${label}`);
    },
    onItemOffline: (label) => setMessage(`${label} still queued — offline`),
    setError,
    clearError: () => setError(''),
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
