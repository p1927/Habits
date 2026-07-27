import { api, type FoodTodayResponse } from './api';
import {
  getMealPlanFailedIds,
  removeMealPlanQueueItem,
  setMealPlanFailedIds,
  type QueuedMealPlanLog,
} from './mealPlanQueue';

export async function logQueuedMealPlanItem(item: QueuedMealPlanLog): Promise<FoodTodayResponse | null> {
  if (item.kind === 'all') {
    return (await api.logMealPlanToday()).summary;
  }
  if (item.meal) {
    return (await api.logMealPlanItem(item.meal)).summary;
  }
  return null;
}

export function dismissQueuedMealPlanItem(itemId: string): Set<string> {
  removeMealPlanQueueItem(itemId);
  const failed = getMealPlanFailedIds();
  if (!failed.includes(itemId)) return new Set(failed);
  const next = new Set(failed.filter((id) => id !== itemId));
  setMealPlanFailedIds(next);
  return next;
}
