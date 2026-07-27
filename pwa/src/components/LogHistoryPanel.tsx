import { Sparkline } from './MacroChart';
import { Card } from './ui/Card';
import { downloadLogHistoryCsv } from '../lib/logHistoryExport';

export interface LogHistoryPanelProps {
  days: { date: string; calories: number; protein: number; meal_count?: number }[];
}

export function LogHistoryPanel({ days }: LogHistoryPanelProps) {
  const chronological = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const showTrend = chronological.length >= 2;

  return (
    <Card className="log-history-card home-export-card--health">
      <div className="log-history-header">
        <div>
          <p className="section-eyebrow">History</p>
          <h2>14-day history</h2>
        </div>
        {days.length > 0 && (
          <button
            type="button"
            className="btn-pill btn-pill-outline log-history-export-btn"
            aria-label="Export food history as CSV"
            onClick={() => downloadLogHistoryCsv(days)}
          >
            Export CSV
          </button>
        )}
      </div>
      {!days.length ? (
        <p className="muted">No history in Followed tab. Export CSV unlocks once you have logged days.</p>
      ) : (
        <>
          {showTrend && (
            <div className="log-history-trends">
              <div className="log-history-trend">
                <h3 className="log-history-trend__label">Calories</h3>
                <Sparkline data={chronological.map((d) => d.calories)} color="var(--ring-calories)" />
                <div className="sparkline-labels">
                  {chronological.map((d) => (
                    <span key={`cal-${d.date}`}>{d.date.slice(5)}</span>
                  ))}
                </div>
              </div>
              <div className="log-history-trend">
                <h3 className="log-history-trend__label">Protein</h3>
                <Sparkline data={chronological.map((d) => d.protein)} color="var(--ring-protein)" />
              </div>
            </div>
          )}
          <ul className="food-list log-history-list">
            {[...days].reverse().map((d) => (
              <li key={d.date} className="food-row">
                <strong>{d.date}</strong>
                <span className="log-history-stats muted">
                  {d.calories.toFixed(0)} kcal · {d.protein.toFixed(1)}g protein
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
