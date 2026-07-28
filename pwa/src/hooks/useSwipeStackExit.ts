import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SWIPE_EXIT_MS, SWIPE_EXIT_TRANSFORMS, vibrateForSwipe } from '../lib/swipeStackGesture';
import type { SwipeDirection } from '../lib/swipeStackTypes';

interface UseSwipeStackExitOptions {
  prefersReducedMotion: boolean;
  onSwipe?: (direction: SwipeDirection) => void;
  onCommit?: (direction: SwipeDirection) => void;
}

interface CommitContext {
  offsetX: number;
  dampedY: number;
  rotation: number;
}

export function useSwipeStackExit({ prefersReducedMotion, onSwipe, onCommit }: UseSwipeStackExitOptions) {
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(null);
  const [exitAnimating, setExitAnimating] = useState(false);
  const exitFromTransform = useRef('translate(0px, 0px) rotate(0deg)');
  const onSwipeRef = useRef(onSwipe);
  const onCommitRef = useRef(onCommit);
  onSwipeRef.current = onSwipe;
  onCommitRef.current = onCommit;

  const isExiting = exitDirection !== null;

  const commit = useCallback(
    (direction: SwipeDirection, context: CommitContext, setDragging: (dragging: boolean) => void, resetOffset: () => void) => {
      if (isExiting) return;
      onCommitRef.current?.(direction);
      vibrateForSwipe(direction);

      if (prefersReducedMotion) {
        onSwipeRef.current?.(direction);
        resetOffset();
        return;
      }

      exitFromTransform.current = `translate(${context.offsetX}px, ${context.dampedY}px) rotate(${context.rotation}deg)`;
      setDragging(false);
      setExitAnimating(false);
      setExitDirection(direction);
    },
    [isExiting, prefersReducedMotion],
  );

  useLayoutEffect(() => {
    if (!exitDirection || exitAnimating) return;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setExitAnimating(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [exitAnimating, exitDirection]);

  useEffect(() => {
    if (!exitDirection || !exitAnimating) return;
    const timer = window.setTimeout(() => {
      onSwipeRef.current?.(exitDirection);
      setExitDirection(null);
      setExitAnimating(false);
    }, SWIPE_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [exitAnimating, exitDirection]);

  const cardTransformForExit = (dragTransform: string) =>
    exitDirection && exitAnimating
      ? SWIPE_EXIT_TRANSFORMS[exitDirection]
      : exitDirection
        ? exitFromTransform.current
        : dragTransform;

  return {
    isExiting,
    exitAnimating,
    commit,
    cardTransformForExit,
    resetExit: () => {
      setExitDirection(null);
      setExitAnimating(false);
    },
  };
}

export { SWIPE_EXIT_TRANSFORMS } from '../lib/swipeStackGesture';
