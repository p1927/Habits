import { useEffect } from 'react';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  durationMs?: number;
  undoing?: boolean;
}

export function UndoToast({ message, onUndo, onDismiss, durationMs = 5000, undoing = false }: UndoToastProps) {
  useEffect(() => {
    if (undoing) return;
    const id = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(id);
  }, [onDismiss, durationMs, message, undoing]);

  return (
    <div className="undo-toast" role="status" aria-live="polite">
      <span className="undo-toast__message">{message}</span>
      <button type="button" className="undo-toast__action" onClick={onUndo} disabled={undoing}>
        {undoing ? 'Undoing…' : 'Undo'}
      </button>
      <button type="button" className="undo-toast__close" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
