import type { MealPlan, SectionData } from './logTabPanelsPropsBuilder';
import type { QueuedMealPlanLog } from './mealPlanQueue';

export interface BuildMealPlanQueuePropsInput {
  mealPlanShell: MealPlan;
  sectionData: SectionData;
}

export function buildMealPlanQueueProps({
  mealPlanShell,
  sectionData,
}: BuildMealPlanQueuePropsInput) {
  const { history } = sectionData;
  return {
    mealPlanQueue: mealPlanShell.mealPlanQueue,
    syncingMealPlanQueue: mealPlanShell.syncingMealPlanQueue,
    mealPlanSyncProgress: mealPlanShell.mealPlanSyncProgress,
    failedMealPlanIds: mealPlanShell.failedMealPlanIds,
    retryingMealPlanId: mealPlanShell.retryingMealPlanId,
    onSyncAll: () => void mealPlanShell.flushMealPlanQueue(),
    onRetryFailed: () => void mealPlanShell.retryFailedMealPlanQueue(),
    onRetry: (item: QueuedMealPlanLog) => void mealPlanShell.retryMealPlanItem(item),
    onDismissItem: mealPlanShell.dismissMealPlanItem,
    onClearAll: mealPlanShell.clearMealPlanQueue,
    onLogAll: mealPlanShell.logAllMealPlan,
    historyDays: history?.days ?? [],
  };
}
