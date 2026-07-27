import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export interface MealPlanQueuePendingBannerProps {
  count: number;
  failedCount: number;
  onOpenHome: () => void;
}

export function MealPlanQueuePendingBanner({ count, failedCount, onOpenHome }: MealPlanQueuePendingBannerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (count <= 0) return null;

  const failedSuffix = failedCount > 0 ? ` · ${failedCount} failed` : '';

  return (
    <button
      type="button"
      className="banner banner-warn meal-plan-queue-awareness meal-plan-remote-sync--actionable"
      role="status"
      aria-live={prefersReducedMotion ? undefined : 'polite'}
      aria-atomic="true"
      onClick={onOpenHome}
    >
      {count} meal log{count === 1 ? '' : 's'} queued{failedSuffix} — tap to open Home
    </button>
  );
}
