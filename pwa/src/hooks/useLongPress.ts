import { useCallback, useEffect, useRef } from 'react';

interface UseLongPressOptions {
  /** Long-press duration in ms before onLongPress fires. */
  threshold?: number;
  /** Max pointer movement (px) before the gesture is cancelled as a drag/scroll. */
  movementThreshold?: number;
  /** Pointer event types to track. Defaults to mouse + touch. */
  pointerTypes?: ('mouse' | 'touch' | 'pen')[];
}

interface LongPressHandlers {
  onLongPress: (event: PointerEvent) => void;
  onCancel?: () => void;
}

/**
 * Detect a "long press" gesture without firing on scroll/drag.
 *
 * - Tracks pointerdown -> setTimeout(threshold); if pointerup/pointercancel
 *   or > movementThreshold px movement happens first, cancel.
 * - Touch-action: manipulation is recommended on the bound element so the
 *   browser does not steal the gesture for scroll/zoom.
 * - Honors prefers-reduced-motion via the caller's CSS (this hook fires
 *   immediately on threshold; motion is not part of detection).
 */
export function useLongPress(
  handlers: LongPressHandlers,
  { threshold = 600, movementThreshold = 10, pointerTypes }: UseLongPressOptions = {},
) {
  const { onLongPress, onCancel } = handlers;
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const targetRef = useRef<Element | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startRef.current = null;
    targetRef.current = null;
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<Element>) => {
      if (pointerTypes && !pointerTypes.includes(event.pointerType as 'mouse' | 'touch' | 'pen')) {
        return;
      }
      // Ignore non-primary buttons.
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      startRef.current = { x: event.clientX, y: event.clientY };
      targetRef.current = event.currentTarget;
      const startX = event.clientX;
      const startY = event.clientY;
      timerRef.current = window.setTimeout(() => {
        // Fire only if the gesture has not been cancelled.
        if (startRef.current !== null) {
          // Native PointerEvent is expected by the handler signature.
          // eslint-disable-next-line no-undef
          onLongPress(event.nativeEvent);
        }
        clear();
      }, threshold);
      // Stash coordinates on the element for the move handler to read.
      (event.currentTarget as Element & { __lp?: { x: number; y: number } }).__lp = {
        x: startX,
        y: startY,
      };
    },
    [onLongPress, threshold, pointerTypes, clear],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<Element>) => {
      if (!startRef.current || !timerRef.current) return;
      const dx = event.clientX - startRef.current.x;
      const dy = event.clientY - startRef.current.y;
      if (Math.hypot(dx, dy) > movementThreshold) {
        if (onCancel) onCancel();
        clear();
      }
    },
    [movementThreshold, onCancel, clear],
  );

  const onPointerEnd = useCallback(() => {
    if (!timerRef.current) return;
    if (onCancel) onCancel();
    clear();
  }, [onCancel, clear]);

  useEffect(() => {
    return () => clear();
  }, [clear]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
  };
}