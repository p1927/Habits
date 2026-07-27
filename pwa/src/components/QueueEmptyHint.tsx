import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export interface QueueEmptyHintProps {
  children: ReactNode;
  announce?: boolean;
  className?: string;
}

export function QueueEmptyHint({ children, announce = false, className }: QueueEmptyHintProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnnounce = announce && !prefersReducedMotion;

  return (
    <p
      className={className ? `queue-empty ${className}` : 'queue-empty'}
      role={shouldAnnounce ? 'status' : undefined}
      aria-live={shouldAnnounce ? 'polite' : undefined}
      aria-atomic={shouldAnnounce ? 'true' : undefined}
    >
      <span className="queue-empty__icon" aria-hidden="true">✓</span>
      {children}
    </p>
  );
}
