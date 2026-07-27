import { useCallback, useState } from 'react';
import { api, type FoodTodayResponse } from '../lib/api';
import {
  enqueueMealPlanLog,
  isOfflineError,
  type MealPlanEntry,
  type MealPlanSyncSource,
} from '../lib/mealPlanQueue';

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

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
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

  const logMealPlanEntry = useCallback(
    (entry: MealPlanEntry) => {
      setLoggingMealKey(entry.meal);
      setMessage('');
      setError('');
      dismissMealPlanUndo();

      if (!serverOnline || isOffline()) {
        enqueueMealPlanLog(
          {
            kind: 'item',
            meal: entry.meal,
            label: entry.label,
            description: entry.description,
          },
          { source: syncSource },
        );
        syncMealPlanQueue();
        setMessage(`${entry.label} queued — will log when online`);
        setLoggingMealKey(null);
        return;
      }

      void (async () => {
        try {
          const before = await resolveFoodBefore();
          const res = await api.logMealPlanItem(entry.meal);
          onFoodUpdated?.(res.summary);
          if (!offerUndoFromSummary(snapshotFoodRows(before), res.summary, entry.label)) {
            setMessage(res.message);
          }
          onAfterLog?.();
        } catch (e) {
          if (isOfflineError(e)) {
            enqueueMealPlanLog(
              {
                kind: 'item',
                meal: entry.meal,
                label: entry.label,
                description: entry.description,
              },
              { source: syncSource },
            );
            syncMealPlanQueue();
            setMessage(`${entry.label} queued — will log when online`);
            return;
          }
          setError(e instanceof Error ? e.message : 'Meal log failed');
        } finally {
          setLoggingMealKey(null);
        }
      })();
    },
    [
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
    ],
  );

  const logAllMealPlan = useCallback(() => {
    setLoggingMeals(true);
    setMessage('');
    setError('');
    dismissMealPlanUndo();

    if (!serverOnline || isOffline()) {
      enqueueMealPlanLog({ kind: 'all' }, { source: syncSource });
      syncMealPlanQueue();
      setMessage('All planned meals queued — will log when online');
      setLoggingMeals(false);
      return;
    }

    void (async () => {
      try {
        const before = await resolveFoodBefore();
        const res = await api.logMealPlanToday();
        onFoodUpdated?.(res.summary);
        if (!offerUndoFromSummary(snapshotFoodRows(before), res.summary, 'All planned meals')) {
          setMessage(res.message);
        }
        onAfterLog?.();
      } catch (e) {
        if (isOfflineError(e)) {
          enqueueMealPlanLog({ kind: 'all' }, { source: syncSource });
          syncMealPlanQueue();
          setMessage('All planned meals queued — will log when online');
          return;
        }
        setError(e instanceof Error ? e.message : 'Meal log failed');
      } finally {
        setLoggingMeals(false);
      }
    })();
  }, [
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
  ]);

  return { loggingMealKey, loggingMeals, logMealPlanEntry, logAllMealPlan };
}
