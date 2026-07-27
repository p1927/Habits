import { Card } from './ui/Card';
import { DayHabitFailedSyncList } from './DayHabitFailedSyncList';
import { DayHabitMetricGrid, DayOverallStreakBanner } from './DayHabitMetricGrid';
import { DayStreakTierLegend } from './DayStreakTierLegend';
import type { DayHabitHoursCardProps } from '../lib/dayHabitHoursCardTypes';

export type { DayHabitHoursCardProps } from '../lib/dayHabitHoursCardTypes';

export function DayHabitHoursCard({
  habits,
  streaks,
  saving,
  streakLegendOpen,
  pending,
  onToggleLegend,
  onUpdateMetric,
  onRetryPending,
  onDismissPending,
  metricLabel,
}: DayHabitHoursCardProps) {
  const failed = pending.filter((e) => e.status === 'failed');

  return (
    <Card className="day-habit-hours-card home-export-card--health">
      <div className="habit-hours-header">
        <div>
          <p className="section-eyebrow">Targets</p>
          <h2>Habit hours</h2>
        </div>
        <DayStreakTierLegend open={streakLegendOpen} onToggle={onToggleLegend} />
      </div>
      <DayOverallStreakBanner streaks={streaks} />
      <DayHabitMetricGrid habits={habits} streaks={streaks} saving={saving} onUpdateMetric={onUpdateMetric} />
      <DayHabitFailedSyncList
        failed={failed}
        metricLabel={metricLabel}
        onRetryPending={onRetryPending}
        onDismissPending={onDismissPending}
      />
    </Card>
  );
}
