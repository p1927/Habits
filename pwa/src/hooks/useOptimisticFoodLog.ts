import { useCallback, useEffect, useState } from 'react';
import { api, type FoodTodayResponse } from '../lib/api';
import {
  enqueueFoodLog,
  getFoodLogQueue,
  isOfflineError,
  removeFoodLogQueueItem,
  clearFoodLogQueue,
  type QueuedFoodLog,
} from '../lib/foodQueue';

export interface OptimisticFoodEntry {
  id: string;
  food: string;
  quantity_g: number;
  status: 'pending' | 'failed' | 'queued';
  source?: 'macros';
  created_at?: string;
}

interface UseOptimisticFoodLogOptions {
  serverOnline: boolean;
  setData: (data: FoodTodayResponse | null) => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}

function queueToEntry(item: QueuedFoodLog): OptimisticFoodEntry {
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
  return {
    id: item.id,
    food: item.description,
    quantity_g: 0,
    status: 'queued',
    created_at: item.created_at,
  };
}

export function useOptimisticFoodLog({
  serverOnline,
  setData,
  setSuccess,
  setError,
}: UseOptimisticFoodLogOptions) {
  const [pending, setPending] = useState<OptimisticFoodEntry[]>(() =>
    getFoodLogQueue().map(queueToEntry),
  );

  const syncQueuedFromStorage = useCallback(() => {
    setPending((current) => {
      const queued = getFoodLogQueue().map(queueToEntry);
      const active = current.filter((x) => x.status !== 'queued');
      const activeIds = new Set(active.map((x) => x.id));
      return [...active, ...queued.filter((q) => !activeIds.has(q.id))];
    });
  }, []);

  const flushQueue = useCallback(async () => {
    if (!serverOnline || typeof navigator !== 'undefined' && !navigator.onLine) return;
    const queue = getFoodLogQueue();
    if (!queue.length) return;

    let synced = 0;
    for (const item of queue) {
      setPending((p) =>
        p.map((x) => (x.id === item.id ? { ...x, status: 'pending' as const } : x)),
      );
      try {
        const res =
          item.kind === 'item'
            ? await api.logFoodItem(item.food, item.quantity_g)
            : item.kind === 'macros'
              ? await api.logFoodMacros({
                  food: item.food,
                  quantity_g: item.quantity_g,
                  calories: item.calories,
                  carbs: item.carbs,
                  protein: item.protein,
                  fat: item.fat,
                })
              : await api.logFood(item.description, item.meal_type);
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
    }
  }, [serverOnline, setData, setSuccess, setError]);

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

  const logItem = useCallback(
    async (food: string, quantity_g: number, onSuccess?: (summary: FoodTodayResponse) => void) => {
      const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setPending((p) => [...p, { id, food, quantity_g, status: 'pending' }]);
      setError('');

      if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
        const q = enqueueFoodLog({ kind: 'item', food, quantity_g });
        setPending((p) => p.map((x) => (x.id === id ? queueToEntry(q) : x)));
        setSuccess('Saved offline — will sync when back online');
        return;
      }

      try {
        const res = await api.logFoodItem(food, quantity_g);
        setData(res.summary);
        setSuccess(res.message);
        setPending((p) => p.filter((x) => x.id !== id));
        onSuccess?.(res.summary);
      } catch (e) {
        if (isOfflineError(e)) {
          const q = enqueueFoodLog({ kind: 'item', food, quantity_g });
          setPending((p) => p.map((x) => (x.id === id ? queueToEntry(q) : x)));
          setSuccess('Saved offline — will sync when back online');
          return;
        }
        const msg = e instanceof Error ? e.message : 'Log failed';
        setPending((p) => p.map((x) => (x.id === id ? { ...x, status: 'failed' as const } : x)));
        setError(msg);
      }
    },
    [serverOnline, setData, setSuccess, setError],
  );

  const logMacros = useCallback(
    async (
      food: string,
      quantity_g: number,
      macros: { calories: number; carbs: number; protein: number; fat: number },
      onSuccess?: (summary: FoodTodayResponse) => void,
    ) => {
      const id = `pending-macros-${Date.now()}`;
      setPending((p) => [...p, { id, food, quantity_g, status: 'pending', source: 'macros' }]);
      setError('');

      if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
        const q = enqueueFoodLog({ kind: 'macros', food, quantity_g, ...macros });
        setPending((p) => p.map((x) => (x.id === id ? queueToEntry(q) : x)));
        setSuccess('Saved offline — will sync when back online');
        return;
      }

      try {
        const res = await api.logFoodMacros({ food, quantity_g, ...macros });
        setData(res.summary);
        setSuccess(res.message);
        setPending((p) => p.filter((x) => x.id !== id));
        onSuccess?.(res.summary);
      } catch (e) {
        if (isOfflineError(e)) {
          const q = enqueueFoodLog({ kind: 'macros', food, quantity_g, ...macros });
          setPending((p) => p.map((x) => (x.id === id ? queueToEntry(q) : x)));
          setSuccess('Saved offline — will sync when back online');
          return;
        }
        const msg = e instanceof Error ? e.message : 'Log failed';
        setPending((p) => p.map((x) => (x.id === id ? { ...x, status: 'failed' as const } : x)));
        setError(msg);
      }
    },
    [serverOnline, setData, setSuccess, setError],
  );

  const logMeal = useCallback(
    async (description: string, meal_type: string, onSuccess?: () => void) => {
      const id = `pending-meal-${Date.now()}`;
      setPending((p) => [...p, { id, food: description, quantity_g: 0, status: 'pending' }]);
      setError('');

      if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
        const q = enqueueFoodLog({ kind: 'meal', description, meal_type });
        setPending((p) => p.map((x) => (x.id === id ? queueToEntry(q) : x)));
        setSuccess('Saved offline — will sync when back online');
        onSuccess?.();
        return;
      }

      try {
        const res = await api.logFood(description, meal_type);
        setData(res.summary);
        setSuccess(res.message);
        setPending((p) => p.filter((x) => x.id !== id));
        onSuccess?.();
      } catch (e) {
        if (isOfflineError(e)) {
          const q = enqueueFoodLog({ kind: 'meal', description, meal_type });
          setPending((p) => p.map((x) => (x.id === id ? queueToEntry(q) : x)));
          setSuccess('Saved offline — will sync when back online');
          onSuccess?.();
          return;
        }
        const msg = e instanceof Error ? e.message : 'Log failed';
        setPending((p) => p.map((x) => (x.id === id ? { ...x, status: 'failed' as const } : x)));
        setError(msg);
      }
    },
    [serverOnline, setData, setSuccess, setError],
  );

  const retry = useCallback(
    (entry: OptimisticFoodEntry) => {
      const queued = getFoodLogQueue().find((q) => q.id === entry.id);
      removeFoodLogQueueItem(entry.id);
      setPending((p) => p.filter((x) => x.id !== entry.id));
      if (queued?.kind === 'macros') {
        void logMacros(queued.food, queued.quantity_g, {
          calories: queued.calories,
          carbs: queued.carbs,
          protein: queued.protein,
          fat: queued.fat,
        });
      } else if (entry.quantity_g > 0) {
        void logItem(entry.food, entry.quantity_g);
      } else {
        void logMeal(entry.food, 'other');
      }
    },
    [logItem, logMeal, logMacros],
  );

  const dismiss = useCallback((id: string) => {
    removeFoodLogQueueItem(id);
    setPending((p) => p.filter((x) => x.id !== id));
  }, []);

  const dismissAllQueued = useCallback(() => {
    clearFoodLogQueue();
    setPending((p) => p.filter((x) => x.status !== 'queued'));
  }, []);

  return {
    pending,
    logItem,
    logMeal,
    logMacros,
    retry,
    dismiss,
    dismissAllQueued,
    flushQueue,
    queuedCount: pending.filter((x) => x.status === 'queued').length,
  };
}
