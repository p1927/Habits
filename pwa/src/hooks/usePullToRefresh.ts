import { useCallback, useEffect, useRef, useState } from 'react';

const PULL_THRESHOLD = 72;

interface UsePullToRefreshOptions {
  onRefresh: () => void | Promise<void>;
  enabled?: boolean;
  scrollSelector?: string;
}

export function usePullToRefresh({
  onRefresh,
  enabled = true,
  scrollSelector = '.main',
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    refreshingRef.current = refreshing;
  }, [refreshing]);

  useEffect(() => {
    if (!enabled) return;
    const el = document.querySelector(scrollSelector);
    if (!el) return;

    const resetPull = () => {
      pullingRef.current = false;
      pullDistanceRef.current = 0;
      setPullDistance(0);
    };

    const onTouchStart = (e: Event) => {
      const touch = (e as TouchEvent).touches[0];
      if (refreshingRef.current || el.scrollTop > 0) return;
      startYRef.current = touch?.clientY ?? 0;
      pullingRef.current = true;
    };

    const onTouchMove = (e: Event) => {
      if (!pullingRef.current || refreshingRef.current) return;
      const y = (e as TouchEvent).touches[0]?.clientY ?? 0;
      const delta = Math.max(0, y - startYRef.current);
      if (delta > 0 && el.scrollTop <= 0) {
        pullDistanceRef.current = Math.min(delta, PULL_THRESHOLD * 1.5);
        setPullDistance(pullDistanceRef.current);
      }
    };

    const onTouchEnd = () => {
      if (!pullingRef.current) return;
      const shouldRefresh = pullDistanceRef.current >= PULL_THRESHOLD;
      resetPull();
      if (!shouldRefresh || refreshingRef.current) return;

      refreshingRef.current = true;
      setRefreshing(true);
      void Promise.resolve(onRefreshRef.current())
        .catch(() => undefined)
        .finally(() => {
          refreshingRef.current = false;
          setRefreshing(false);
        });
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [enabled, scrollSelector]);

  const triggerRefresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      await Promise.resolve(onRefreshRef.current());
    } catch {
      /* refresh errors handled by caller */
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, []);

  return {
    pullDistance,
    refreshing,
    pullProgress: Math.min(pullDistance / PULL_THRESHOLD, 1),
    triggerRefresh,
  };
}
