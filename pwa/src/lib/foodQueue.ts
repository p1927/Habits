import { createLocalStorageQueue, makeQueueId, sortQueueByCreatedAt } from './localStorageQueue';

const STORAGE_KEY = 'habits-food-log-queue';
const queue = createLocalStorageQueue<QueuedFoodLog>(STORAGE_KEY);

export type QueuedFoodLog =
  | { id: string; kind: 'item'; food: string; quantity_g: number; created_at: string }
  | { id: string; kind: 'meal'; description: string; meal_type: string; created_at: string }
  | {
      id: string;
      kind: 'macros';
      food: string;
      quantity_g: number;
      calories: number;
      carbs: number;
      protein: number;
      fat: number;
      created_at: string;
    }
  | { id: string; kind: 'saved_recipe'; created_at: string };

export function getFoodLogQueue(): QueuedFoodLog[] {
  return sortQueueByCreatedAt(queue.read());
}

type QueueInput =
  | { kind: 'item'; food: string; quantity_g: number; id?: string }
  | { kind: 'meal'; description: string; meal_type: string; id?: string }
  | {
      kind: 'macros';
      food: string;
      quantity_g: number;
      calories: number;
      carbs: number;
      protein: number;
      fat: number;
      id?: string;
    }
  | { kind: 'saved_recipe'; id?: string };

export function enqueueFoodLog(entry: QueueInput): QueuedFoodLog {
  const item = {
    ...entry,
    id: entry.id ?? makeQueueId('q'),
    created_at: new Date().toISOString(),
  } as QueuedFoodLog;
  queue.write([...queue.read(), item]);
  return item;
}

export function removeFoodLogQueueItem(id: string) {
  queue.write(queue.read().filter((x) => x.id !== id));
}

export function clearFoodLogQueue() {
  queue.clear();
}

export function isOfflineError(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  if (err instanceof TypeError) return true;
  if (err instanceof Error && /failed to fetch|network|load failed/i.test(err.message)) return true;
  return false;
}
