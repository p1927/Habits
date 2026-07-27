import { isOfflineError } from './foodQueue';
import { queueToOptimisticEntry } from './optimisticFoodLogQueue';
import {
  OPTIMISTIC_FOOD_LOG_AUTO_RETRY_MS,
  type ExecuteOptimisticFoodLogOptions,
} from './optimisticFoodLogTypes';
import type { FoodTodayResponse } from './api';

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
  autoRetryMs = OPTIMISTIC_FOOD_LOG_AUTO_RETRY_MS,
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
