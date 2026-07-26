import type { HabitsTodayResponse } from './api';

const QUEUE_KEY = 'habits-habit-log-queue';
const CACHE_KEY = 'habits-today-cache';
const STREAK_CACHE_KEY = 'habits-streak-cache';
const STREAK_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface QueuedHabitUpdate {
  id: string;
  metric: string;
  value: number | null;
  created_at: string;
}

function readQueue(): QueuedHabitUpdate[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedHabitUpdate[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueuedHabitUpdate[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export function getHabitLogQueue(): QueuedHabitUpdate[] {
  return readQueue();
}

export function enqueueHabitUpdate(metric: string, value: number | null, id?: string): QueuedHabitUpdate {
  const item: QueuedHabitUpdate = {
    id: id ?? `hq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    metric,
    value,
    created_at: new Date().toISOString(),
  };
  writeQueue([...readQueue().filter((x) => x.metric !== metric), item]);
  return item;
}

export function removeHabitQueueItem(id: string) {
  writeQueue(readQueue().filter((x) => x.id !== id));
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
