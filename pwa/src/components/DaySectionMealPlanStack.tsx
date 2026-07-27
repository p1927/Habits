import { HabitQueueSection } from './HabitQueueSection';
import { MealPlanQueueSection } from './MealPlanQueueSection';
import { MealPlanSyncAwarenessSlot } from './MealPlanSyncAwarenessSlot';
import { MealPlanTodayCard } from './MealPlanTodayCard';
import type { DaySectionMealPlanStackProps } from '../lib/daySectionTypes';

export function DaySectionMealPlanStack({
  serverOnline,
  onNavigateMealPlanSyncSource,
  scrollToMealPlanQueue,
  mealPlan,
  habitLog,
  mealPlanShell,
  metricLabel,
  onDismissHabitQueue,
}: DaySectionMealPlanStackProps) {
  const {
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
  } = mealPlanShell;

  return (
    <>
      <HabitQueueSection
        queuedCount={habitLog.queuedCount}
        failedCount={habitLog.failedCount}
        pending={habitLog.pending}
        queueSyncClearedToken={habitLog.queueSyncClearedToken}
        metricLabel={metricLabel}
        onDismissAll={onDismissHabitQueue}
        onRetryAll={() => habitLog.retryAllFailed()}
        onRetry={habitLog.retry}
        onDismiss={habitLog.dismiss}
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
    </>
  );
}
