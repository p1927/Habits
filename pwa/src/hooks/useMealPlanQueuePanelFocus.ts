import { useEffect, useRef } from 'react';
import type { QueuedMealPlanLog } from '../lib/mealPlanQueue';
import { focusMealPlanQueueScrollTarget } from '../lib/mealPlanQueueFocus';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface UseMealPlanQueuePanelFocusOptions {
  queue: QueuedMealPlanLog[];
  failedIds: Set<string>;
  failedCount: number;
  serverOnline: boolean;
  syncing: boolean;
  retryingId: string | null;
  scrollToQueueToken?: number;
}

export function useMealPlanQueuePanelFocus({
  queue,
  failedIds,
  failedCount,
  serverOnline,
  syncing,
  retryingId,
  scrollToQueueToken = 0,
}: UseMealPlanQueuePanelFocusOptions) {
  const prevFailedCountRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const syncBtnRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const focusQueueTarget = () => {
    focusMealPlanQueueScrollTarget({
      queue,
      failedIds,
      panel: panelRef.current,
      syncButton: syncBtnRef.current,
      serverOnline,
      syncing,
      retrying: !!retryingId,
      reducedMotion: prefersReducedMotion,
    });
  };

  useEffect(() => {
    if (failedCount === 0) {
      prevFailedCountRef.current = 0;
      return;
    }
    const shouldFocus = failedCount > prevFailedCountRef.current;
    prevFailedCountRef.current = failedCount;
    if (!shouldFocus || syncing) return;
    if (!queue.find((item) => failedIds.has(item.id))) return;

    requestAnimationFrame(() => {
      focusQueueTarget();
    });
  }, [failedCount, syncing, queue, failedIds, serverOnline, retryingId, prefersReducedMotion]);

  useEffect(() => {
    if (!scrollToQueueToken) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        focusQueueTarget();
      });
    });
  }, [scrollToQueueToken, queue, failedIds, serverOnline, syncing, retryingId, prefersReducedMotion]);

  return { panelRef, syncBtnRef, prefersReducedMotion };
}
