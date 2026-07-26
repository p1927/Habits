const STORAGE_KEY = 'habits-food-log-queue';

export type QueuedFoodLog =
  | { id: string; kind: 'item'; food: string; quantity_g: number; created_at: string }
  | { id: string; kind: 'meal'; description: string; meal_type: string; created_at: string };

function readQueue(): QueuedFoodLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedFoodLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueuedFoodLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getFoodLogQueue(): QueuedFoodLog[] {
  return readQueue();
}

type QueueInput =
  | { kind: 'item'; food: string; quantity_g: number; id?: string }
  | { kind: 'meal'; description: string; meal_type: string; id?: string };

export function enqueueFoodLog(entry: QueueInput): QueuedFoodLog {
  const item = {
    ...entry,
    id: entry.id ?? `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
  } as QueuedFoodLog;
  writeQueue([...readQueue(), item]);
  return item;
}

export function removeFoodLogQueueItem(id: string) {
  writeQueue(readQueue().filter((x) => x.id !== id));
}

export function clearFoodLogQueue() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isOfflineError(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  if (err instanceof TypeError) return true;
  if (err instanceof Error && /failed to fetch|network|load failed/i.test(err.message)) return true;
  return false;
}
