import { MEAL_PLAN_CACHE_KEY } from './mealPlanQueueStorageKeys';
import type { MealPlanEntry } from './mealPlanQueueTypes';

export function cacheMealPlan(meals: MealPlanEntry[]) {
  localStorage.setItem(
    MEAL_PLAN_CACHE_KEY,
    JSON.stringify({ date: new Date().toISOString().slice(0, 10), meals }),
  );
}

export function getCachedMealPlan(): MealPlanEntry[] {
  try {
    const raw = localStorage.getItem(MEAL_PLAN_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { date?: string; meals?: MealPlanEntry[] };
    const today = new Date().toISOString().slice(0, 10);
    if (parsed.date !== today || !Array.isArray(parsed.meals)) return [];
    return parsed.meals;
  } catch {
    return [];
  }
}
