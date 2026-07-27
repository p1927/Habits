import { MEAL_PLAN_QUEUE_CHANGE, MEAL_PLAN_SYNC_CHANGE } from './mealPlanQueue';

type MealPlanQueueBusListener = () => void;

const listeners = new Set<MealPlanQueueBusListener>();
let wired = false;

function notifyAll() {
  listeners.forEach((listener) => listener());
}

function wireBus() {
  if (wired || typeof window === 'undefined') return;
  wired = true;
  window.addEventListener('online', notifyAll);
  window.addEventListener('focus', notifyAll);
  window.addEventListener(MEAL_PLAN_QUEUE_CHANGE, notifyAll);
  window.addEventListener(MEAL_PLAN_SYNC_CHANGE, notifyAll);
}

/** Single ref-counted bus for meal plan queue + sync DOM events and browser wake signals. */
export function subscribeMealPlanQueueBus(listener: MealPlanQueueBusListener): () => void {
  wireBus();
  listeners.add(listener);
  return () => listeners.delete(listener);
}
