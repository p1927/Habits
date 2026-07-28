import { useEffect, useRef } from 'react';
import type { OptimisticFoodEntry } from './useOptimisticFoodLog';
import { focusFirstQueuedFoodRow } from '../lib/foodQueueFocus';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export function useFoodQueuePendingFocus(
  pending: OptimisticFoodEntry[],
  scrollToFoodQueue?: number,
): void {
  const prefersReducedMotion = usePrefersReducedMotion();
  const lastHandledTokenRef = useRef(0);

  useEffect(() => {
    if (!scrollToFoodQueue || scrollToFoodQueue === lastHandledTokenRef.current) return;
    lastHandledTokenRef.current = scrollToFoodQueue;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        focusFirstQueuedFoodRow(pending, prefersReducedMotion);
      });
    });
  }, [scrollToFoodQueue, pending, prefersReducedMotion]);
}
