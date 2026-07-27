import { MealPlanQueueEmptyHint } from './MealPlanQueueEmptyHint';
import { MealPlanQueuePanel, type MealPlanQueuePanelProps } from './MealPlanQueuePanel';

export interface MealPlanQueueSectionProps extends MealPlanQueuePanelProps {
  hasMealPlan: boolean;
}

export function MealPlanQueueSection({ hasMealPlan, queue, syncing, ...panelProps }: MealPlanQueueSectionProps) {
  const hasPendingQueue = queue.length > 0 || syncing;

  if (hasPendingQueue) {
    return <MealPlanQueuePanel queue={queue} syncing={syncing} {...panelProps} />;
  }

  if (hasMealPlan) {
    return <MealPlanQueueEmptyHint />;
  }

  return null;
}
