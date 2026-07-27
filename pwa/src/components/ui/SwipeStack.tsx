import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import './ui.css';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface SwipeStackProps {
  children: ReactNode;
  onSwipe?: (direction: SwipeDirection) => void;
  className?: string;
  hintLeft?: string;
  hintRight?: string;
  hintUp?: string;
  label?: string;
  showKeyboardActions?: boolean;
}

const THRESHOLD = 80;
const MAX_ROTATION = 12;

export function SwipeStack({
  children,
  onSwipe,
  className = '',
  hintLeft = 'Edit',
  hintRight = 'Log',
  hintUp = 'Skip',
  label = 'Swipe card',
  showKeyboardActions = true,
}: SwipeStackProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const start = useRef({ x: 0, y: 0 });

  const fire = useCallback(
    (direction: SwipeDirection) => {
      if (typeof navigator !== 'undefined' && navigator.vibrate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        navigator.vibrate(direction === 'right' ? 12 : direction === 'left' ? [8, 40, 8] : 6);
      }
      onSwipe?.(direction);
    },
    [onSwipe],
  );

  const handleStart = useCallback((clientX: number, clientY: number) => {
    start.current = { x: clientX, y: clientY };
    setDragging(true);
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!dragging) return;
    setOffset({ x: clientX - start.current.x, y: clientY - start.current.y });
  }, [dragging]);

  const handleEnd = useCallback(() => {
    setDragging(false);
    const { x, y } = offset;
    let direction: SwipeDirection | null = null;
    if (Math.abs(y) > THRESHOLD && Math.abs(y) > Math.abs(x)) {
      direction = y < 0 ? 'up' : 'down';
    } else if (Math.abs(x) > THRESHOLD) {
      direction = x > 0 ? 'right' : 'left';
    }
    if (direction) fire(direction);
    setOffset({ x: 0, y: 0 });
  }, [offset, fire]);

  const rotation = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, offset.x * 0.08));
  const dampedY = offset.y * 0.3;
  const dragProgress = Math.min((Math.abs(offset.x) + Math.abs(offset.y)) / THRESHOLD, 1);
  const stampRightOpacity = Math.min(Math.max(offset.x / THRESHOLD, 0), 1);
  const stampLeftOpacity = Math.min(Math.max(-offset.x / THRESHOLD, 0), 1);
  const stampUpOpacity = Math.min(Math.max(-offset.y / THRESHOLD, 0), 1);
  const nextCardScale = 0.96 + dragProgress * 0.04;

  return (
    <div className={`ui-swipe-stack ${className}`.trim()} style={{ '--swipe-next-scale': nextCardScale } as CSSProperties}>
      <div className="ui-swipe-hints" aria-hidden="true">
        <span className="ui-swipe-hint ui-swipe-hint--left">{hintLeft}</span>
        <span className="ui-swipe-hint ui-swipe-hint--up">{hintUp}</span>
        <span className="ui-swipe-hint ui-swipe-hint--right">{hintRight}</span>
      </div>
      <div className="ui-swipe-card-wrap">
        <span
          className="ui-swipe-stamp ui-swipe-stamp--right"
          style={{ opacity: stampRightOpacity }}
          aria-hidden="true"
        >
          {hintRight}
        </span>
        <span
          className="ui-swipe-stamp ui-swipe-stamp--left"
          style={{ opacity: stampLeftOpacity }}
          aria-hidden="true"
        >
          {hintLeft}
        </span>
        <span
          className="ui-swipe-stamp ui-swipe-stamp--up"
          style={{ opacity: stampUpOpacity }}
          aria-hidden="true"
        >
          {hintUp}
        </span>
        <div
          className={`ui-swipe-card ${dragging ? 'ui-swipe-card--dragging' : ''}`}
          style={{
            transform: `translate(${offset.x}px, ${dampedY}px) rotate(${rotation}deg)`,
          }}
          role="group"
          aria-label={label}
          onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={handleEnd}
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onMouseMove={(e) => dragging && handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={() => dragging && handleEnd()}
        >
          {children}
        </div>
      </div>
      {showKeyboardActions && onSwipe && (
        <div className="ui-swipe-actions ui-swipe-actions--tinder" role="group" aria-label={`${label} actions`}>
          <button
            type="button"
            className="ui-swipe-circle ui-swipe-circle--left"
            aria-label={hintLeft}
            onClick={() => fire('left')}
          >
            <span aria-hidden="true">✎</span>
          </button>
          <button
            type="button"
            className="ui-swipe-circle ui-swipe-circle--up"
            aria-label={hintUp}
            onClick={() => fire('up')}
          >
            <span aria-hidden="true">↑</span>
          </button>
          <button
            type="button"
            className="ui-swipe-circle ui-swipe-circle--right"
            aria-label={hintRight}
            onClick={() => fire('right')}
          >
            <span aria-hidden="true">✓</span>
          </button>
        </div>
      )}
    </div>
  );
}
