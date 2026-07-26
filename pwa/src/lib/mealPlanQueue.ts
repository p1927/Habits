const QUEUE_KEY = 'habits-meal-plan-queue';
const CACHE_KEY = 'habits-meal-plan-cache';

export const MEAL_PLAN_QUEUE_CHANGE = 'habits-meal-plan-queue-change';

function notifyQueueChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MEAL_PLAN_QUEUE_CHANGE));
  }
}

export interface MealPlanEntry {
  meal: string;
  label: string;
  description: string;
}

export interface QueuedMealPlanLog {
  id: string;
  kind: 'item' | 'all';
  meal?: string;
  label?: string;
  description?: string;
  created_at: string;
}

function readQueue(): QueuedMealPlanLog[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedMealPlanLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueuedMealPlanLog[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  notifyQueueChange();
}

export function getMealPlanQueue(): QueuedMealPlanLog[] {
  return readQueue();
}

export function enqueueMealPlanLog(
  entry: Omit<QueuedMealPlanLog, 'id' | 'created_at'> & { id?: string },
): QueuedMealPlanLog {
  const item: QueuedMealPlanLog = {
    ...entry,
    id: entry.id ?? `mpq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
  };
  writeQueue([...readQueue(), item]);
  return item;
}

export function removeMealPlanQueueItem(id: string) {
  writeQueue(readQueue().filter((x) => x.id !== id));
}

export function clearMealPlanQueue() {
  localStorage.removeItem(QUEUE_KEY);
  notifyQueueChange();
}

export function cacheMealPlan(meals: MealPlanEntry[]) {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ date: new Date().toISOString().slice(0, 10), meals }),
  );
}

export function getCachedMealPlan(): MealPlanEntry[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { date?: string; meals?: MealPlanEntry[] };
    const today = new Date().toISOString().slice(0, 10);
    if (parsed.date !== today || !Array.isArray(parsed.meals)) return [];
    return parsed.meals;
  } catch {
    return [];
  }
}

export { isOfflineError } from './foodQueue';
