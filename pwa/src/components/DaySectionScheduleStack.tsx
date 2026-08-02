import { DayCheckinHandoffBar } from './DayCheckinHandoffBar';
import { DayHabitHoursCard } from './DayHabitHoursCard';
import { DayManageDayCard } from './DayManageDayCard';
import { DayTimelineCard } from './DayTimelineCard';
import type { DaySectionScheduleStackProps } from '../lib/daySectionTypes';

export function DaySectionScheduleStack({
  events,
  habits,
  streaks,
  manageDay,
  habitLog,
  streak,
  metricLabel,
  onAgentSchedulePrompt,
  onNavigateHome,
}: DaySectionScheduleStackProps) {
  return (
    <>
      {events.length > 0 && onAgentSchedulePrompt && onNavigateHome && (
        <DayCheckinHandoffBar
          events={events}
          onAskCoach={onAgentSchedulePrompt}
          onReviewRings={onNavigateHome}
        />
      )}

      <DayTimelineCard events={events} onAgentSchedulePrompt={onAgentSchedulePrompt} />

      <DayHabitHoursCard
        habits={habits}
        streaks={streaks}
        saving={habitLog.saving}
        streakLegendOpen={streak.streakLegendOpen}
        pending={habitLog.pending}
        onToggleLegend={streak.toggleStreakLegend}
        onUpdateMetric={(key, value) => void habitLog.updateMetric(key, value)}
        onRetryPending={habitLog.retry}
        onDismissPending={habitLog.dismiss}
        metricLabel={metricLabel}
      />

      <DayManageDayCard quadrants={manageDay} />
    </>
  );
}
