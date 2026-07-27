import { useEffect, useRef } from 'react';
import { getMealPlanFailedIds, MEAL_PLAN_QUEUE_CHANGE } from '../lib/mealPlanQueue';

const mountFlushDone = new Set<string>();

interface UseMealPlanQueueSyncEffectsOptions {
  syncSource: string;
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
  syncSource,
  active,
  autoFlushOnMount,
  watchOnline,
  watchFocus,
  watchQueueChanges,
  syncMealPlanQueue,
  flushMealPlanQueue,
  setFailedMealPlanIds,
}: UseMealPlanQueueSyncEffectsOptions) {
  const flushRef = useRef(flushMealPlanQueue);
  const syncRef = useRef(syncMealPlanQueue);
  flushRef.current = flushMealPlanQueue;
  syncRef.current = syncMealPlanQueue;

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
    if (!active || !autoFlushOnMount || mountFlushDone.has(syncSource)) return;
    mountFlushDone.add(syncSource);
    void flushRef.current();
  }, [active, autoFlushOnMount, syncSource]);

  useEffect(() => {
    if (!active || (!watchOnline && !watchFocus)) return;
    const onWake = () => {
      syncRef.current();
      void flushRef.current();
    };
    if (watchOnline) window.addEventListener('online', onWake);
    if (watchFocus) window.addEventListener('focus', onWake);
    return () => {
      if (watchOnline) window.removeEventListener('online', onWake);
      if (watchFocus) window.removeEventListener('focus', onWake);
    };
  }, [active, watchOnline, watchFocus]);
}
