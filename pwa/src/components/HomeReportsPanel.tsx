import { Card } from './ui/Card';

interface HomeReportsPanelProps {
  serverOnline: boolean;
  exporting: boolean;
  onExport: () => void;
}

export function HomeReportsPanel({ serverOnline, exporting, onExport }: HomeReportsPanelProps) {
  return (
    <Card className="home-export-card home-export-card--health">
      <p className="section-eyebrow">Reports</p>
      <div className="home-export-row">
        <div>
          <h2>Weekly report</h2>
          <p className="muted">Download nutrition and habit summary as PDF</p>
        </div>
        <button
          type="button"
          className="btn-small"
          disabled={!serverOnline || exporting}
          onClick={onExport}
        >
          {exporting ? 'Exporting…' : 'Export PDF'}
        </button>
      </div>
    </Card>
  );
}
