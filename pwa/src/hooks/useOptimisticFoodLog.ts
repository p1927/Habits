import { useCallback, useState } from 'react';
import { api, type FoodTodayResponse } from '../lib/api';

export interface OptimisticFoodEntry {
  id: string;
  food: string;
  quantity_g: number;
  status: 'pending' | 'failed';
}

interface UseOptimisticFoodLogOptions {
  setData: (data: FoodTodayResponse | null) => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}

export function useOptimisticFoodLog({ setData, setSuccess, setError }: UseOptimisticFoodLogOptions) {
  const [pending, setPending] = useState<OptimisticFoodEntry[]>([]);

  const logItem = useCallback(
    async (food: string, quantity_g: number, onSuccess?: () => void) => {
      const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setPending((p) => [...p, { id, food, quantity_g, status: 'pending' }]);
      setError('');
      try {
        const res = await api.logFoodItem(food, quantity_g);
        setData(res.summary);
        setSuccess(res.message);
        setPending((p) => p.filter((x) => x.id !== id));
        onSuccess?.();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Log failed';
        setPending((p) => p.map((x) => (x.id === id ? { ...x, status: 'failed' as const } : x)));
        setError(msg);
      }
    },
    [setData, setSuccess, setError],
  );

  const logMeal = useCallback(
    async (description: string, meal_type: string, onSuccess?: () => void) => {
      const id = `pending-meal-${Date.now()}`;
      setPending((p) => [...p, { id, food: description, quantity_g: 0, status: 'pending' }]);
      setError('');
      try {
        const res = await api.logFood(description, meal_type);
        setData(res.summary);
        setSuccess(res.message);
        setPending((p) => p.filter((x) => x.id !== id));
        onSuccess?.();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Log failed';
        setPending((p) => p.map((x) => (x.id === id ? { ...x, status: 'failed' as const } : x)));
        setError(msg);
      }
    },
    [setData, setSuccess, setError],
  );

  const retry = useCallback(
    (entry: OptimisticFoodEntry) => {
      setPending((p) => p.filter((x) => x.id !== entry.id));
      if (entry.quantity_g > 0) {
        void logItem(entry.food, entry.quantity_g);
      } else {
        void logMeal(entry.food, 'other');
      }
    },
    [logItem, logMeal],
  );

  const dismiss = useCallback((id: string) => {
    setPending((p) => p.filter((x) => x.id !== id));
  }, []);

  return { pending, logItem, logMeal, retry, dismiss };
}
