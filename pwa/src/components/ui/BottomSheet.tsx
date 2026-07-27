import { useEffect, type ReactNode } from 'react';
import './ui.css';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  showTitle?: boolean;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, showTitle = true, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ui-sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="ui-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="ui-sheet__handle" />
        {title && showTitle && <h2 className="ui-sheet__title">{title}</h2>}
        <div className="ui-sheet__body">{children}</div>
      </div>
    </div>
  );
}
