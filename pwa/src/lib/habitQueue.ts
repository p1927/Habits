import { createLocalStorageQueue, makeQueueId, sortQueueByCreatedAt } from './localStorageQueue';
import type { HabitsTodayResponse } from './api';

const QUEUE_KEY = 'habits-habit-log-queue';
const habitQueue = createLocalStorageQueue<QueuedHabitUpdate>(QUEUE_KEY);
const CACHE_KEY = 'habits-today-cache';
const STREAK_CACHE_KEY = 'habits-streak-cache';
const STREAK_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface QueuedHabitUpdate {
  id: string;
  metric: string;
  value: number | null;
  created_at: string;
}

export function getHabitLogQueue(): QueuedHabitUpdate[] {
  return sortQueueByCreatedAt(habitQueue.read());
}

export function enqueueHabitUpdate(metric: string, value: number | null, id?: string): QueuedHabitUpdate {
  const item: QueuedHabitUpdate = {
    id: id ?? makeQueueId('hq'),
    metric,
    value,
    created_at: new Date().toISOString(),
  };
  habitQueue.write(habitQueue.read().filter((x) => x.metric !== metric).concat(item));
  return item;
}

export function removeHabitQueueItem(id: string) {
  habitQueue.write(habitQueue.read().filter((x) => x.id !== id));
}

export function clearHabitLogQueue() {
  habitQueue.clear();
}

export function cacheHabitsToday(habits: HabitsTodayResponse) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(habits));
}

export function getCachedHabitsToday(): HabitsTodayResponse | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HabitsTodayResponse;
  } catch {
    return null;
  }
}

export function cacheHabitStreak(overall: number) {
  localStorage.setItem(
    STREAK_CACHE_KEY,
    JSON.stringify({ overall, cached_at: new Date().toISOString() }),
  );
}

export function getCachedHabitStreak(): number {
  try {
    const raw = localStorage.getItem(STREAK_CACHE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { overall?: number; cached_at?: string };
    if (typeof parsed.overall !== 'number') return 0;
    if (parsed.cached_at) {
      const age = Date.now() - new Date(parsed.cached_at).getTime();
      if (Number.isFinite(age) && age > STREAK_CACHE_TTL_MS) return 0;
    }
    return parsed.overall;
  } catch {
    return 0;
  }
}

export function applyLocalMetric(
  habits: HabitsTodayResponse | null,
  metric: string,
  value: number | null,
): HabitsTodayResponse {
  const base = habits ?? {
    date: new Date().toISOString().slice(0, 10),
    row: null,
    weekday: '',
    metrics: {},
    notes: null,
    sheets_connected: false,
  };
  return {
    ...base,
    metrics: { ...base.metrics, [metric]: value },
  };
}

export { isOfflineError } from './foodQueue';
export { makeQueueId } from './localStorageQueue';
