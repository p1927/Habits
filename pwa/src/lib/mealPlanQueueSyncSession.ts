import {
  isMealPlanSyncSource,
  type MealPlanQueueSyncStatus,
  type MealPlanSyncSource,
} from './mealPlanQueueTypes';
import { notifyMealPlanSyncChange } from './mealPlanQueueEvents';

const SYNC_KEY = 'habits-meal-plan-queue-sync';
const LAST_SOURCE_KEY = 'habits-meal-plan-queue-last-source';

export function getMealPlanQueueLastSource(): MealPlanSyncSource | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(LAST_SOURCE_KEY);
    if (!raw || !isMealPlanSyncSource(raw)) return null;
    return raw;
  } catch {
    return null;
  }
}

export function setMealPlanQueueLastSource(source: MealPlanSyncSource) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(LAST_SOURCE_KEY, source);
}

export function getMealPlanQueueSyncStatus(): MealPlanQueueSyncStatus | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SYNC_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MealPlanQueueSyncStatus;
    if (!parsed?.syncing || typeof parsed.done !== 'number' || typeof parsed.total !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setMealPlanQueueSyncStatus(status: MealPlanQueueSyncStatus | null) {
  if (typeof window === 'undefined') return;
  if (!status?.syncing) sessionStorage.removeItem(SYNC_KEY);
  else {
    sessionStorage.setItem(SYNC_KEY, JSON.stringify(status));
    setMealPlanQueueLastSource(status.source);
  }
  notifyMealPlanSyncChange();
}
