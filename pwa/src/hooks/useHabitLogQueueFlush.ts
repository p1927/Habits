import { useCallback, useEffect } from 'react';
import { api, type HabitsTodayResponse } from '../lib/api';
import {
  getHabitLogQueue,
  isOfflineError,
  removeHabitQueueItem,
} from '../lib/habitQueue';
import { type QueuedHabitEntry } from '../lib/optimisticHabitLog';

interface UseHabitLogQueueFlushOptions {
  serverOnline: boolean;
  setHabits: (habits: HabitsTodayResponse | null) => void;
  setError: (msg: string) => void;
  setSyncMessage: (msg: string) => void;
  setPending: React.Dispatch<React.SetStateAction<QueuedHabitEntry[]>>;
  setQueueSyncClearedToken: React.Dispatch<React.SetStateAction<number>>;
}

export function useHabitLogQueueFlush({
  serverOnline,
  setHabits,
  setError,
  setSyncMessage,
  setPending,
  setQueueSyncClearedToken,
}: UseHabitLogQueueFlushOptions) {
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
        setHabits(await api.updateHabitMetric(item.metric, item.value));
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
      if (getHabitLogQueue().length === 0) {
        setQueueSyncClearedToken((token) => token + 1);
      }
    }
  }, [serverOnline, setHabits, setError, setSyncMessage, setPending, setQueueSyncClearedToken]);

  useEffect(() => {
    void flushQueue();
  }, [flushQueue]);

  useEffect(() => {
    const onOnline = () => void flushQueue();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [flushQueue]);

  return { flushQueue };
}
