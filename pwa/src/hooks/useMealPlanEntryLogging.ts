import { useCallback, useState } from 'react';
import { api, type FoodTodayResponse } from '../lib/api';
import { executeMealPlanEntryLog } from '../lib/mealPlanEntryLog';
import type { MealPlanEntry, MealPlanSyncSource } from '../lib/mealPlanQueue';

interface UseMealPlanEntryLoggingOptions {
  serverOnline: boolean;
  syncSource: MealPlanSyncSource;
  syncMealPlanQueue: () => void;
  dismissMealPlanUndo: () => void;
  snapshotFoodRows: (summary: FoodTodayResponse | null) => Set<number>;
  offerUndoFromSummary: (
    beforeRows: Set<number>,
    afterSummary: FoodTodayResponse,
    label: string,
  ) => boolean;
  setMessage: (msg: string) => void;
  setError: (msg: string) => void;
  getFoodBeforeSync?: () => Promise<FoodTodayResponse>;
  onFoodUpdated?: (summary: FoodTodayResponse) => void;
  onAfterLog?: () => void;
}

export function useMealPlanEntryLogging({
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
}: UseMealPlanEntryLoggingOptions) {
  const [loggingMealKey, setLoggingMealKey] = useState<string | null>(null);
  const [loggingMeals, setLoggingMeals] = useState(false);

  const resolveFoodBefore = useCallback(async () => {
    if (getFoodBeforeSync) return getFoodBeforeSync();
    return api.getFoodToday();
  }, [getFoodBeforeSync]);

  const logCtx = {
    serverOnline,
    syncSource,
    syncMealPlanQueue,
    dismissMealPlanUndo,
    snapshotFoodRows,
    offerUndoFromSummary,
    setMessage,
    setError,
    resolveFoodBefore,
    onFoodUpdated,
    onAfterLog,
  };

  const logMealPlanEntry = useCallback(
    (entry: MealPlanEntry) => {
      setLoggingMealKey(entry.meal);
      void executeMealPlanEntryLog({
        ...logCtx,
        request: {
          kind: 'item',
          meal: entry.meal,
          label: entry.label,
          description: entry.description,
          queueMessage: `${entry.label} queued — will log when online`,
        },
      }).finally(() => setLoggingMealKey(null));
    },
    [serverOnline, syncSource, syncMealPlanQueue, dismissMealPlanUndo, snapshotFoodRows, offerUndoFromSummary, setMessage, setError, resolveFoodBefore, onFoodUpdated, onAfterLog],
  );

  const logAllMealPlan = useCallback(() => {
    setLoggingMeals(true);
    void executeMealPlanEntryLog({
      ...logCtx,
      request: {
        kind: 'all',
        label: 'All planned meals',
        queueMessage: 'All planned meals queued — will log when online',
      },
    }).finally(() => setLoggingMeals(false));
  }, [serverOnline, syncSource, syncMealPlanQueue, dismissMealPlanUndo, snapshotFoodRows, offerUndoFromSummary, setMessage, setError, resolveFoodBefore, onFoodUpdated, onAfterLog]);

  return { loggingMealKey, loggingMeals, logMealPlanEntry, logAllMealPlan };
}
