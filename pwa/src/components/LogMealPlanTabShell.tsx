import { MealPlanQueueSection } from './MealPlanQueueSection';
import { LogMealPlanTabPanel } from './LogMealPlanTabPanel';
import type { MealPlanEntry, QueuedMealPlanLog } from '../lib/mealPlanQueue';

interface LogMealPlanTabShellProps {
  mealPlan: MealPlanEntry[];
  serverOnline: boolean;
  mealPlanQueue: QueuedMealPlanLog[];
  syncingMealPlanQueue: boolean;
  mealPlanSyncProgress: { done: number; total: number } | null;
  failedMealPlanIds: Set<string>;
  retryingMealPlanId: string | null;
  scrollToMealPlanQueue?: number;
  loggingMealKey: string | null;
  loggingMeals: boolean;
  onSyncAll: () => void;
  onRetryFailed: () => void;
  onRetry: (item: QueuedMealPlanLog) => void;
  onDismissItem: (id: string) => void;
  onClearAll: () => void;
  onLogEntry: (entry: MealPlanEntry) => void;
  onLogAll: () => void;
}

export function LogMealPlanTabShell({
  mealPlan,
  serverOnline,
  mealPlanQueue,
  syncingMealPlanQueue,
  mealPlanSyncProgress,
  failedMealPlanIds,
  retryingMealPlanId,
  scrollToMealPlanQueue,
  loggingMealKey,
  loggingMeals,
  onSyncAll,
  onRetryFailed,
  onRetry,
  onDismissItem,
  onClearAll,
  onLogEntry,
  onLogAll,
}: LogMealPlanTabShellProps) {
  return (
    <>
      <MealPlanQueueSection
        hasMealPlan={mealPlan.length > 0}
        serverOnline={serverOnline}
        queue={mealPlanQueue}
        syncing={syncingMealPlanQueue}
        syncProgress={mealPlanSyncProgress}
        failedIds={failedMealPlanIds}
        retryingId={retryingMealPlanId}
        scrollToQueueToken={scrollToMealPlanQueue}
        clearAllLabel="Dismiss"
        onSyncAll={onSyncAll}
        onRetryFailed={onRetryFailed}
        onRetry={onRetry}
        onDismissItem={onDismissItem}
        onClearAll={onClearAll}
      />
      <LogMealPlanTabPanel
        mealPlan={mealPlan}
        loggingMealKey={loggingMealKey}
        loggingMeals={loggingMeals}
        onLogEntry={onLogEntry}
        onLogAll={onLogAll}
        showShortcut
        disableLogAllWhenItemLogging
      />
    </>
  );
}
