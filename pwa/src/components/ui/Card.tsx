import type { ReactNode } from 'react';
import './ui.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'keep-yellow' | 'keep-blue' | 'keep-green' | 'keep-pink' | 'keep-purple';
  ariaLabel?: string;
}

export function Card({ children, className = '', onClick, variant = 'default', ariaLabel }: CardProps) {
  return (
    <div
      className={`ui-card ui-card--${variant} ${className}`.trim()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? ariaLabel : undefined}
      onKeyDown={
        onClick
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
