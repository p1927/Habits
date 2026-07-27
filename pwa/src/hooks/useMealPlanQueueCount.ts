import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getMealPlanFailedCount,
  getMealPlanQueue,
  MEAL_PLAN_QUEUE_CHANGE,
  MEAL_PLAN_SYNC_CHANGE,
  pruneMealPlanFailedIds,
} from '../lib/mealPlanQueue';

export function useMealPlanQueueCount() {
  const [count, setCount] = useState(() => getMealPlanQueue().length);
  const [failedCount, setFailedCount] = useState(() => getMealPlanFailedCount());
  const [badgePulse, setBadgePulse] = useState(false);
  const prevCountRef = useRef(count);
  const prevFailedRef = useRef(failedCount);

  const sync = useCallback(() => {
    const next = getMealPlanQueue().length;
    if (next === 0) pruneMealPlanFailedIds();
    const nextFailed = next === 0 ? 0 : getMealPlanFailedCount();
    if (next > prevCountRef.current || nextFailed > prevFailedRef.current) {
      setBadgePulse(true);
    }
    prevCountRef.current = next;
    prevFailedRef.current = nextFailed;
    setCount(next);
    setFailedCount(nextFailed);
  }, []);

  useEffect(() => {
    if (!badgePulse) return;
    const id = window.setTimeout(() => setBadgePulse(false), 700);
    return () => window.clearTimeout(id);
  }, [badgePulse]);

  useEffect(() => {
    sync();
    const onWake = () => sync();
    window.addEventListener('online', onWake);
    window.addEventListener('focus', onWake);
    window.addEventListener(MEAL_PLAN_QUEUE_CHANGE, onWake);
    window.addEventListener(MEAL_PLAN_SYNC_CHANGE, onWake);
    return () => {
      window.removeEventListener('online', onWake);
      window.removeEventListener('focus', onWake);
      window.removeEventListener(MEAL_PLAN_QUEUE_CHANGE, onWake);
      window.removeEventListener(MEAL_PLAN_SYNC_CHANGE, onWake);
    };
  }, [sync]);

  return { count, failedCount, badgePulse };
}
