import { useHomeDashboardActions } from './useHomeDashboardActions';
import { useHomeDashboardRefresh } from './useHomeDashboardRefresh';
import { homeDashboardDerived } from '../lib/homeDashboardDerived';

interface UseHomeDashboardOptions {
  serverOnline: boolean;
  syncMealPlanQueue: () => void;
}

export function useHomeDashboard({ serverOnline, syncMealPlanQueue }: UseHomeDashboardOptions) {
  const refreshState = useHomeDashboardRefresh({ serverOnline, syncMealPlanQueue });
  const {
    food,
    setFood,
    habits,
    history,
    calTarget,
    habitWeek,
    decisionCard,
    setDecisionCard,
    error,
    setError,
    exporting,
    setExporting,
    sharingRings,
    setSharingRings,
    mealPhotos,
    mealPlan,
    dashboardLoading,
    refresh,
    pullProgress,
    refreshing,
    triggerRefresh,
  } = refreshState;

  const { proteinTarget, habitPct, burn, calorieTrend, habitsTrend } = homeDashboardDerived(
    food,
    habits,
    history,
    habitWeek,
  );

  const { handleShareRings, handleExportWeekPdf, handleAcceptCard } = useHomeDashboardActions({
    serverOnline,
    food,
    habits,
    proteinTarget,
    calTarget,
    habitPct,
    decisionCard,
    setDecisionCard,
    setError,
    setExporting,
    setSharingRings,
    onRefresh: refresh,
  });

  return {
    food,
    setFood,
    habits,
    history,
    calTarget,
    habitWeek,
    decisionCard,
    setDecisionCard,
    error,
    setError,
    exporting,
    sharingRings,
    mealPhotos,
    mealPlan,
    dashboardLoading,
    refresh,
    pullProgress,
    refreshing,
    triggerRefresh,
    proteinTarget,
    habitPct,
    burn,
    calorieTrend,
    habitsTrend,
    handleShareRings,
    handleExportWeekPdf,
    handleAcceptCard,
  };
}
