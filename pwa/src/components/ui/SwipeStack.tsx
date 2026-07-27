import type { CSSProperties } from 'react';
import { useSwipeStack } from '../../hooks/useSwipeStack';
import type { SwipeStackProps } from '../../lib/swipeStackTypes';
import './ui.css';

export type { SwipeDirection } from '../../lib/swipeStackTypes';

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
  const {
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
  } = useSwipeStack({ onSwipe });

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
