import { sortQueueByCreatedAt } from './localStorageQueue';
import { notifyMealPlanQueueChange } from './mealPlanQueueEvents';
import { removeMealPlanFailedId, clearMealPlanFailedIds } from './mealPlanQueueFailedStorage';
import { readMealPlanQueueRaw, writeMealPlanQueue } from './mealPlanQueueStorageIo';
import { setMealPlanQueueLastSource, setMealPlanQueueSyncStatus } from './mealPlanQueueSyncSession';
import type { MealPlanSyncSource, QueuedMealPlanLog } from './mealPlanQueueTypes';
import { MEAL_PLAN_QUEUE_KEY } from './mealPlanQueueStorageKeys';

export function getMealPlanQueue(): QueuedMealPlanLog[] {
  return sortQueueByCreatedAt(readMealPlanQueueRaw());
}

export function enqueueMealPlanLog(
  entry: Omit<QueuedMealPlanLog, 'id' | 'created_at'> & { id?: string },
  options?: { source?: MealPlanSyncSource },
): QueuedMealPlanLog {
  if (options?.source) setMealPlanQueueLastSource(options.source);
  const item: QueuedMealPlanLog = {
    ...entry,
    id: entry.id ?? `mpq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
  };
  writeMealPlanQueue([...readMealPlanQueueRaw(), item]);
  return item;
}

export function removeMealPlanQueueItem(id: string) {
  writeMealPlanQueue(readMealPlanQueueRaw().filter((x) => x.id !== id));
  removeMealPlanFailedId(id);
}

export function clearMealPlanQueue() {
  localStorage.removeItem(MEAL_PLAN_QUEUE_KEY);
  clearMealPlanFailedIds();
  setMealPlanQueueSyncStatus(null);
  notifyMealPlanQueueChange();
}

export function dismissAllMealPlanQueue() {
  clearMealPlanQueue();
}
