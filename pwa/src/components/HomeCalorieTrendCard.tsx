import { Sparkline } from './MacroChart';
import { Card } from './ui/Card';
import type { FoodHistoryDay } from '../lib/api';

export interface HomeCalorieTrendCardProps {
  days: FoodHistoryDay[];
  onOpenHistory?: () => void;
}

export function HomeCalorieTrendCard({ days, onOpenHistory }: HomeCalorieTrendCardProps) {
  if (days.length <= 1) return null;

  const content = (
    <>
      <p className="section-eyebrow">Trends</p>
      <h2>7-day calories</h2>
      <Sparkline data={days.map((d) => d.calories)} color="var(--ring-calories)" />
      <div className="sparkline-labels">
        {days.map((d) => (
          <span key={d.date}>{d.date.slice(5)}</span>
        ))}
      </div>
    </>
  );

  if (!onOpenHistory) {
    return (
      <Card className="home-calorie-trend-card home-export-card--health">
        {content}
      </Card>
    );
  }

  return (
    <button
      type="button"
      className="home-trend-card-btn"
      onClick={onOpenHistory}
      aria-label="Open food history in Log tab"
    >
      <Card className="home-calorie-trend-card home-export-card--health">
        {content}
        <span className="home-trend-card-hint muted">Tap for full history</span>
      </Card>
    </button>
  );
}
