import { useEffect, useRef, useState } from 'react';
import { MealPlanQueueEmptyHint } from './MealPlanQueueEmptyHint';
import { MealPlanQueuePanel, type MealPlanQueuePanelProps } from './MealPlanQueuePanel';

export interface MealPlanQueueSectionProps extends MealPlanQueuePanelProps {
  hasMealPlan: boolean;
}

export function MealPlanQueueSection({ hasMealPlan, queue, syncing, ...panelProps }: MealPlanQueueSectionProps) {
  const hasPendingQueue = queue.length > 0 || syncing;
  const prevPendingRef = useRef<boolean | null>(null);
  const [announceEmpty, setAnnounceEmpty] = useState(false);

  useEffect(() => {
    const wasPending = prevPendingRef.current;
    prevPendingRef.current = hasPendingQueue;
    if (wasPending === true && !hasPendingQueue && hasMealPlan) {
      setAnnounceEmpty(true);
      const id = window.setTimeout(() => setAnnounceEmpty(false), 1500);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [hasPendingQueue, hasMealPlan]);

  if (hasPendingQueue) {
    return <MealPlanQueuePanel queue={queue} syncing={syncing} {...panelProps} />;
  }

  if (hasMealPlan) {
    return <MealPlanQueueEmptyHint announce={announceEmpty} />;
  }

  return null;
}
