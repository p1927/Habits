import { UndoToast } from './UndoToast';
import { MealPlanQueueSection } from './MealPlanQueueSection';
import { MealPlanSyncAwarenessSlot } from './MealPlanSyncAwarenessSlot';
import { MealPlanTodayCard } from './MealPlanTodayCard';
import type { MealPlanEntry, MealPlanSyncSource, QueuedMealPlanLog } from '../lib/mealPlanQueue';
import type { MealPlanUndoState } from '../hooks/useMealPlanUndo';

export interface HomeMealPlanBlockProps {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
  scrollToMealPlanQueue?: number;
  mealPlan: MealPlanEntry[];
  mealPlanMessage: string;
  syncingMealPlanQueue: boolean;
  mealPlanQueue: QueuedMealPlanLog[];
  mealPlanSyncProgress: { done: number; total: number } | null;
  failedMealPlanIds: Set<string>;
  retryingMealPlanId: string | null;
  loggingMealKey: string | null;
  loggingMeals: boolean;
  mealPlanUndo: MealPlanUndoState | null;
  mealPlanUndoing: boolean;
  onFlushQueue: () => void;
  onRetryFailed: () => void;
  onRetryItem: (item: QueuedMealPlanLog) => void;
  onDismissItem: (id: string) => void;
  onClearAll: () => void;
  onLogEntry: (entry: MealPlanEntry) => void;
  onLogAll: () => void;
  onMealPlanUndo: () => void;
  onDismissMealPlanUndo: () => void;
}

export function HomeMealPlanBlock({
  serverOnline,
  onNavigateMealPlanSyncSource,
  scrollToMealPlanQueue,
  mealPlan,
  mealPlanMessage,
  syncingMealPlanQueue,
  mealPlanQueue,
  mealPlanSyncProgress,
  failedMealPlanIds,
  retryingMealPlanId,
  loggingMealKey,
  loggingMeals,
  mealPlanUndo,
  mealPlanUndoing,
  onFlushQueue,
  onRetryFailed,
  onRetryItem,
  onDismissItem,
  onClearAll,
  onLogEntry,
  onLogAll,
  onMealPlanUndo,
  onDismissMealPlanUndo,
}: HomeMealPlanBlockProps) {
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
        onSyncAll={onFlushQueue}
        onRetryFailed={onRetryFailed}
        onRetry={onRetryItem}
        onDismissItem={onDismissItem}
        onClearAll={onClearAll}
      />

      <MealPlanTodayCard
        mealPlan={mealPlan}
        loggingMealKey={loggingMealKey}
        loggingMeals={loggingMeals}
        onLogEntry={onLogEntry}
        onLogAll={onLogAll}
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
          onDismiss={onDismissMealPlanUndo}
          undoing={mealPlanUndoing}
        />
      )}
    </>
  );
}
