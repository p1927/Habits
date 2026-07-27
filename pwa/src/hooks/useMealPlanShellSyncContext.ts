import { useCallback, useEffect, useRef } from 'react';
import type { FoodTodayResponse } from '../lib/api';
import { fetchFoodTodaySnapshot, primeFoodTodaySnapshot } from '../lib/foodTodaySnapshot';

interface UseMealPlanShellSyncContextOptions {
  food?: FoodTodayResponse | null;
  setMessage: (msg: string) => void;
  setError: (msg: string) => void;
}

export function useMealPlanShellSyncContext({
  food,
  setMessage,
  setError,
}: UseMealPlanShellSyncContextOptions) {
  const foodRef = useRef(food);
  foodRef.current = food;

  useEffect(() => {
    if (food) primeFoodTodaySnapshot(food);
  }, [food]);

  const getFoodBeforeSync = useCallback(async () => {
    if (foodRef.current) return foodRef.current;
    return fetchFoodTodaySnapshot();
  }, []);

  const clearError = useCallback(() => setError(''), [setError]);

  const onBatchSynced = useCallback(
    (synced: number, offeredUndo: boolean) => {
      if (!offeredUndo) {
        setMessage(`Synced ${synced} queued meal log${synced === 1 ? '' : 's'}`);
      }
    },
    [setMessage],
  );

  const onItemLogged = useCallback(
    (label: string, offeredUndo: boolean) => {
      if (!offeredUndo) setMessage(`Logged ${label}`);
    },
    [setMessage],
  );

  const onItemOffline = useCallback(
    (label: string) => setMessage(`${label} still queued — offline`),
    [setMessage],
  );

  return {
    getFoodBeforeSync,
    clearError,
    onBatchSynced,
    onItemLogged,
    onItemOffline,
  };
}
