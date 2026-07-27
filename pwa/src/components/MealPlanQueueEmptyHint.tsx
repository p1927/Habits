export function MealPlanQueueEmptyHint({ announce = false }: { announce?: boolean }) {
  return (
    <p
      className="meal-plan-queue-empty"
      role={announce ? 'status' : undefined}
      aria-live={announce ? 'polite' : undefined}
      aria-atomic={announce ? 'true' : undefined}
    >
      <span className="meal-plan-queue-empty__icon" aria-hidden="true">✓</span>
      No pending offline meal logs
    </p>
  );
}
