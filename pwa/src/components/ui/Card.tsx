import type { ReactNode } from 'react';
import './ui.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'keep-yellow' | 'keep-blue' | 'keep-green' | 'keep-pink' | 'keep-purple';
  ariaLabel?: string;
  // relay-227: when the Card acts as a toggle/disclosure button, surface its
  // expanded state and which region it controls. Only meaningful alongside
  // onClick; both attributes are forwarded only when the card is interactive.
  ariaExpanded?: boolean;
  ariaControls?: string;
}

export function Card({
  children,
  className = '',
  onClick,
  variant = 'default',
  ariaLabel,
  ariaExpanded,
  ariaControls,
}: CardProps) {
  const interactive = onClick != null;
  return (
    <div
      className={`ui-card ui-card--${variant} ${className}`.trim()}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? ariaLabel : undefined}
      aria-expanded={interactive ? ariaExpanded : undefined}
      aria-controls={interactive ? ariaControls : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
