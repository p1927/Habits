import { useCallback, useEffect, useState } from 'react';
import {
  getMealPlanQueueSyncStatus,
  MEAL_PLAN_SYNC_CHANGE,
  type MealPlanQueueSyncStatus,
  type MealPlanSyncSource,
} from '../lib/mealPlanQueue';

const SOURCE_LABELS: Record<MealPlanSyncSource, string> = {
  home: 'Home',
  day: 'Day',
  log: 'Log',
};

export function mealPlanSyncSourceLabel(source: MealPlanSyncSource): string {
  return SOURCE_LABELS[source];
}

export function useMealPlanQueueRemoteSync(
  viewer: MealPlanSyncSource,
  opts?: { showOwnSource?: boolean },
) {
  const showOwnSource = opts?.showOwnSource ?? false;

  const readRemote = useCallback((): MealPlanQueueSyncStatus | null => {
    const status = getMealPlanQueueSyncStatus();
    if (!status) return null;
    if (status.source === viewer && !showOwnSource) return null;
    return status;
  }, [viewer, showOwnSource]);

  const [remoteSync, setRemoteSync] = useState<MealPlanQueueSyncStatus | null>(() => readRemote());

  useEffect(() => {
    const sync = () => setRemoteSync(readRemote());
    sync();
    window.addEventListener(MEAL_PLAN_SYNC_CHANGE, sync);
    return () => window.removeEventListener(MEAL_PLAN_SYNC_CHANGE, sync);
  }, [readRemote]);

  return remoteSync;
}
