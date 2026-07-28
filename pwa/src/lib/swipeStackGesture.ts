import {
  SWIPE_STACK_THRESHOLD,
  SWIPE_VELOCITY_COMMIT,
} from './swipeStackConstants';
import type { SwipeDirection } from './swipeStackTypes';

export const SWIPE_EXIT_MS = 250;

export const SWIPE_EXIT_TRANSFORMS: Record<SwipeDirection, string> = {
  right: 'translate(120%, -8%) rotate(18deg)',
  left: 'translate(-120%, -8%) rotate(-18deg)',
  up: 'translate(0, -115%) rotate(-6deg)',
  down: 'translate(0, 115%) rotate(6deg)',
};

export function vibrateForSwipe(direction: SwipeDirection) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  navigator.vibrate(direction === 'right' ? 12 : direction === 'left' ? [8, 40, 8] : 6);
}

export function resolveSwipeDirection(
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
