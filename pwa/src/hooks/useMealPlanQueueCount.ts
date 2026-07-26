import { useCallback, useEffect, useRef, useState } from 'react';
import { getMealPlanQueue, MEAL_PLAN_QUEUE_CHANGE } from '../lib/mealPlanQueue';

export function useMealPlanQueueCount() {
  const [count, setCount] = useState(() => getMealPlanQueue().length);
  const [badgePulse, setBadgePulse] = useState(false);
  const prevCountRef = useRef(count);

  const sync = useCallback(() => {
    const next = getMealPlanQueue().length;
    if (next > prevCountRef.current) {
      setBadgePulse(true);
    }
    prevCountRef.current = next;
    setCount(next);
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
    return () => {
      window.removeEventListener('online', onWake);
      window.removeEventListener('focus', onWake);
      window.removeEventListener(MEAL_PLAN_QUEUE_CHANGE, onWake);
    };
  }, [sync]);

  return { count, badgePulse };
}
