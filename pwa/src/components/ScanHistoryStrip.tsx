import type { ScanHistoryEntry } from '../lib/scanHistory';

interface ScanHistoryStripProps {
  items: ScanHistoryEntry[];
  onSelect: (entry: ScanHistoryEntry) => void;
  onClear: () => void;
}

export function ScanHistoryStrip({ items, onSelect, onClear }: ScanHistoryStripProps) {
  if (!items.length) return null;

  return (
    <div className="scan-history">
      <div className="scan-history-header">
        <span className="scan-history-title">Recent scans</span>
        <button type="button" className="link-btn scan-history-clear" onClick={onClear}>
          Clear all
        </button>
      </div>
      <div className="scan-history-track" role="list" aria-label="Recent food scans">
        {items.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="listitem"
            className="scan-history-pill"
            onClick={() => onSelect(entry)}
            aria-label={`Reopen scan: ${entry.label}`}
          >
            <img src={entry.imageUrl} alt="" className="scan-history-thumb" />
            <span className="scan-history-label">{entry.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
