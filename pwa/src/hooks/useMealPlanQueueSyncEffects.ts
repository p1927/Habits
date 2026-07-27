import { useEffect } from 'react';
import { getMealPlanFailedIds, MEAL_PLAN_QUEUE_CHANGE } from '../lib/mealPlanQueue';

interface UseMealPlanQueueSyncEffectsOptions {
  active: boolean;
  autoFlushOnMount: boolean;
  watchOnline: boolean;
  watchFocus: boolean;
  watchQueueChanges: boolean;
  syncMealPlanQueue: () => void;
  flushMealPlanQueue: () => Promise<void>;
  setFailedMealPlanIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function useMealPlanQueueSyncEffects({
  active,
  autoFlushOnMount,
  watchOnline,
  watchFocus,
  watchQueueChanges,
  syncMealPlanQueue,
  flushMealPlanQueue,
  setFailedMealPlanIds,
}: UseMealPlanQueueSyncEffectsOptions) {
  useEffect(() => {
    const syncFailedFromStorage = () => {
      setFailedMealPlanIds(new Set(getMealPlanFailedIds()));
    };
    window.addEventListener(MEAL_PLAN_QUEUE_CHANGE, syncFailedFromStorage);
    return () => window.removeEventListener(MEAL_PLAN_QUEUE_CHANGE, syncFailedFromStorage);
  }, [setFailedMealPlanIds]);

  useEffect(() => {
    if (!active || !watchQueueChanges) return;
    syncMealPlanQueue();
    const onQueueChange = () => syncMealPlanQueue();
    window.addEventListener(MEAL_PLAN_QUEUE_CHANGE, onQueueChange);
    return () => window.removeEventListener(MEAL_PLAN_QUEUE_CHANGE, onQueueChange);
  }, [active, watchQueueChanges, syncMealPlanQueue]);

  useEffect(() => {
    if (!active || !autoFlushOnMount) return;
    void flushMealPlanQueue();
  }, [active, autoFlushOnMount, flushMealPlanQueue]);

  useEffect(() => {
    if (!active || (!watchOnline && !watchFocus)) return;
    const onWake = () => {
      syncMealPlanQueue();
      void flushMealPlanQueue();
    };
    if (watchOnline) window.addEventListener('online', onWake);
    if (watchFocus) window.addEventListener('focus', onWake);
    return () => {
      if (watchOnline) window.removeEventListener('online', onWake);
      if (watchFocus) window.removeEventListener('focus', onWake);
    };
  }, [active, watchOnline, watchFocus, syncMealPlanQueue, flushMealPlanQueue]);
}
