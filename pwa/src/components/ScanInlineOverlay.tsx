import type { ReactNode } from 'react';
import type { FoodScanResult } from '../lib/api';
import { SwipeFoodCard } from './SwipeFoodCard';
import type { SwipeDirection } from './ui/SwipeStack';

interface ScanInlineOverlayProps {
  imageUrl: string;
  loading?: boolean;
  scan?: FoodScanResult | null;
  onAction?: (dir: SwipeDirection) => void;
  onEdit?: () => void;
  onRetake: () => void;
  footer?: ReactNode;
}

export function ScanInlineOverlay({
  imageUrl,
  loading = false,
  scan,
  onAction,
  onEdit,
  onRetake,
  footer,
}: ScanInlineOverlayProps) {
  return (
    <div className="scan-inline-overlay">
      <div className="scan-inline-mode-pill" aria-hidden="true">
        <span className="scan-inline-mode-dot" />
        Food scan
      </div>
      <img src={imageUrl} alt="Captured food" className="scan-inline-photo" />
      <div className="scan-inline-shade" aria-hidden="true" />

      {loading && (
        <div className="scan-inline-status" role="status" aria-live="polite">
          <span className="scan-inline-pulse" aria-hidden="true" />
          Identifying food…
        </div>
      )}

      {!loading && scan && onAction && onEdit && (
        <div className="scan-inline-result">
          <SwipeFoodCard scan={scan} overlay onAction={onAction} onEdit={onEdit} />
        </div>
      )}

      <div className="scan-inline-actions">
        <button
          type="button"
          className="btn-small scan-inline-retake"
          aria-label="Retake food photo"
          onClick={onRetake}
        >
          Retake
        </button>
        {footer}
      </div>
    </div>
  );
}
