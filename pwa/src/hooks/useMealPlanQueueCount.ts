import { useCallback, useEffect, useState } from 'react';
import { getMealPlanQueue, MEAL_PLAN_QUEUE_CHANGE } from '../lib/mealPlanQueue';

export function useMealPlanQueueCount() {
  const [count, setCount] = useState(() => getMealPlanQueue().length);

  const sync = useCallback(() => {
    setCount(getMealPlanQueue().length);
  }, []);

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

  return count;
}
