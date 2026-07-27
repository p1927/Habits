export const MEAL_PLAN_QUEUE_CHANGE = 'habits-meal-plan-queue-change';
export const MEAL_PLAN_SYNC_CHANGE = 'habits-meal-plan-queue-sync-change';

export type MealPlanSyncSource = 'home' | 'day' | 'log';

const MEAL_PLAN_SYNC_SOURCE_LABELS: Record<MealPlanSyncSource, string> = {
  home: 'Home',
  day: 'Day',
  log: 'Log',
};

export function mealPlanSyncSourceLabel(source: MealPlanSyncSource): string {
  return MEAL_PLAN_SYNC_SOURCE_LABELS[source];
}

export function mealPlanQueueSourceLabel(source: MealPlanSyncSource): string {
  return source === 'log' ? 'Plan' : mealPlanSyncSourceLabel(source);
}

export interface MealPlanQueueSyncStatus {
  syncing: boolean;
  done: number;
  total: number;
  source: MealPlanSyncSource;
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

export function mealPlanQueueLabel(item: QueuedMealPlanLog): string {
  if (item.kind === 'all') return 'All planned meals';
  return item.label ?? item.meal ?? 'Meal';
}

export function mealPlanSyncUndoLabel(synced: number, labels: string[]): string {
  if (synced === 1) return labels[0] ?? 'Queued meal';
  return `${synced} queued meal logs`;
}

export function isMealPlanSyncSource(value: string): value is MealPlanSyncSource {
  return value === 'home' || value === 'day' || value === 'log';
}
