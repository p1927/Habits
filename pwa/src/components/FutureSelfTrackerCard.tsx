import type { HabitsTodayResponse } from '../lib/api';
import { FUTURE_SELF_METRICS } from '../lib/futureSelfSectionShared';

interface FutureSelfTrackerCardProps {
  tracker: HabitsTodayResponse;
  onUpdateMetric: (metric: string, value: string) => void;
}

export function FutureSelfTrackerCard({ tracker, onUpdateMetric }: FutureSelfTrackerCardProps) {
  return (
    <div className="card">
      <h2>Today&apos;s tracker</h2>
      <p className="muted">{tracker.weekday} · {tracker.date}</p>
      <div className="tracker-grid">
        {FUTURE_SELF_METRICS.map((m) => (
          <label key={m} className="field tracker-field">
            {m}
            <input
              type="number"
              step="0.5"
              value={tracker.metrics[m] ?? ''}
              onChange={(e) => onUpdateMetric(m, e.target.value)}
              placeholder="h"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
