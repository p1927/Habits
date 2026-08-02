import { DaySectionAlerts } from '../components/DaySectionAlerts';
import { DaySectionHeader, DaySectionOfflineBanner } from '../components/DaySectionHeader';
import { DaySectionMealPlanStack } from '../components/DaySectionMealPlanStack';
import { DaySectionScheduleStack } from '../components/DaySectionScheduleStack';
import { DayWeekStrip } from '../components/DayWeekStrip';
import { useDaySection } from '../hooks/useDaySection';
import type { DaySectionProps } from '../lib/daySectionTypes';

export function Day({ serverOnline, onNavigateMealPlanSyncSource, scrollToMealPlanQueue, onAgentSchedulePrompt, onNavigateHome }: DaySectionProps) {
  const section = useDaySection({ serverOnline });

  return (
    <section className="section day-section" aria-labelledby="day-heading">
      <DaySectionHeader
        serverOnline={serverOnline}
        exporting={section.exportingWeekPdf}
        onExportWeekPdf={() => void section.handleExportWeekPdf()}
      />
      <DayWeekStrip />

      {!serverOnline && <DaySectionOfflineBanner />}

      <DaySectionMealPlanStack
        serverOnline={serverOnline}
        onNavigateMealPlanSyncSource={onNavigateMealPlanSyncSource}
        scrollToMealPlanQueue={scrollToMealPlanQueue}
        mealPlan={section.mealPlan}
        habitLog={section.habitLog}
        mealPlanShell={section.mealPlanShell}
        metricLabel={section.metricLabel}
        onDismissHabitQueue={section.dismissHabitQueue}
      />

      <DaySectionScheduleStack
        events={section.events}
        habits={section.habits}
        streaks={section.streaks}
        manageDay={section.manageDay}
        habitLog={section.habitLog}
        streak={section.streak}
        metricLabel={section.metricLabel}
        onAgentSchedulePrompt={onAgentSchedulePrompt}
        onNavigateHome={onNavigateHome}
      />

      <DaySectionAlerts
        mealSuccess={section.mealSuccess}
        habitSyncMessage={section.habitSyncMessage}
        error={section.error}
        streak={section.streak}
        mealPlanUndo={section.mealPlanShell.mealPlanUndo}
        mealPlanUndoing={section.mealPlanShell.mealPlanUndoing}
        onMealPlanUndo={() =>
          void section.mealPlanShell.handleMealPlanUndo(section.handleMealPlanUndoSuccess)
        }
        onDismissMealPlanUndo={section.mealPlanShell.dismissMealPlanUndo}
      />
    </section>
  );
}
