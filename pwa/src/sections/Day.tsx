import { useState } from 'react';
import { MealPlanQueueSection } from '../components/MealPlanQueueSection';
import { MealPlanSyncAwarenessSlot } from '../components/MealPlanSyncAwarenessSlot';
import { MealPlanTodayCard } from '../components/MealPlanTodayCard';
import { DayWeekStrip } from '../components/DayWeekStrip';
import { DayTimelineCard } from '../components/DayTimelineCard';
import { DayHabitHoursCard } from '../components/DayHabitHoursCard';
import { DayManageDayCard } from '../components/DayManageDayCard';
import { StreakMilestoneToast } from '../components/StreakMilestoneToast';
import { UndoToast } from '../components/UndoToast';
import { HabitQueueSection } from '../components/HabitQueueSection';
import { useDaySectionData } from '../hooks/useDaySectionData';
import { useMealPlanShell } from '../hooks/useMealPlanShell';
import { useDayStreakHaptics } from '../hooks/useDayStreakHaptics';
import { useOptimisticHabitLog } from '../hooks/useOptimisticHabitLog';
import { dayMetricLabel } from '../lib/daySectionShared';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

interface DayProps {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
  scrollToMealPlanQueue?: number;
}

export function Day({ serverOnline, onNavigateMealPlanSyncSource, scrollToMealPlanQueue }: DayProps) {
  const [mealSuccess, setMealSuccess] = useState('');
  const [habitSyncMessage, setHabitSyncMessage] = useState('');

  const {
    habits,
    setHabits,
    events,
    manageDay,
    mealPlan,
    streaks,
    error,
    setError,
  } = useDaySectionData(serverOnline);

  const { streakLegendOpen, toggleStreakLegend, milestoneToast, dismissMilestoneToast } = useDayStreakHaptics(streaks);

  const { saving, updateMetric, queuedCount, failedCount, pending, retry, retryAllFailed, dismiss, dismissAllQueued, queueSyncClearedToken } = useOptimisticHabitLog({
    serverOnline,
    habits,
    setHabits,
    setError,
    setSyncMessage: setHabitSyncMessage,
  });

  const {
    mealPlanUndo,
    mealPlanUndoing,
    dismissMealPlanUndo,
    handleMealPlanUndo,
    mealPlanQueue,
    syncingMealPlanQueue,
    mealPlanSyncProgress,
    failedMealPlanIds,
    retryingMealPlanId,
    flushMealPlanQueue,
    retryFailedMealPlanQueue,
    retryMealPlanItem,
    dismissMealPlanItem,
    loggingMealKey,
    loggingMeals,
    logMealPlanEntry,
    logAllMealPlan,
    clearMealPlanQueue,
  } = useMealPlanShell({
    serverOnline,
    syncSource: 'day',
    setMessage: setMealSuccess,
    setError,
  });

  return (
    <section className="section day-section" aria-labelledby="day-heading">
      <p className="section-eyebrow">Calendar</p>
      <h1 id="day-heading">Your Day</h1>
      <p className="muted">Schedule + habit tracker</p>

      <DayWeekStrip />

      {!serverOnline && <div className="banner banner-warn banner-revolut" role="alert">Server offline — habit edits save locally.</div>}

      <HabitQueueSection
        queuedCount={queuedCount}
        failedCount={failedCount}
        pending={pending}
        queueSyncClearedToken={queueSyncClearedToken}
        metricLabel={dayMetricLabel}
        onDismissAll={() => {
          dismissAllQueued();
          setHabitSyncMessage('Offline habit update queue cleared');
        }}
        onRetryAll={() => retryAllFailed()}
        onRetry={retry}
        onDismiss={dismiss}
      />

      <MealPlanSyncAwarenessSlot
        viewer="day"
        onNavigate={onNavigateMealPlanSyncSource}
        localSyncing={syncingMealPlanQueue}
      />

      <MealPlanQueueSection
        hasMealPlan={mealPlan.length > 0}
        serverOnline={serverOnline}
        queue={mealPlanQueue}
        syncing={syncingMealPlanQueue}
        syncProgress={mealPlanSyncProgress}
        failedIds={failedMealPlanIds}
        retryingId={retryingMealPlanId}
        scrollToQueueToken={scrollToMealPlanQueue}
        syncAllLabel="Sync all"
        syncActionHint="Sync all"
        onSyncAll={() => void flushMealPlanQueue()}
        onRetryFailed={() => void retryFailedMealPlanQueue()}
        onRetry={(item) => void retryMealPlanItem(item)}
        onDismissItem={dismissMealPlanItem}
        onClearAll={clearMealPlanQueue}
      />

      <MealPlanTodayCard
        mealPlan={mealPlan}
        loggingMealKey={loggingMealKey}
        loggingMeals={loggingMeals}
        onLogEntry={logMealPlanEntry}
        onLogAll={logAllMealPlan}
      />

      <DayTimelineCard events={events} />

      <DayHabitHoursCard
        habits={habits}
        streaks={streaks}
        saving={saving}
        streakLegendOpen={streakLegendOpen}
        pending={pending}
        onToggleLegend={toggleStreakLegend}
        onUpdateMetric={(key, value) => void updateMetric(key, value)}
        onRetryPending={retry}
        onDismissPending={dismiss}
        metricLabel={dayMetricLabel}
      />

      <DayManageDayCard quadrants={manageDay} />

      <div role="status" aria-live="polite">
        {mealSuccess && !mealPlanUndo && <div className="banner banner-ok banner-revolut">{mealSuccess}</div>}
        {habitSyncMessage && <div className="banner banner-ok banner-revolut">{habitSyncMessage}</div>}
      </div>
      {error && <div className="banner banner-warn banner-revolut" role="alert">{error}</div>}
      {milestoneToast && (
        <StreakMilestoneToast message={milestoneToast} onDismiss={dismissMilestoneToast} />
      )}
      {mealPlanUndo && (
        <UndoToast
          message={`Logged ${mealPlanUndo.label}`}
          onUndo={() => void handleMealPlanUndo(() => setMealSuccess('Log undone'))}
          onDismiss={dismissMealPlanUndo}
          undoing={mealPlanUndoing}
        />
      )}
    </section>
  );
}
