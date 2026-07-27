import { useCallback, useEffect } from 'react';
import type { FoodTodayResponse } from '../lib/api';
import { getFoodLogQueue, isOfflineError, removeFoodLogQueueItem } from '../lib/foodQueue';
import { logQueuedFoodItem, type OptimisticFoodEntry } from '../lib/optimisticFoodLog';

interface UseFoodLogQueueFlushOptions {
  serverOnline: boolean;
  setData: (data: FoodTodayResponse | null) => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
  setPending: React.Dispatch<React.SetStateAction<OptimisticFoodEntry[]>>;
  setQueueSyncClearedToken: React.Dispatch<React.SetStateAction<number>>;
  syncQueuedFromStorage: () => void;
}

export function useFoodLogQueueFlush({
  serverOnline,
  setData,
  setSuccess,
  setError,
  setPending,
  setQueueSyncClearedToken,
  syncQueuedFromStorage,
}: UseFoodLogQueueFlushOptions) {
  const flushQueue = useCallback(async () => {
    if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
    const queue = getFoodLogQueue();
    if (!queue.length) return;

    let synced = 0;
    for (const item of queue) {
      setPending((p) =>
        p.map((x) => (x.id === item.id ? { ...x, status: 'pending' as const } : x)),
      );
      try {
        const res = await logQueuedFoodItem(item);
        setData(res.summary);
        removeFoodLogQueueItem(item.id);
        setPending((p) => p.filter((x) => x.id !== item.id));
        synced += 1;
      } catch (e) {
        if (isOfflineError(e)) break;
        setPending((p) =>
          p.map((x) => (x.id === item.id ? { ...x, status: 'failed' as const } : x)),
        );
        setError(e instanceof Error ? e.message : 'Sync failed');
        break;
      }
    }
    if (synced > 0) {
      setSuccess(`Synced ${synced} queued food log${synced === 1 ? '' : 's'}`);
      if (getFoodLogQueue().length === 0) {
        setQueueSyncClearedToken((token) => token + 1);
      }
    }
  }, [serverOnline, setData, setSuccess, setError, setPending, setQueueSyncClearedToken]);

  useEffect(() => {
    void flushQueue();
  }, [flushQueue]);

  useEffect(() => {
    const onOnline = () => {
      syncQueuedFromStorage();
      void flushQueue();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [flushQueue, syncQueuedFromStorage]);

  return { flushQueue };
}
