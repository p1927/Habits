import { useEffect } from 'react';
import type { OptimisticFoodEntry } from './useOptimisticFoodLog';
import { focusFirstQueuedFoodRow } from '../lib/foodQueueFocus';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export function useFoodQueuePendingFocus(
  pending: OptimisticFoodEntry[],
  scrollToFoodQueue?: number,
): void {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!scrollToFoodQueue) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        focusFirstQueuedFoodRow(pending, prefersReducedMotion);
      });
    });
  }, [scrollToFoodQueue, pending, prefersReducedMotion]);
}
