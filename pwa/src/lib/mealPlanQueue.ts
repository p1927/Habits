const QUEUE_KEY = 'habits-meal-plan-queue';
const FAILED_KEY = 'habits-meal-plan-queue-failed';
const CACHE_KEY = 'habits-meal-plan-cache';

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

const SYNC_KEY = 'habits-meal-plan-queue-sync';
const LAST_SOURCE_KEY = 'habits-meal-plan-queue-last-source';

function isMealPlanSyncSource(value: string): value is MealPlanSyncSource {
  return value === 'home' || value === 'day' || value === 'log';
}

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

function notifyQueueChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MEAL_PLAN_QUEUE_CHANGE));
  }
}

function notifySyncChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MEAL_PLAN_SYNC_CHANGE));
  }
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
  notifySyncChange();
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

function writeFailedIdsSilent(ids: string[]) {
  if (ids.length === 0) localStorage.removeItem(FAILED_KEY);
  else localStorage.setItem(FAILED_KEY, JSON.stringify(ids));
}

function writeQueue(items: QueuedMealPlanLog[]) {
  if (items.length === 0) {
    localStorage.removeItem(QUEUE_KEY);
    writeFailedIdsSilent([]);
  } else {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
    const queueIds = new Set(items.map((item) => item.id));
    writeFailedIdsSilent(readFailedIds().filter((id) => queueIds.has(id)));
  }
  notifyQueueChange();
}

function sortMealPlanQueue(items: QueuedMealPlanLog[]): QueuedMealPlanLog[] {
  return [...items].sort((a, b) => {
    const ta = new Date(a.created_at).getTime();
    const tb = new Date(b.created_at).getTime();
    if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
    if (Number.isNaN(ta)) return 1;
    if (Number.isNaN(tb)) return -1;
    return ta - tb;
  });
}

export function getMealPlanQueue(): QueuedMealPlanLog[] {
  return sortMealPlanQueue(readQueue());
}

function readFailedIds(): string[] {
  try {
    const raw = localStorage.getItem(FAILED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeFailedIds(ids: string[]) {
  if (ids.length === 0) localStorage.removeItem(FAILED_KEY);
  else localStorage.setItem(FAILED_KEY, JSON.stringify(ids));
  notifyQueueChange();
}

export function getMealPlanFailedIds(): string[] {
  const queueIds = new Set(readQueue().map((item) => item.id));
  return readFailedIds().filter((id) => queueIds.has(id));
}

export function getMealPlanFailedCount(): number {
  return getMealPlanFailedIds().length;
}

export function setMealPlanFailedIds(ids: Iterable<string>) {
  writeFailedIds([...ids]);
}

export function addMealPlanFailedId(id: string) {
  const next = new Set(readFailedIds());
  next.add(id);
  writeFailedIds([...next]);
}

export function removeMealPlanFailedId(id: string) {
  writeFailedIds(readFailedIds().filter((x) => x !== id));
}

export function clearMealPlanFailedIds() {
  writeFailedIds([]);
}

export function pruneMealPlanFailedIds() {
  const queueIds = new Set(readQueue().map((item) => item.id));
  if (queueIds.size === 0) {
    writeFailedIds([]);
    return;
  }
  writeFailedIds(readFailedIds().filter((id) => queueIds.has(id)));
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
  writeQueue([...readQueue(), item]);
  return item;
}

export function removeMealPlanQueueItem(id: string) {
  writeQueue(readQueue().filter((x) => x.id !== id));
  removeMealPlanFailedId(id);
}

export function clearMealPlanQueue() {
  localStorage.removeItem(QUEUE_KEY);
  clearMealPlanFailedIds();
  setMealPlanQueueSyncStatus(null);
  notifyQueueChange();
}

export function dismissAllMealPlanQueue() {
  clearMealPlanQueue();
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

export function mealPlanQueueLabel(item: QueuedMealPlanLog): string {
  if (item.kind === 'all') return 'All planned meals';
  return item.label ?? item.meal ?? 'Meal';
}

export function mealPlanSyncUndoLabel(synced: number, labels: string[]): string {
  if (synced === 1) return labels[0] ?? 'Queued meal';
  return `${synced} queued meal logs`;
}

export { isOfflineError } from './foodQueue';
