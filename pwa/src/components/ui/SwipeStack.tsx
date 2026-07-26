import { useCallback, useRef, useState, type ReactNode } from 'react';
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

  const rotation = offset.x * 0.05;
  const opacity = 1 - Math.min(Math.abs(offset.x) + Math.abs(offset.y), 200) / 400;

  return (
    <div className={`ui-swipe-stack ${className}`.trim()}>
      <div className="ui-swipe-hints" aria-hidden="true">
        <span className="ui-swipe-hint ui-swipe-hint--left">{hintLeft}</span>
        <span className="ui-swipe-hint ui-swipe-hint--up">{hintUp}</span>
        <span className="ui-swipe-hint ui-swipe-hint--right">{hintRight}</span>
      </div>
      <div
        className={`ui-swipe-card ${dragging ? 'ui-swipe-card--dragging' : ''}`}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
          opacity,
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
      {showKeyboardActions && onSwipe && (
        <div className="ui-swipe-actions" role="group" aria-label={`${label} actions`}>
          <button type="button" className="btn-secondary btn-small" onClick={() => fire('left')}>
            {hintLeft}
          </button>
          <button type="button" className="btn-secondary btn-small" onClick={() => fire('up')}>
            {hintUp}
          </button>
          <button type="button" className="btn-secondary btn-small" onClick={() => fire('right')}>
            {hintRight}
          </button>
        </div>
      )}
    </div>
  );
}
