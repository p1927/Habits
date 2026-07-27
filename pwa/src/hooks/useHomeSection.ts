import { useRef, useState } from 'react';
import { useHomeDashboard } from './useHomeDashboard';
import { useMealPlanShell } from './useMealPlanShell';
import { useOptimisticFoodLog } from './useOptimisticFoodLog';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

interface UseHomeSectionOptions {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
  onOpenLogHistory?: () => void;
  onOpenLogRecipes?: () => void;
  scrollToMealPlanQueue?: number;
}

export function useHomeSection({
  serverOnline,
  onNavigateMealPlanSyncSource,
  onOpenLogHistory,
  onOpenLogRecipes,
  scrollToMealPlanQueue,
}: UseHomeSectionOptions) {
  const [mealPlanMessage, setMealPlanMessage] = useState('');
  const [recipeMessage, setRecipeMessage] = useState('');
  const syncMealPlanQueueRef = useRef<() => void>(() => {});

  const dashboard = useHomeDashboard({
    serverOnline,
    syncMealPlanQueue: () => syncMealPlanQueueRef.current(),
  });

  const foodLog = useOptimisticFoodLog({
    serverOnline,
    setData: dashboard.setFood,
    setSuccess: setRecipeMessage,
    setError: dashboard.setError,
  });

  const recipeLogging = foodLog.pending.some((entry) => entry.status === 'pending');

  const mealPlanShell = useMealPlanShell({
    serverOnline,
    syncSource: 'home',
    setMessage: setMealPlanMessage,
    setError: dashboard.setError,
    autoFlushOnMount: !dashboard.dashboardLoading,
    watchFocus: true,
    watchQueueChanges: true,
    food: dashboard.food,
    onFoodUpdated: dashboard.setFood,
  });

  syncMealPlanQueueRef.current = mealPlanShell.syncMealPlanQueue;

  return {
    serverOnline,
    onNavigateMealPlanSyncSource,
    onOpenLogHistory,
    onOpenLogRecipes,
    scrollToMealPlanQueue,
    pullProgress: dashboard.pullProgress,
    refreshing: dashboard.refreshing,
    triggerRefresh: dashboard.triggerRefresh,
    food: dashboard.food,
    setFood: dashboard.setFood,
    history: dashboard.history,
    calTarget: dashboard.calTarget,
    habitWeek: dashboard.habitWeek,
    decisionCard: dashboard.decisionCard,
    setDecisionCard: dashboard.setDecisionCard,
    error: dashboard.error,
    setError: dashboard.setError,
    exporting: dashboard.exporting,
    sharingRings: dashboard.sharingRings,
    mealPhotos: dashboard.mealPhotos,
    mealPlan: dashboard.mealPlan,
    dashboardLoading: dashboard.dashboardLoading,
    proteinTarget: dashboard.proteinTarget,
    habitPct: dashboard.habitPct,
    burn: dashboard.burn,
    calorieTrend: dashboard.calorieTrend,
    habitsTrend: dashboard.habitsTrend,
    handleShareRings: dashboard.handleShareRings,
    handleExportWeekPdf: dashboard.handleExportWeekPdf,
    handleAcceptCard: dashboard.handleAcceptCard,
    queuedCount: foodLog.queuedCount,
    failedCount: foodLog.failedCount,
    queueSyncClearedToken: foodLog.queueSyncClearedToken,
    dismissAllQueued: foodLog.dismissAllQueued,
    retryAllFailed: foodLog.retryAllFailed,
    recipeLogging,
    recipeMessage,
    logItem: foodLog.logItem,
    logEntireRecipe: foodLog.logSavedRecipe,
    mealPlanMessage,
    mealPlanShell,
    onMealPlanUndo: () => void mealPlanShell.handleMealPlanUndo(() => {
      setMealPlanMessage('Log undone');
      void dashboard.refresh();
    }),
  };
}

export type UseHomeSectionResult = ReturnType<typeof useHomeSection>;
