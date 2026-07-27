import { Card } from './ui/Card';

export interface LogHistoryPanelProps {
  days: { date: string; calories: number; protein: number }[];
}

export function LogHistoryPanel({ days }: LogHistoryPanelProps) {
  return (
    <Card>
      <h2>14-day history</h2>
      {!days.length ? (
        <p className="muted">No history in Followed tab.</p>
      ) : (
        <ul className="food-list">
          {[...days].reverse().map((d) => (
            <li key={d.date} className="food-row">
              <strong>{d.date}</strong>
              <span className="muted">
                {d.calories.toFixed(0)} kcal · {d.protein.toFixed(1)}g protein
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
