import { useEffect } from 'react';

interface StreakMilestoneToastProps {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}

export function StreakMilestoneToast({ message, onDismiss, durationMs = 6000 }: StreakMilestoneToastProps) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(id);
  }, [onDismiss, durationMs, message]);

  return (
    <div className="undo-toast streak-milestone-toast" role="status" aria-live="polite">
      <span className="streak-milestone-toast__icon" aria-hidden="true">
        🔥
      </span>
      <span className="undo-toast__message">{message}</span>
      <button type="button" className="undo-toast__close" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
