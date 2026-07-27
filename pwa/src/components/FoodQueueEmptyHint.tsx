import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export function FoodQueueEmptyHint({ announce = false }: { announce?: boolean }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnnounce = announce && !prefersReducedMotion;

  return (
    <p
      className="meal-plan-queue-empty food-queue-empty"
      role={shouldAnnounce ? 'status' : undefined}
      aria-live={shouldAnnounce ? 'polite' : undefined}
      aria-atomic={shouldAnnounce ? 'true' : undefined}
    >
      <span className="meal-plan-queue-empty__icon" aria-hidden="true">✓</span>
      No pending offline food logs
    </p>
  );
}
