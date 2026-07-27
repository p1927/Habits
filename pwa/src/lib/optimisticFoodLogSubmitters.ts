import { api, type FoodTodayResponse } from './api';
import { enqueueFoodLog } from './foodQueue';
import { executeOptimisticFoodLog, type OptimisticFoodEntry } from './optimisticFoodLog';

export interface OptimisticFoodLogContext {
  serverOnline: boolean;
  setData: (data: FoodTodayResponse | null) => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
  setPending: React.Dispatch<React.SetStateAction<OptimisticFoodEntry[]>>;
}

function pendingId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function submitOptimisticFoodItem(
  ctx: OptimisticFoodLogContext,
  food: string,
  quantity_g: number,
  onSuccess?: (summary: FoodTodayResponse) => void,
) {
  const id = pendingId('pending');
  await executeOptimisticFoodLog({
    ...ctx,
    id,
    pendingEntry: { id, food, quantity_g, status: 'pending' },
    enqueue: (reuseId) => enqueueFoodLog({ kind: 'item', food, quantity_g, id: reuseId }),
    submit: () => api.logFoodItem(food, quantity_g),
    onSuccess,
  });
}

export async function submitOptimisticFoodMacros(
  ctx: OptimisticFoodLogContext,
  food: string,
  quantity_g: number,
  macros: { calories: number; carbs: number; protein: number; fat: number },
  onSuccess?: (summary: FoodTodayResponse) => void,
) {
  const id = pendingId('pending-macros');
  await executeOptimisticFoodLog({
    ...ctx,
    id,
    pendingEntry: { id, food, quantity_g, status: 'pending', source: 'macros' },
    enqueue: (reuseId) =>
      enqueueFoodLog({ kind: 'macros', food, quantity_g, ...macros, id: reuseId }),
    submit: () => api.logFoodMacros({ food, quantity_g, ...macros }),
    onSuccess,
  });
}

export async function submitOptimisticFoodMeal(
  ctx: OptimisticFoodLogContext,
  description: string,
  meal_type: string,
  onSuccess?: () => void,
) {
  const id = pendingId('pending-meal');
  await executeOptimisticFoodLog({
    ...ctx,
    id,
    pendingEntry: { id, food: description, quantity_g: 0, status: 'pending', meal_type },
    enqueue: (reuseId) => enqueueFoodLog({ kind: 'meal', description, meal_type, id: reuseId }),
    submit: () => api.logFood(description, meal_type),
    onOfflineComplete: onSuccess,
    onSuccess: () => onSuccess?.(),
  });
}

export async function submitOptimisticSavedRecipe(ctx: OptimisticFoodLogContext) {
  const id = pendingId('pending-recipe');
  await executeOptimisticFoodLog({
    ...ctx,
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
}
