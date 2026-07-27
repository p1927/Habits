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

export function queueToHabitEntry(item: QueuedHabitUpdate): QueuedHabitEntry {
  return {
    id: item.id,
    metric: item.metric,
    value: item.value,
    status: 'queued',
    created_at: item.created_at,
  };
}

interface ExecuteOptimisticHabitUpdateOptions {
  serverOnline: boolean;
  habits: HabitsTodayResponse | null;
  metric: string;
  value: number | null;
  setHabits: (habits: HabitsTodayResponse | null) => void;
  setError: (msg: string) => void;
  setSyncMessage: (msg: string) => void;
  setPending: React.Dispatch<React.SetStateAction<QueuedHabitEntry[]>>;
  setSaving: (metric: string | null) => void;
}

export async function executeOptimisticHabitUpdate({
  serverOnline,
  habits,
  metric,
  value,
  setHabits,
  setError,
  setSyncMessage,
  setPending,
  setSaving,
}: ExecuteOptimisticHabitUpdateOptions) {
  setSaving(metric);
  setError('');
  setHabits(applyLocalMetric(habits, metric, value));

  const queueOffline = () => {
    const q = enqueueHabitUpdate(metric, value);
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
    setHabits(await api.updateHabitMetric(metric, value));
    for (const q of getHabitLogQueue().filter((x) => x.metric === metric)) {
      removeHabitQueueItem(q.id);
    }
    setPending((p) => p.filter((x) => x.metric !== metric));
  } catch (e) {
    if (isOfflineError(e)) {
      queueOffline();
      return;
    }
    setError(e instanceof Error ? e.message : 'Update failed');
  } finally {
    setSaving(null);
  }
}
