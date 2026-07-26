export function MealPlanQueueEmptyHint() {
  return (
    <p className="meal-plan-queue-empty" role="status">
      <span className="meal-plan-queue-empty__icon" aria-hidden="true">✓</span>
      No pending offline meal logs
    </p>
  );
}
