import { useCallback, useEffect, useState } from 'react';
import { api, type HabitsTodayResponse } from '../lib/api';
import {
  applyLocalMetric,
  cacheHabitsToday,
  enqueueHabitUpdate,
  getCachedHabitsToday,
  getHabitLogQueue,
  isOfflineError,
  removeHabitQueueItem,
  clearHabitLogQueue,
  type QueuedHabitUpdate,
} from '../lib/habitQueue';

interface UseOptimisticHabitLogOptions {
  serverOnline: boolean;
  habits: HabitsTodayResponse | null;
  setHabits: (habits: HabitsTodayResponse | null) => void;
  setError: (msg: string) => void;
  setSyncMessage: (msg: string) => void;
}

export interface QueuedHabitEntry {
  id: string;
  metric: string;
  value: number | null;
  status: 'pending' | 'failed' | 'queued';
}

function queueToEntry(item: QueuedHabitUpdate): QueuedHabitEntry {
  return { id: item.id, metric: item.metric, value: item.value, status: 'queued' };
}

export function useOptimisticHabitLog({
  serverOnline,
  habits,
  setHabits,
  setError,
  setSyncMessage,
}: UseOptimisticHabitLogOptions) {
  const [pending, setPending] = useState<QueuedHabitEntry[]>(() =>
    getHabitLogQueue().map(queueToEntry),
  );
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (habits) cacheHabitsToday(habits);
  }, [habits]);

  useEffect(() => {
    if (habits || serverOnline) return;
    let cached = getCachedHabitsToday();
    if (!cached) return;
    for (const item of getHabitLogQueue()) {
      cached = applyLocalMetric(cached, item.metric, item.value);
    }
    setHabits(cached);
  }, [habits, serverOnline, setHabits]);

  const flushQueue = useCallback(async () => {
    if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
    const queue = getHabitLogQueue();
    if (!queue.length) return;

    let synced = 0;
    for (const item of queue) {
      setPending((p) =>
        p.map((x) => (x.id === item.id ? { ...x, status: 'pending' as const } : x)),
      );
      try {
        const latest = await api.updateHabitMetric(item.metric, item.value);
        setHabits(latest);
        removeHabitQueueItem(item.id);
        setPending((p) => p.filter((x) => x.id !== item.id));
        synced += 1;
      } catch (e) {
        if (isOfflineError(e)) break;
        setPending((p) =>
          p.map((x) => (x.id === item.id ? { ...x, status: 'failed' as const } : x)),
        );
        setError(e instanceof Error ? e.message : 'Habit sync failed');
        break;
      }
    }
    if (synced > 0) {
      setSyncMessage(`Synced ${synced} queued habit update${synced === 1 ? '' : 's'}`);
    }
  }, [serverOnline, setHabits, setError, setSyncMessage]);

  useEffect(() => {
    void flushQueue();
  }, [flushQueue]);

  useEffect(() => {
    const onOnline = () => void flushQueue();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [flushQueue]);

  const updateMetric = useCallback(
    async (metric: string, rawValue: string) => {
      const value = rawValue === '' ? null : Number.parseFloat(rawValue);
      setSaving(metric);
      setError('');
      setHabits(applyLocalMetric(habits, metric, value));

      if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
        const q = enqueueHabitUpdate(metric, value);
        setPending((p) => {
          const withoutMetric = p.filter((x) => x.metric !== metric);
          return [...withoutMetric, queueToEntry(q)];
        });
        setSyncMessage('Saved offline — will sync when back online');
        setSaving(null);
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
          const q = enqueueHabitUpdate(metric, value);
          setPending((p) => {
            const withoutMetric = p.filter((x) => x.metric !== metric);
            return [...withoutMetric, queueToEntry(q)];
          });
          setSyncMessage('Saved offline — will sync when back online');
        } else {
          setError(e instanceof Error ? e.message : 'Update failed');
        }
      } finally {
        setSaving(null);
      }
    },
    [habits, serverOnline, setHabits, setError, setSyncMessage],
  );

  const queuedCount = pending.filter((x) => x.status === 'queued').length;

  const dismiss = useCallback((id: string) => {
    removeHabitQueueItem(id);
    setPending((p) => p.filter((x) => x.id !== id));
  }, []);

  const dismissAllQueued = useCallback(() => {
    clearHabitLogQueue();
    setPending((p) => p.filter((x) => x.status !== 'queued'));
  }, []);

  const retry = useCallback(
    (entry: QueuedHabitEntry) => {
      removeHabitQueueItem(entry.id);
      setPending((p) => p.filter((x) => x.id !== entry.id));
      void updateMetric(entry.metric, entry.value == null ? '' : String(entry.value));
    },
    [updateMetric],
  );

  return { pending, saving, updateMetric, queuedCount, retry, dismiss, dismissAllQueued };
}
