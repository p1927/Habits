import { UndoToast } from './UndoToast';
import { MealPlanQueueSection } from './MealPlanQueueSection';
import { MealPlanSyncAwarenessSlot } from './MealPlanSyncAwarenessSlot';
import { MealPlanTodayCard } from './MealPlanTodayCard';
import type { useMealPlanShell } from '../hooks/useMealPlanShell';
import type { MealPlanEntry, MealPlanSyncSource } from '../lib/mealPlanQueue';

type MealPlanShell = ReturnType<typeof useMealPlanShell>;

export interface HomeMealPlanBlockProps {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
  scrollToMealPlanQueue?: number;
  mealPlan: MealPlanEntry[];
  mealPlanMessage: string;
  shell: MealPlanShell;
  onMealPlanUndo: () => void;
}

export function HomeMealPlanBlock({
  serverOnline,
  onNavigateMealPlanSyncSource,
  scrollToMealPlanQueue,
  mealPlan,
  mealPlanMessage,
  shell,
  onMealPlanUndo,
}: HomeMealPlanBlockProps) {
  const {
    syncingMealPlanQueue,
    mealPlanQueue,
    mealPlanSyncProgress,
    failedMealPlanIds,
    retryingMealPlanId,
    loggingMealKey,
    loggingMeals,
    mealPlanUndo,
    mealPlanUndoing,
    flushMealPlanQueue,
    retryFailedMealPlanQueue,
    retryMealPlanItem,
    dismissMealPlanItem,
    clearMealPlanQueue,
    logMealPlanEntry,
    logAllMealPlan,
    dismissMealPlanUndo,
  } = shell;

  return (
    <>
      <MealPlanSyncAwarenessSlot
        viewer="home"
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
        variant="home"
        scrollToQueueToken={scrollToMealPlanQueue}
        noPlanToday={mealPlan.length === 0}
        bannerSuffix={mealPlan.length === 0 ? ' — no meals planned today' : ''}
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
        hideWhenEmpty
        message={mealPlanMessage}
        hideMessage={!!mealPlanUndo}
        className="home-meal-plan-card"
        logAllClassName="home-meal-plan-log-all"
        disableLogAllWhenItemLogging
      />

      {mealPlanUndo && (
        <UndoToast
          message={`Logged ${mealPlanUndo.label}`}
          onUndo={onMealPlanUndo}
          onDismiss={dismissMealPlanUndo}
          undoing={mealPlanUndoing}
        />
      )}
    </>
  );
}
