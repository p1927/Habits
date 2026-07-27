import { getFoodLogQueue, removeFoodLogQueueItem } from './foodQueue';
import type { OptimisticFoodEntry } from './optimisticFoodLog';

export interface OptimisticFoodRetryHandlers {
  logItem: (food: string, quantity_g: number) => void;
  logMeal: (description: string, meal_type: string) => void;
  logMacros: (
    food: string,
    quantity_g: number,
    macros: { calories: number; carbs: number; protein: number; fat: number },
  ) => void;
  logSavedRecipe: () => void;
}

export function retryOptimisticFoodEntry(
  entry: OptimisticFoodEntry,
  handlers: OptimisticFoodRetryHandlers,
  onRemove: (id: string) => void,
) {
  const queued = getFoodLogQueue().find((q) => q.id === entry.id);
  removeFoodLogQueueItem(entry.id);
  onRemove(entry.id);

  if (queued?.kind === 'macros') {
    handlers.logMacros(queued.food, queued.quantity_g, {
      calories: queued.calories,
      carbs: queued.carbs,
      protein: queued.protein,
      fat: queued.fat,
    });
    return;
  }
  if (queued?.kind === 'meal') {
    handlers.logMeal(queued.description, queued.meal_type);
    return;
  }
  if (queued?.kind === 'saved_recipe' || entry.source === 'saved_recipe') {
    handlers.logSavedRecipe();
    return;
  }
  if (entry.quantity_g > 0) {
    handlers.logItem(entry.food, entry.quantity_g);
    return;
  }
  handlers.logMeal(entry.food, entry.meal_type ?? 'other');
}

export function retryAllFailedOptimisticFoodEntries(
  pending: OptimisticFoodEntry[],
  handlers: OptimisticFoodRetryHandlers,
  onRemove: (id: string) => void,
) {
  for (const entry of pending.filter((x) => x.status === 'failed')) {
    retryOptimisticFoodEntry(entry, handlers, onRemove);
  }
}
