import { useCallback, useRef, useState } from 'react';
import { resolveSwipeDirection } from '../lib/swipeStackGesture';
import { SWIPE_STACK_MAX_ROTATION, SWIPE_STACK_THRESHOLD } from '../lib/swipeStackConstants';
import type { SwipeDirection } from '../lib/swipeStackTypes';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { useSwipeStackExit } from './useSwipeStackExit';

export { SWIPE_EXIT_TRANSFORMS } from '../lib/swipeStackGesture';

interface UseSwipeStackOptions {
  onSwipe?: (direction: SwipeDirection) => void;
  onCommit?: (direction: SwipeDirection) => void;
}

export function useSwipeStack({ onSwipe, onCommit }: UseSwipeStackOptions) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const start = useRef({ x: 0, y: 0 });
  const lastMove = useRef({ x: 0, y: 0, t: 0 });
  const releaseVelocity = useRef({ x: 0, y: 0 });

  const exit = useSwipeStackExit({ prefersReducedMotion, onSwipe, onCommit });

  const rotation = Math.max(-SWIPE_STACK_MAX_ROTATION, Math.min(SWIPE_STACK_MAX_ROTATION, offset.x * 0.08));
  const dampedY = offset.y * 0.3;
  const dragProgress = Math.min((Math.abs(offset.x) + Math.abs(offset.y)) / SWIPE_STACK_THRESHOLD, 1);
  const stampRightOpacity = Math.min(Math.max(offset.x / SWIPE_STACK_THRESHOLD, 0), 1);
  const stampLeftOpacity = Math.min(Math.max(-offset.x / SWIPE_STACK_THRESHOLD, 0), 1);
  const stampUpOpacity = Math.min(Math.max(-offset.y / SWIPE_STACK_THRESHOLD, 0), 1);
  const nextCardScale = exit.isExiting ? 1 : 0.96 + dragProgress * 0.04;

  const resetOffset = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  const commit = useCallback(
    (direction: SwipeDirection) => {
      exit.commit(direction, { offsetX: offset.x, dampedY, rotation }, setDragging, resetOffset);
    },
    [dampedY, exit, offset.x, rotation, resetOffset],
  );

  const fire = useCallback(
    (direction: SwipeDirection) => {
      commit(direction);
    },
    [commit],
  );

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (exit.isExiting) return;
      const t = performance.now();
      start.current = { x: clientX, y: clientY };
      lastMove.current = { x: clientX, y: clientY, t };
      setDragging(true);
    },
    [exit.isExiting],
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragging || exit.isExiting) return;
      const t = performance.now();
      const dt = Math.max(t - lastMove.current.t, 1);
      releaseVelocity.current = {
        x: (clientX - lastMove.current.x) / dt,
        y: (clientY - lastMove.current.y) / dt,
      };
      lastMove.current = { x: clientX, y: clientY, t };
      setOffset({ x: clientX - start.current.x, y: clientY - start.current.y });
    },
    [dragging, exit.isExiting],
  );

  const handleEnd = useCallback(() => {
    if (exit.isExiting) return;
    setDragging(false);
    const { x, y } = offset;
    const { x: velocityX, y: velocityY } = releaseVelocity.current;
    const direction = resolveSwipeDirection(x, y, velocityX, velocityY);
    if (direction) {
      commit(direction);
      return;
    }
    resetOffset();
  }, [commit, exit.isExiting, offset, resetOffset]);

  const dragTransform = `translate(${offset.x}px, ${dampedY}px) rotate(${rotation}deg)`;

  return {
    dragging,
    fire,
    handleStart,
    handleMove,
    handleEnd,
    rotation,
    dampedY,
    offset,
    nextCardScale,
    stampRightOpacity,
    stampLeftOpacity,
    stampUpOpacity,
    isExiting: exit.isExiting,
    exitAnimating: exit.exitAnimating,
    cardTransform: exit.cardTransformForExit(dragTransform),
  };
}
