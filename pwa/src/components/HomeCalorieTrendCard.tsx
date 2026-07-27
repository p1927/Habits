import { Sparkline } from './MacroChart';
import { Card } from './ui/Card';
import type { FoodHistoryDay } from '../lib/api';

export interface HomeCalorieTrendCardProps {
  days: FoodHistoryDay[];
}

export function HomeCalorieTrendCard({ days }: HomeCalorieTrendCardProps) {
  if (days.length <= 1) return null;

  return (
    <Card className="home-calorie-trend-card home-export-card--health">
      <p className="section-eyebrow">Trends</p>
      <h2>7-day calories</h2>
      <Sparkline data={days.map((d) => d.calories)} color="var(--ring-calories)" />
      <div className="sparkline-labels">
        {days.map((d) => (
          <span key={d.date}>{d.date.slice(5)}</span>
        ))}
      </div>
    </Card>
  );
}
