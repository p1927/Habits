import { useCallback, useMemo } from 'react';
import { type FoodTodayResponse } from '../lib/api';
import { clearFoodLogQueue, removeFoodLogQueueItem } from '../lib/foodQueue';
import type { OptimisticFoodEntry } from '../lib/optimisticFoodLog';
import type { OptimisticFoodLogContext } from '../lib/optimisticFoodLogHookTypes';
import {
  retryAllFailedOptimisticFoodEntries,
  retryOptimisticFoodEntry,
} from '../lib/optimisticFoodLogRetry';
import {
  submitOptimisticFoodItem,
  submitOptimisticFoodMacros,
  submitOptimisticFoodMeal,
  submitOptimisticSavedRecipe,
} from '../lib/optimisticFoodLogSubmitters';

export function useOptimisticFoodLogActions(
  ctx: OptimisticFoodLogContext,
  pending: OptimisticFoodEntry[],
) {
  const { setPending } = ctx;

  const logItem = useCallback(
    async (food: string, quantity_g: number, onSuccess?: (summary: FoodTodayResponse) => void) => {
      await submitOptimisticFoodItem(ctx, food, quantity_g, onSuccess);
    },
    [ctx],
  );

  const logMacros = useCallback(
    async (
      food: string,
      quantity_g: number,
      macros: { calories: number; carbs: number; protein: number; fat: number },
      onSuccess?: (summary: FoodTodayResponse) => void,
    ) => {
      await submitOptimisticFoodMacros(ctx, food, quantity_g, macros, onSuccess);
    },
    [ctx],
  );

  const logMeal = useCallback(
    async (description: string, meal_type: string, onSuccess?: () => void) => {
      await submitOptimisticFoodMeal(ctx, description, meal_type, onSuccess);
    },
    [ctx],
  );

  const logSavedRecipe = useCallback(async () => {
    await submitOptimisticSavedRecipe(ctx);
  }, [ctx]);

  const removePending = useCallback(
    (id: string) => {
      setPending((p) => p.filter((x) => x.id !== id));
    },
    [setPending],
  );

  const retryHandlers = useMemo(
    () => ({
      logItem: (food: string, quantity_g: number) => void logItem(food, quantity_g),
      logMeal: (description: string, meal_type: string) => void logMeal(description, meal_type),
      logMacros: (
        food: string,
        quantity_g: number,
        macros: { calories: number; carbs: number; protein: number; fat: number },
      ) => void logMacros(food, quantity_g, macros),
      logSavedRecipe: () => void logSavedRecipe(),
    }),
    [logItem, logMeal, logMacros, logSavedRecipe],
  );

  const retry = useCallback(
    (entry: OptimisticFoodEntry) => {
      retryOptimisticFoodEntry(entry, retryHandlers, removePending);
    },
    [retryHandlers, removePending],
  );

  const retryAllFailed = useCallback(() => {
    retryAllFailedOptimisticFoodEntries(pending, retryHandlers, removePending);
  }, [pending, retryHandlers, removePending]);

  const dismiss = useCallback(
    (id: string) => {
      removeFoodLogQueueItem(id);
      removePending(id);
    },
    [removePending],
  );

  const dismissAllQueued = useCallback(() => {
    clearFoodLogQueue();
    setPending((p) => p.filter((x) => x.status !== 'queued'));
  }, [setPending]);

  return {
    logItem,
    logMeal,
    logSavedRecipe,
    logMacros,
    retry,
    retryAllFailed,
    dismiss,
    dismissAllQueued,
  };
}
