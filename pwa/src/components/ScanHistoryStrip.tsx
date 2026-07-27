import type { ScanHistoryEntry } from '../lib/scanHistory';

interface ScanHistoryStripProps {
  items: ScanHistoryEntry[];
  onSelect: (entry: ScanHistoryEntry) => void;
  onClear: () => void;
  variant?: 'default' | 'translate';
}

export function ScanHistoryStrip({ items, onSelect, onClear, variant = 'default' }: ScanHistoryStripProps) {
  if (!items.length) return null;

  const isTranslate = variant === 'translate';

  return (
    <div className={`scan-history ${isTranslate ? 'scan-history--translate' : ''}`}>
      <div className="scan-history-header">
        <span className="scan-history-title">{isTranslate ? 'Recent' : 'Recent scans'}</span>
        <button type="button" className="link-btn scan-history-clear" onClick={onClear}>
          Clear
        </button>
      </div>
      <div className="scan-history-track" role="list" aria-label="Recent food scans">
        {items.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="listitem"
            className={`scan-history-pill ${isTranslate ? 'scan-history-pill--translate' : ''}`}
            onClick={() => onSelect(entry)}
            aria-label={`Reopen scan: ${entry.label}`}
          >
            <img src={entry.imageUrl} alt="" className="scan-history-thumb" />
            {!isTranslate && <span className="scan-history-label">{entry.label}</span>}
            {isTranslate && <span className="scan-history-label scan-history-label--translate">{entry.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
