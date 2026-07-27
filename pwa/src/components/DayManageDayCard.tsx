import { Card } from './ui/Card';

export interface DayManageDayCardProps {
  quadrants: Record<string, string[]>;
}

export function DayManageDayCard({ quadrants }: DayManageDayCardProps) {
  if (Object.keys(quadrants).length === 0) return null;

  return (
    <Card>
      <h2>Manage day</h2>
      {Object.entries(quadrants).map(([quad, items]) =>
        items.length > 0 ? (
          <div key={quad} className="manage-quad">
            <h3>{quad.replace('_', ' ')}</h3>
            <ul>
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null,
      )}
    </Card>
  );
}
