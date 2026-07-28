import type { OptimisticFoodEntry } from '../hooks/useOptimisticFoodLog';

export function foodQueuePendingItemId(entryId: string): string {
  return `food-queue-pending-${entryId}`;
}

export function foodQueuePendingAriaLabel(food: string): string {
  return `Pending: ${food}`;
}

export function focusFirstQueuedFoodRow(
  pending: OptimisticFoodEntry[],
  reducedMotion: boolean,
): boolean {
  const firstQueued = pending.find((entry) => entry.status === 'queued');
  if (!firstQueued) return false;

  const row = document.getElementById(foodQueuePendingItemId(firstQueued.id));
  if (!row) return false;

  const scrollBehavior = reducedMotion ? 'auto' : 'smooth';
  row.scrollIntoView({ block: 'nearest', behavior: scrollBehavior });
  row.focus({ preventScroll: true });
  return true;
}
