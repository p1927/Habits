interface DaySectionHeaderProps {
  serverOnline: boolean;
  exporting: boolean;
  onExportWeekPdf: () => void;
}

export function DaySectionHeader({ serverOnline, exporting, onExportWeekPdf }: DaySectionHeaderProps) {
  return (
    <div className="day-header-row">
      <div>
        <p className="section-eyebrow">Calendar</p>
        <h1 id="day-heading">Your Day</h1>
        <p className="muted">Schedule + habit tracker</p>
      </div>
      <button
        type="button"
        className="btn-pill btn-pill-outline day-export-btn"
        disabled={!serverOnline || exporting}
        aria-label="Export weekly report PDF"
        onClick={onExportWeekPdf}
      >
        {exporting ? 'Exporting…' : 'Week PDF'}
      </button>
    </div>
  );
}

export function DaySectionOfflineBanner() {
  return (
    <div className="banner banner-warn banner-revolut" role="alert">
      Server offline — habit edits save locally.
    </div>
  );
}
