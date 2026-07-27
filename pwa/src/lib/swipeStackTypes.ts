import type { ReactNode } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeStackProps {
  children: ReactNode;
  onSwipe?: (direction: SwipeDirection) => void;
  className?: string;
  hintLeft?: string;
  hintRight?: string;
  hintUp?: string;
  label?: string;
  showKeyboardActions?: boolean;
}
