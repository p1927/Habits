import type { ReactNode } from 'react';
import './ui.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'keep-yellow' | 'keep-blue' | 'keep-green' | 'keep-pink' | 'keep-purple';
}

export function Card({ children, className = '', onClick, variant = 'default' }: CardProps) {
  return (
    <div
      className={`ui-card ui-card--${variant} ${className}`.trim()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
}
