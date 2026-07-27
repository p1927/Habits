import { useCallback, useRef } from 'react';
import type { FoodTodayResponse } from '../lib/api';
import type { UseMealPlanQueueSyncOptions } from './useMealPlanQueueSyncOptions';

type StableCallbackOptions = Pick<
  UseMealPlanQueueSyncOptions,
  | 'getFoodBeforeSync'
  | 'onFoodUpdated'
  | 'afterSync'
  | 'onBatchSynced'
  | 'onItemLogged'
  | 'onItemOffline'
  | 'setError'
  | 'clearError'
>;

export function useMealPlanSyncStableCallbacks({
  getFoodBeforeSync,
  onFoodUpdated,
  afterSync,
  onBatchSynced,
  onItemLogged,
  onItemOffline,
  setError,
  clearError,
}: StableCallbackOptions) {
  const getFoodBeforeSyncRef = useRef(getFoodBeforeSync);
  const onFoodUpdatedRef = useRef(onFoodUpdated);
  const afterSyncRef = useRef(afterSync);
  const onBatchSyncedRef = useRef(onBatchSynced);
  const onItemLoggedRef = useRef(onItemLogged);
  const onItemOfflineRef = useRef(onItemOffline);
  const setErrorRef = useRef(setError);
  const clearErrorRef = useRef(clearError);
  getFoodBeforeSyncRef.current = getFoodBeforeSync;
  onFoodUpdatedRef.current = onFoodUpdated;
  afterSyncRef.current = afterSync;
  onBatchSyncedRef.current = onBatchSynced;
  onItemLoggedRef.current = onItemLogged;
  onItemOfflineRef.current = onItemOffline;
  setErrorRef.current = setError;
  clearErrorRef.current = clearError;

  const stableGetFoodBeforeSync = useCallback(
    () => getFoodBeforeSyncRef.current(),
    [],
  );
  const stableOnFoodUpdated = useCallback(
    (summary: FoodTodayResponse) => onFoodUpdatedRef.current?.(summary),
    [],
  );
  const stableAfterSync = useCallback(() => afterSyncRef.current?.(), []);
  const stableOnBatchSynced = useCallback(
    (synced: number, offeredUndo: boolean) =>
      onBatchSyncedRef.current?.(synced, offeredUndo),
    [],
  );
  const stableOnItemLogged = useCallback(
    (label: string, offeredUndo: boolean) =>
      onItemLoggedRef.current?.(label, offeredUndo),
    [],
  );
  const stableOnItemOffline = useCallback(
    (label: string) => onItemOfflineRef.current?.(label),
    [],
  );
  const stableSetError = useCallback(
    (message: string) => setErrorRef.current?.(message),
    [],
  );
  const stableClearError = useCallback(() => clearErrorRef.current?.(), []);

  return {
    stableGetFoodBeforeSync,
    stableOnFoodUpdated,
    stableAfterSync,
    stableOnBatchSynced,
    stableOnItemLogged,
    stableOnItemOffline,
    stableSetError,
    stableClearError,
  };
}
