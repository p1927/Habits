import { CameraCapture } from './CameraCapture';
import { ScanInlineOverlay } from './ScanInlineOverlay';
import { ScanHistoryStrip } from './ScanHistoryStrip';
import { SwipeFoodCard } from './SwipeFoodCard';
import type { FoodScanResult } from '../lib/api';
import type { ScanHistoryEntry } from '../lib/scanHistory';
import type { SwipeDirection } from './ui/SwipeStack';

export interface LogScanTabPanelProps {
  serverOnline: boolean;
  loading: boolean;
  scanPreviewUrl: string | null;
  scanResult: FoodScanResult | null;
  scanHistory: ScanHistoryEntry[];
  editName: string;
  editQty: string;
  onCapture: (url: string) => void;
  onClearScan: () => void;
  onRestoreScan: (entry: ScanHistoryEntry) => void;
  onClearScanHistory: () => void;
  onEditOpen: () => void;
  onLogScan: (name: string, qty: number) => void;
}

export function LogScanTabPanel({
  serverOnline,
  loading,
  scanPreviewUrl,
  scanResult,
  scanHistory,
  editName,
  editQty,
  onCapture,
  onClearScan,
  onRestoreScan,
  onClearScanHistory,
  onEditOpen,
  onLogScan,
}: LogScanTabPanelProps) {
  const handleSwipe = (dir: SwipeDirection) => {
    if (dir === 'right' && scanResult) {
      onLogScan(editName, Number.parseFloat(editQty) || scanResult.suggested_grams);
    } else if (dir === 'up') {
      onClearScan();
    }
  };

  if (scanPreviewUrl) {
    return (
      <ScanInlineOverlay
        imageUrl={scanPreviewUrl}
        loading={loading}
        scan={scanResult}
        onRetake={onClearScan}
        onEdit={onEditOpen}
        onAction={handleSwipe}
      />
    );
  }

  if (scanResult) {
    return (
      <SwipeFoodCard
        scan={scanResult}
        imageUrl={scanPreviewUrl}
        onAction={handleSwipe}
        onEdit={onEditOpen}
      />
    );
  }

  return (
    <div className="log-scan-panel">
      <div className="log-scan-panel__header">
        <span className="log-scan-mode-pill">
          <span className="scan-inline-mode-dot" aria-hidden="true" />
          Food scan
        </span>
      </div>
      <p className="log-scan-panel__hint">Point at your food — like Google Translate</p>
      <CameraCapture
        facingMode="environment"
        placeholder="Point at your food"
        onCapture={onCapture}
        disabled={!serverOnline || loading}
      />
      <ScanHistoryStrip
        items={scanHistory}
        variant="translate"
        onSelect={onRestoreScan}
        onClear={onClearScanHistory}
      />
    </div>
  );
}
