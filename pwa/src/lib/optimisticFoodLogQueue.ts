import { api } from './api';
import type { QueuedFoodLog } from './foodQueue';
import type { OptimisticFoodEntry } from './optimisticFoodLogTypes';

export function queueToOptimisticEntry(item: QueuedFoodLog): OptimisticFoodEntry {
  if (item.kind === 'item') {
    return {
      id: item.id,
      food: item.food,
      quantity_g: item.quantity_g,
      status: 'queued',
      created_at: item.created_at,
    };
  }
  if (item.kind === 'macros') {
    return {
      id: item.id,
      food: item.food,
      quantity_g: item.quantity_g,
      status: 'queued',
      source: 'macros',
      created_at: item.created_at,
    };
  }
  if (item.kind === 'saved_recipe') {
    return {
      id: item.id,
      food: 'Entire saved recipe',
      quantity_g: 0,
      status: 'queued',
      source: 'saved_recipe',
      created_at: item.created_at,
    };
  }
  return {
    id: item.id,
    food: item.description,
    quantity_g: 0,
    status: 'queued',
    meal_type: item.meal_type,
    created_at: item.created_at,
  };
}

export async function logQueuedFoodItem(item: QueuedFoodLog) {
  if (item.kind === 'item') {
    return api.logFoodItem(item.food, item.quantity_g);
  }
  if (item.kind === 'macros') {
    return api.logFoodMacros({
      food: item.food,
      quantity_g: item.quantity_g,
      calories: item.calories,
      carbs: item.carbs,
      protein: item.protein,
      fat: item.fat,
    });
  }
  if (item.kind === 'saved_recipe') {
    return api.logSavedRecipe();
  }
  return api.logFood(item.description, item.meal_type);
}
