import { api, type FoodTodayResponse } from './api';
import { isOfflineError, type QueuedFoodLog } from './foodQueue';

export interface OptimisticFoodEntry {
  id: string;
  food: string;
  quantity_g: number;
  status: 'pending' | 'failed' | 'queued';
  source?: 'macros' | 'saved_recipe';
  meal_type?: string;
  created_at?: string;
}

export function queueToOptimisticEntry(item: QueuedFoodLog): OptimisticFoodEntry {
  if (item.kind === 'item') {
    return {
      id: item.id,
      food: item.food,
      quantity_g: item.quantity_g,
      status: 'queued',
      created_at: item.created_at,
    };
  }
  if (item.kind === 'macros') {
    return {
      id: item.id,
      food: item.food,
      quantity_g: item.quantity_g,
      status: 'queued',
      source: 'macros',
      created_at: item.created_at,
    };
  }
  if (item.kind === 'saved_recipe') {
    return {
      id: item.id,
      food: 'Entire saved recipe',
      quantity_g: 0,
      status: 'queued',
      source: 'saved_recipe',
      created_at: item.created_at,
    };
  }
  return {
    id: item.id,
    food: item.description,
    quantity_g: 0,
    status: 'queued',
    meal_type: item.meal_type,
    created_at: item.created_at,
  };
}

export async function logQueuedFoodItem(item: QueuedFoodLog) {
  if (item.kind === 'item') {
    return api.logFoodItem(item.food, item.quantity_g);
  }
  if (item.kind === 'macros') {
    return api.logFoodMacros({
      food: item.food,
      quantity_g: item.quantity_g,
      calories: item.calories,
      carbs: item.carbs,
      protein: item.protein,
      fat: item.fat,
    });
  }
  if (item.kind === 'saved_recipe') {
    return api.logSavedRecipe();
  }
  return api.logFood(item.description, item.meal_type);
}

interface ExecuteOptimisticFoodLogOptions {
  serverOnline: boolean;
  id: string;
  pendingEntry: OptimisticFoodEntry;
  enqueue: (reuseId?: string) => QueuedFoodLog;
  submit: () => Promise<{ summary: FoodTodayResponse; message: string }>;
  setData: (data: FoodTodayResponse | null) => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
  setPending: React.Dispatch<React.SetStateAction<OptimisticFoodEntry[]>>;
  onSuccess?: (summary: FoodTodayResponse) => void;
  onOfflineComplete?: () => void;
  autoRetryMs?: number;
}

const DEFAULT_AUTO_RETRY_MS = 1500;

async function submitWithOptionalRetry(
  submit: () => Promise<{ summary: FoodTodayResponse; message: string }>,
  autoRetryMs: number,
) {
  try {
    return await submit();
  } catch (first) {
    if (isOfflineError(first) || autoRetryMs <= 0) throw first;
    await new Promise((resolve) => window.setTimeout(resolve, autoRetryMs));
    return submit();
  }
}

export async function executeOptimisticFoodLog({
  serverOnline,
  id,
  pendingEntry,
  enqueue,
  submit,
  setData,
  setSuccess,
  setError,
  setPending,
  onSuccess,
  onOfflineComplete,
  autoRetryMs = DEFAULT_AUTO_RETRY_MS,
}: ExecuteOptimisticFoodLogOptions) {
  setPending((p) => [...p, pendingEntry]);
  setError('');

  const queueOffline = () => {
    const q = enqueue(id);
    setPending((p) => p.map((x) => (x.id === id ? queueToOptimisticEntry(q) : x)));
    setSuccess('Saved offline — will sync when back online');
    onOfflineComplete?.();
  };

  if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    queueOffline();
    return;
  }

  try {
    const res = await submitWithOptionalRetry(submit, autoRetryMs);
    setData(res.summary);
    setSuccess(res.message);
    setPending((p) => p.filter((x) => x.id !== id));
    onSuccess?.(res.summary);
  } catch (e) {
    if (isOfflineError(e)) {
      queueOffline();
      return;
    }
    const msg = e instanceof Error ? e.message : 'Log failed';
    const q = enqueue(id);
    setPending((p) =>
      p.map((x) => (x.id === id ? { ...queueToOptimisticEntry(q), status: 'failed' as const } : x)),
    );
    setError(`${msg} — tap Retry to try again`);
  }
}
