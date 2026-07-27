import { Sparkline } from './MacroChart';
import { Card } from './ui/Card';
import type { HabitsWeekResponse } from '../lib/api';
import { HOME_HABIT_SPARKLINES } from '../lib/homeSectionShared';

export interface HomeHabitTrendCardProps {
  habitWeek: HabitsWeekResponse | null;
}

export function HomeHabitTrendCard({ habitWeek }: HomeHabitTrendCardProps) {
  if (!habitWeek || habitWeek.recent_days.length <= 1) return null;

  return (
    <Card className="home-habit-trend-card home-export-card--health">
      <p className="section-eyebrow">Trends</p>
      <h2>7-day habits</h2>
      <p className="muted">Daily hours vs your targets</p>
      <div className="habit-spark-grid">
        {HOME_HABIT_SPARKLINES.map(({ key, label, target, color }) => {
          const series = habitWeek.recent_days.map((d) => d.metrics[key] ?? 0);
          const avg = habitWeek.averages[key];
          return (
            <div key={key} className="habit-spark-row">
              <div className="habit-spark-header">
                <span>{label}</span>
                <span className="muted">
                  avg {avg != null ? `${avg}h` : '—'} / {target}h
                </span>
              </div>
              <Sparkline data={series} color={color} height={36} />
              <div className="sparkline-labels">
                {habitWeek.recent_days.map((d) => (
                  <span key={d.date}>{d.date.slice(5)}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
