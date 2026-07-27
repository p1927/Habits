import { useCallback, useEffect, useRef } from 'react';
import type { FoodTodayResponse } from '../lib/api';
import { fetchFoodTodaySnapshot, primeFoodTodaySnapshot } from '../lib/foodTodaySnapshot';
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

  const foodRef = useRef(food);
  foodRef.current = food;

  useEffect(() => {
    if (food) primeFoodTodaySnapshot(food);
  }, [food]);

  const getFoodBeforeSync = useCallback(async () => {
    if (foodRef.current) return foodRef.current;
    return fetchFoodTodaySnapshot();
  }, []);

  const clearError = useCallback(() => setError(''), [setError]);

  const onBatchSynced = useCallback(
    (synced: number, offeredUndo: boolean) => {
      if (!offeredUndo) {
        setMessage(`Synced ${synced} queued meal log${synced === 1 ? '' : 's'}`);
      }
    },
    [setMessage],
  );

  const onItemLogged = useCallback(
    (label: string, offeredUndo: boolean) => {
      if (!offeredUndo) setMessage(`Logged ${label}`);
    },
    [setMessage],
  );

  const onItemOffline = useCallback(
    (label: string) => setMessage(`${label} still queued — offline`),
    [setMessage],
  );

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
