import { MEAL_PLAN_QUEUE_CHANGE, MEAL_PLAN_SYNC_CHANGE } from './mealPlanQueueTypes';

export function notifyMealPlanQueueChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MEAL_PLAN_QUEUE_CHANGE));
  }
}

export function notifyMealPlanSyncChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MEAL_PLAN_SYNC_CHANGE));
  }
}
