import { useCallback, useState } from 'react';
import { api, type FoodTodayResponse } from '../lib/api';
import {
  enqueueFoodLog,
  getFoodLogQueue,
  removeFoodLogQueueItem,
  clearFoodLogQueue,
} from '../lib/foodQueue';
import {
  executeOptimisticFoodLog,
  queueToOptimisticEntry,
  type OptimisticFoodEntry,
} from '../lib/optimisticFoodLog';
import { useFoodLogQueueFlush } from './useFoodLogQueueFlush';

export type { OptimisticFoodEntry };

interface UseOptimisticFoodLogOptions {
  serverOnline: boolean;
  setData: (data: FoodTodayResponse | null) => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}

export function useOptimisticFoodLog({
  serverOnline,
  setData,
  setSuccess,
  setError,
}: UseOptimisticFoodLogOptions) {
  const [pending, setPending] = useState<OptimisticFoodEntry[]>(() =>
    getFoodLogQueue().map(queueToOptimisticEntry),
  );
  const [queueSyncClearedToken, setQueueSyncClearedToken] = useState(0);

  const syncQueuedFromStorage = useCallback(() => {
    setPending((current) => {
      const queued = getFoodLogQueue().map(queueToOptimisticEntry);
      const active = current.filter((x) => x.status !== 'queued');
      const activeIds = new Set(active.map((x) => x.id));
      return [...active, ...queued.filter((q) => !activeIds.has(q.id))];
    });
  }, []);

  const { flushQueue } = useFoodLogQueueFlush({
    serverOnline,
    setData,
    setSuccess,
    setError,
    setPending,
    setQueueSyncClearedToken,
    syncQueuedFromStorage,
  });

  const optimisticCtx = {
    serverOnline,
    setData,
    setSuccess,
    setError,
    setPending,
  };

  const logItem = useCallback(
    async (food: string, quantity_g: number, onSuccess?: (summary: FoodTodayResponse) => void) => {
      const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await executeOptimisticFoodLog({
        ...optimisticCtx,
        id,
        pendingEntry: { id, food, quantity_g, status: 'pending' },
        enqueue: (reuseId) => enqueueFoodLog({ kind: 'item', food, quantity_g, id: reuseId }),
        submit: () => api.logFoodItem(food, quantity_g),
        onSuccess,
      });
    },
    [serverOnline, setData, setSuccess, setError],
  );

  const logMacros = useCallback(
    async (
      food: string,
      quantity_g: number,
      macros: { calories: number; carbs: number; protein: number; fat: number },
      onSuccess?: (summary: FoodTodayResponse) => void,
    ) => {
      const id = `pending-macros-${Date.now()}`;
      await executeOptimisticFoodLog({
        ...optimisticCtx,
        id,
        pendingEntry: { id, food, quantity_g, status: 'pending', source: 'macros' },
        enqueue: (reuseId) =>
          enqueueFoodLog({ kind: 'macros', food, quantity_g, ...macros, id: reuseId }),
        submit: () => api.logFoodMacros({ food, quantity_g, ...macros }),
        onSuccess,
      });
    },
    [serverOnline, setData, setSuccess, setError],
  );

  const logMeal = useCallback(
    async (description: string, meal_type: string, onSuccess?: () => void) => {
      const id = `pending-meal-${Date.now()}`;
      await executeOptimisticFoodLog({
        ...optimisticCtx,
        id,
        pendingEntry: { id, food: description, quantity_g: 0, status: 'pending', meal_type },
        enqueue: (reuseId) =>
          enqueueFoodLog({ kind: 'meal', description, meal_type, id: reuseId }),
        submit: () => api.logFood(description, meal_type),
        onOfflineComplete: onSuccess,
        onSuccess: () => onSuccess?.(),
      });
    },
    [serverOnline, setData, setSuccess, setError],
  );

  const logSavedRecipe = useCallback(async () => {
    const id = `pending-recipe-${Date.now()}`;
    await executeOptimisticFoodLog({
      ...optimisticCtx,
      id,
      pendingEntry: {
        id,
        food: 'Entire saved recipe',
        quantity_g: 0,
        status: 'pending',
        source: 'saved_recipe',
      },
      enqueue: (reuseId) => enqueueFoodLog({ kind: 'saved_recipe', id: reuseId }),
      submit: () => api.logSavedRecipe(),
    });
  }, [serverOnline, setData, setSuccess, setError]);

  const retry = useCallback(
    (entry: OptimisticFoodEntry) => {
      const queued = getFoodLogQueue().find((q) => q.id === entry.id);
      removeFoodLogQueueItem(entry.id);
      setPending((p) => p.filter((x) => x.id !== entry.id));
      if (queued?.kind === 'macros') {
        void logMacros(queued.food, queued.quantity_g, {
          calories: queued.calories,
          carbs: queued.carbs,
          protein: queued.protein,
          fat: queued.fat,
        });
      } else if (queued?.kind === 'meal') {
        void logMeal(queued.description, queued.meal_type);
      } else if (queued?.kind === 'saved_recipe' || entry.source === 'saved_recipe') {
        void logSavedRecipe();
      } else if (entry.quantity_g > 0) {
        void logItem(entry.food, entry.quantity_g);
      } else {
        void logMeal(entry.food, entry.meal_type ?? 'other');
      }
    },
    [logItem, logMeal, logMacros, logSavedRecipe],
  );

  const retryAllFailed = useCallback(() => {
    const failed = pending.filter((x) => x.status === 'failed');
    for (const entry of failed) {
      retry(entry);
    }
  }, [pending, retry]);

  const dismiss = useCallback((id: string) => {
    removeFoodLogQueueItem(id);
    setPending((p) => p.filter((x) => x.id !== id));
  }, []);

  const dismissAllQueued = useCallback(() => {
    clearFoodLogQueue();
    setPending((p) => p.filter((x) => x.status !== 'queued'));
  }, []);

  return {
    pending,
    logItem,
    logMeal,
    logSavedRecipe,
    logMacros,
    retry,
    retryAllFailed,
    dismiss,
    dismissAllQueued,
    flushQueue,
    queuedCount: pending.filter((x) => x.status === 'queued').length,
    failedCount: pending.filter((x) => x.status === 'failed').length,
    queueSyncClearedToken,
  };
}
