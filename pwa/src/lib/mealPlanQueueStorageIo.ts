import { notifyMealPlanQueueChange } from './mealPlanQueueEvents';
import {
  MEAL_PLAN_FAILED_KEY,
  MEAL_PLAN_QUEUE_KEY,
} from './mealPlanQueueStorageKeys';
import type { QueuedMealPlanLog } from './mealPlanQueueTypes';

export function readMealPlanQueueRaw(): QueuedMealPlanLog[] {
  try {
    const raw = localStorage.getItem(MEAL_PLAN_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedMealPlanLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readMealPlanFailedIdsRaw(): string[] {
  try {
    const raw = localStorage.getItem(MEAL_PLAN_FAILED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function writeMealPlanFailedIdsSilent(ids: string[]) {
  if (ids.length === 0) localStorage.removeItem(MEAL_PLAN_FAILED_KEY);
  else localStorage.setItem(MEAL_PLAN_FAILED_KEY, JSON.stringify(ids));
}

export function writeMealPlanFailedIds(ids: string[]) {
  writeMealPlanFailedIdsSilent(ids);
  notifyMealPlanQueueChange();
}

export function writeMealPlanQueue(items: QueuedMealPlanLog[]) {
  if (items.length === 0) {
    localStorage.removeItem(MEAL_PLAN_QUEUE_KEY);
    writeMealPlanFailedIdsSilent([]);
  } else {
    localStorage.setItem(MEAL_PLAN_QUEUE_KEY, JSON.stringify(items));
    const queueIds = new Set(items.map((item) => item.id));
    writeMealPlanFailedIdsSilent(readMealPlanFailedIdsRaw().filter((id) => queueIds.has(id)));
  }
  notifyMealPlanQueueChange();
}
