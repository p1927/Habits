import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { mealPlanSyncSourceLabel, type MealPlanSyncSource } from '../lib/mealPlanQueue';

export interface MealPlanQueuePendingBannerProps {
  count: number;
  failedCount: number;
  targetSource: MealPlanSyncSource;
  onOpenQueue: (source: MealPlanSyncSource) => void;
}

export function MealPlanQueuePendingBanner({
  count,
  failedCount,
  targetSource,
  onOpenQueue,
}: MealPlanQueuePendingBannerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const targetLabel = mealPlanSyncSourceLabel(targetSource);

  if (count <= 0) return null;

  const failedSuffix = failedCount > 0 ? ` · ${failedCount} failed` : '';

  return (
    <button
      type="button"
      className="banner banner-warn meal-plan-queue-awareness meal-plan-remote-sync--actionable"
      role="status"
      aria-live={prefersReducedMotion ? undefined : 'polite'}
      aria-atomic="true"
      onClick={() => onOpenQueue(targetSource)}
    >
      {count} meal log{count === 1 ? '' : 's'} queued{failedSuffix} — tap to open {targetLabel}
    </button>
  );
}
