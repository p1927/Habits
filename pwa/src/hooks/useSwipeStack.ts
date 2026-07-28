import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  SWIPE_STACK_MAX_ROTATION,
  SWIPE_STACK_THRESHOLD,
  SWIPE_VELOCITY_COMMIT,
} from '../lib/swipeStackConstants';
import type { SwipeDirection } from '../lib/swipeStackTypes';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface UseSwipeStackOptions {
  onSwipe?: (direction: SwipeDirection) => void;
  onCommit?: (direction: SwipeDirection) => void;
}

const EXIT_MS = 250;

export const SWIPE_EXIT_TRANSFORMS: Record<SwipeDirection, string> = {
  right: 'translate(120%, -8%) rotate(18deg)',
  left: 'translate(-120%, -8%) rotate(-18deg)',
  up: 'translate(0, -115%) rotate(-6deg)',
  down: 'translate(0, 115%) rotate(6deg)',
};

function vibrateForSwipe(direction: SwipeDirection) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  navigator.vibrate(direction === 'right' ? 12 : direction === 'left' ? [8, 40, 8] : 6);
}

function resolveSwipeDirection(
  x: number,
  y: number,
  velocityX: number,
  velocityY: number,
): SwipeDirection | null {
  if (Math.abs(y) > SWIPE_STACK_THRESHOLD && Math.abs(y) > Math.abs(x)) {
    return y < 0 ? 'up' : 'down';
  }
  if (Math.abs(x) > SWIPE_STACK_THRESHOLD) {
    return x > 0 ? 'right' : 'left';
  }
  if (Math.abs(velocityX) >= SWIPE_VELOCITY_COMMIT && Math.abs(velocityX) > Math.abs(velocityY)) {
    return velocityX > 0 ? 'right' : 'left';
  }
  if (Math.abs(velocityY) >= SWIPE_VELOCITY_COMMIT) {
    return velocityY < 0 ? 'up' : 'down';
  }
  return null;
}

export function useSwipeStack({ onSwipe, onCommit }: UseSwipeStackOptions) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(null);
  const [exitAnimating, setExitAnimating] = useState(false);
  const start = useRef({ x: 0, y: 0 });
  const lastMove = useRef({ x: 0, y: 0, t: 0 });
  const releaseVelocity = useRef({ x: 0, y: 0 });
  const exitFromTransform = useRef('translate(0px, 0px) rotate(0deg)');
  const onSwipeRef = useRef(onSwipe);
  const onCommitRef = useRef(onCommit);
  onSwipeRef.current = onSwipe;
  onCommitRef.current = onCommit;

  const rotation = Math.max(-SWIPE_STACK_MAX_ROTATION, Math.min(SWIPE_STACK_MAX_ROTATION, offset.x * 0.08));
  const dampedY = offset.y * 0.3;
  const dragProgress = Math.min((Math.abs(offset.x) + Math.abs(offset.y)) / SWIPE_STACK_THRESHOLD, 1);
  const stampRightOpacity = Math.min(Math.max(offset.x / SWIPE_STACK_THRESHOLD, 0), 1);
  const stampLeftOpacity = Math.min(Math.max(-offset.x / SWIPE_STACK_THRESHOLD, 0), 1);
  const stampUpOpacity = Math.min(Math.max(-offset.y / SWIPE_STACK_THRESHOLD, 0), 1);
  const isExiting = exitDirection !== null;
  const nextCardScale = isExiting ? 1 : 0.96 + dragProgress * 0.04;

  const commit = useCallback(
    (direction: SwipeDirection) => {
      if (isExiting) return;
      onCommitRef.current?.(direction);
      vibrateForSwipe(direction);

      if (prefersReducedMotion) {
        onSwipeRef.current?.(direction);
        setOffset({ x: 0, y: 0 });
        return;
      }

      exitFromTransform.current = `translate(${offset.x}px, ${dampedY}px) rotate(${rotation}deg)`;
      setDragging(false);
      setExitAnimating(false);
      setExitDirection(direction);
    },
    [dampedY, isExiting, offset.x, prefersReducedMotion, rotation],
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
      setOffset({ x: 0, y: 0 });
    }, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [exitAnimating, exitDirection]);

  const fire = useCallback(
    (direction: SwipeDirection) => {
      commit(direction);
    },
    [commit],
  );

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (isExiting) return;
      const t = performance.now();
      start.current = { x: clientX, y: clientY };
      lastMove.current = { x: clientX, y: clientY, t };
      setDragging(true);
    },
    [isExiting],
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragging || isExiting) return;
      const t = performance.now();
      const dt = Math.max(t - lastMove.current.t, 1);
      releaseVelocity.current = {
        x: (clientX - lastMove.current.x) / dt,
        y: (clientY - lastMove.current.y) / dt,
      };
      lastMove.current = { x: clientX, y: clientY, t };
      setOffset({ x: clientX - start.current.x, y: clientY - start.current.y });
    },
    [dragging, isExiting],
  );

  const handleEnd = useCallback(() => {
    if (isExiting) return;
    setDragging(false);
    const { x, y } = offset;
    const { x: velocityX, y: velocityY } = releaseVelocity.current;
    const direction = resolveSwipeDirection(x, y, velocityX, velocityY);
    if (direction) {
      commit(direction);
      return;
    }
    setOffset({ x: 0, y: 0 });
  }, [commit, isExiting, offset]);

  const cardTransform =
    exitDirection && exitAnimating
      ? SWIPE_EXIT_TRANSFORMS[exitDirection]
      : exitDirection
        ? exitFromTransform.current
        : `translate(${offset.x}px, ${dampedY}px) rotate(${rotation}deg)`;

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
    isExiting,
    exitAnimating,
    cardTransform,
  };
}
