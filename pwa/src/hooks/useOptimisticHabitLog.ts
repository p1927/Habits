import { useCallback, useEffect, useState } from 'react';
import type { HabitsTodayResponse } from '../lib/api';
import {
  applyLocalMetric,
  cacheHabitsToday,
  clearHabitLogQueue,
  getCachedHabitsToday,
  getHabitLogQueue,
  makeQueueId,
  removeHabitQueueItem,
} from '../lib/habitQueue';
import {
  executeOptimisticHabitUpdate,
  queueToHabitEntry,
  type QueuedHabitEntry,
} from '../lib/optimisticHabitLog';
import { useHabitLogQueueFlush } from './useHabitLogQueueFlush';

export type { QueuedHabitEntry };

interface UseOptimisticHabitLogOptions {
  serverOnline: boolean;
  habits: HabitsTodayResponse | null;
  setHabits: (habits: HabitsTodayResponse | null) => void;
  setError: (msg: string) => void;
  setSyncMessage: (msg: string) => void;
}

export function useOptimisticHabitLog({
  serverOnline,
  habits,
  setHabits,
  setError,
  setSyncMessage,
}: UseOptimisticHabitLogOptions) {
  const [pending, setPending] = useState<QueuedHabitEntry[]>(() =>
    getHabitLogQueue().map((item) => queueToHabitEntry(item)),
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [queueSyncClearedToken, setQueueSyncClearedToken] = useState(0);

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

  useHabitLogQueueFlush({
    serverOnline,
    setHabits,
    setError,
    setSyncMessage,
    setPending,
    setQueueSyncClearedToken,
  });

  const updateMetric = useCallback(
    async (metric: string, rawValue: string) => {
      const value = rawValue === '' ? null : Number.parseFloat(rawValue);
      const id = makeQueueId('hq');
      await executeOptimisticHabitUpdate({
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
      });
    },
    [habits, serverOnline, setHabits, setError, setSyncMessage],
  );

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

  const retryAllFailed = useCallback(() => {
    for (const entry of pending.filter((x) => x.status === 'failed')) {
      retry(entry);
    }
  }, [pending, retry]);

  return {
    pending,
    saving,
    updateMetric,
    queuedCount: pending.filter((x) => x.status === 'queued').length,
    failedCount: pending.filter((x) => x.status === 'failed').length,
    retry,
    retryAllFailed,
    dismiss,
    dismissAllQueued,
    queueSyncClearedToken,
  };
}
