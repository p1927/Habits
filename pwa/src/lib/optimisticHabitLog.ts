import { api, type HabitsTodayResponse } from './api';
import {
  applyLocalMetric,
  enqueueHabitUpdate,
  getHabitLogQueue,
  isOfflineError,
  removeHabitQueueItem,
  type QueuedHabitUpdate,
} from './habitQueue';

export interface QueuedHabitEntry {
  id: string;
  metric: string;
  value: number | null;
  status: 'pending' | 'failed' | 'queued';
  created_at: string;
}

export function queueToHabitEntry(item: QueuedHabitUpdate, status: QueuedHabitEntry['status'] = 'queued'): QueuedHabitEntry {
  return {
    id: item.id,
    metric: item.metric,
    value: item.value,
    status,
    created_at: item.created_at,
  };
}

interface ExecuteOptimisticHabitUpdateOptions {
  serverOnline: boolean;
  habits: HabitsTodayResponse | null;
  id: string;
  metric: string;
  value: number | null;
  setHabits: (habits: HabitsTodayResponse | null) => void;
  setError: (msg: string) => void;
  setSyncMessage: (msg: string) => void;
  setPending: React.Dispatch<React.SetStateAction<QueuedHabitEntry[]>>;
  setSaving: (metric: string | null) => void;
  autoRetryMs?: number;
}

const DEFAULT_AUTO_RETRY_MS = 1500;

async function submitWithOptionalRetry(
  submit: () => Promise<HabitsTodayResponse>,
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

export async function executeOptimisticHabitUpdate({
  serverOnline,
  habits,
  id,
  metric,
  value,
  setHabits,
  setError,
  setSyncMessage,
  setPending,
  setSaving,
  autoRetryMs = DEFAULT_AUTO_RETRY_MS,
}: ExecuteOptimisticHabitUpdateOptions) {
  setSaving(metric);
  setError('');
  setHabits(applyLocalMetric(habits, metric, value));
  setPending((p) => {
    const withoutMetric = p.filter((x) => x.metric !== metric);
    return [
      ...withoutMetric,
      {
        id,
        metric,
        value,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    ];
  });

  const queueOffline = () => {
    const q = enqueueHabitUpdate(metric, value, id);
    setPending((p) => {
      const withoutMetric = p.filter((x) => x.metric !== metric);
      return [...withoutMetric, queueToHabitEntry(q)];
    });
    setSyncMessage('Saved offline — will sync when back online');
    setSaving(null);
  };

  if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    queueOffline();
    return;
  }

  try {
    setHabits(await submitWithOptionalRetry(() => api.updateHabitMetric(metric, value), autoRetryMs));
    for (const q of getHabitLogQueue().filter((x) => x.metric === metric)) {
      removeHabitQueueItem(q.id);
    }
    setPending((p) => p.filter((x) => x.metric !== metric));
  } catch (e) {
    if (isOfflineError(e)) {
      queueOffline();
      return;
    }
    const msg = e instanceof Error ? e.message : 'Update failed';
    const q = enqueueHabitUpdate(metric, value, id);
    setPending((p) => {
      const withoutMetric = p.filter((x) => x.metric !== metric);
      return [...withoutMetric, queueToHabitEntry(q, 'failed')];
    });
    setError(`${msg} — tap Retry to try again`);
  } finally {
    setSaving(null);
  }
}
