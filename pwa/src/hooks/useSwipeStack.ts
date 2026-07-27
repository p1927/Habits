import { useCallback, useRef, useState } from 'react';
import { SWIPE_STACK_MAX_ROTATION, SWIPE_STACK_THRESHOLD } from '../lib/swipeStackConstants';
import type { SwipeDirection } from '../lib/swipeStackTypes';

interface UseSwipeStackOptions {
  onSwipe?: (direction: SwipeDirection) => void;
}

function vibrateForSwipe(direction: SwipeDirection) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  navigator.vibrate(direction === 'right' ? 12 : direction === 'left' ? [8, 40, 8] : 6);
}

export function useSwipeStack({ onSwipe }: UseSwipeStackOptions) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const start = useRef({ x: 0, y: 0 });

  const fire = useCallback(
    (direction: SwipeDirection) => {
      vibrateForSwipe(direction);
      onSwipe?.(direction);
    },
    [onSwipe],
  );

  const handleStart = useCallback((clientX: number, clientY: number) => {
    start.current = { x: clientX, y: clientY };
    setDragging(true);
  }, []);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragging) return;
      setOffset({ x: clientX - start.current.x, y: clientY - start.current.y });
    },
    [dragging],
  );

  const handleEnd = useCallback(() => {
    setDragging(false);
    const { x, y } = offset;
    let direction: SwipeDirection | null = null;
    if (Math.abs(y) > SWIPE_STACK_THRESHOLD && Math.abs(y) > Math.abs(x)) {
      direction = y < 0 ? 'up' : 'down';
    } else if (Math.abs(x) > SWIPE_STACK_THRESHOLD) {
      direction = x > 0 ? 'right' : 'left';
    }
    if (direction) fire(direction);
    setOffset({ x: 0, y: 0 });
  }, [offset, fire]);

  const rotation = Math.max(-SWIPE_STACK_MAX_ROTATION, Math.min(SWIPE_STACK_MAX_ROTATION, offset.x * 0.08));
  const dampedY = offset.y * 0.3;
  const dragProgress = Math.min((Math.abs(offset.x) + Math.abs(offset.y)) / SWIPE_STACK_THRESHOLD, 1);
  const stampRightOpacity = Math.min(Math.max(offset.x / SWIPE_STACK_THRESHOLD, 0), 1);
  const stampLeftOpacity = Math.min(Math.max(-offset.x / SWIPE_STACK_THRESHOLD, 0), 1);
  const stampUpOpacity = Math.min(Math.max(-offset.y / SWIPE_STACK_THRESHOLD, 0), 1);
  const nextCardScale = 0.96 + dragProgress * 0.04;

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
  };
}
