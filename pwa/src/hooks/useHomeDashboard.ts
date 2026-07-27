import { useCallback, useEffect, useState } from 'react';
import { usePullToRefresh } from './usePullToRefresh';
import { useHomeDashboardActions } from './useHomeDashboardActions';
import { useHomeRefreshShortcut } from './useHomeRefreshShortcut';
import {
  ApiError,
  type FoodHistoryDay,
  type FoodTodayResponse,
  type FutureSelfCard,
  type HabitsTodayResponse,
  type HabitsWeekResponse,
} from '../lib/api';
import { getTodayMealPhotos, type MealPhoto } from '../lib/mealPhotos';
import { fetchHomeDashboardData } from '../lib/homeDashboardFetch';
import { getCachedMealPlan, type MealPlanEntry } from '../lib/mealPlanQueue';
import {
  estimateActiveBurn,
  habitCompletionPct,
} from '../lib/homeSectionShared';

interface UseHomeDashboardOptions {
  serverOnline: boolean;
  syncMealPlanQueue: () => void;
}

export function useHomeDashboard({ serverOnline, syncMealPlanQueue }: UseHomeDashboardOptions) {
  const [food, setFood] = useState<FoodTodayResponse | null>(null);
  const [habits, setHabits] = useState<HabitsTodayResponse | null>(null);
  const [history, setHistory] = useState<FoodHistoryDay[]>([]);
  const [calTarget, setCalTarget] = useState(2200);
  const [habitWeek, setHabitWeek] = useState<HabitsWeekResponse | null>(null);
  const [decisionCard, setDecisionCard] = useState<FutureSelfCard | null>(null);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [sharingRings, setSharingRings] = useState(false);
  const [mealPhotos, setMealPhotos] = useState<MealPhoto[]>(() => getTodayMealPhotos());
  const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>(() => getCachedMealPlan());
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const refresh = useCallback(async () => {
    setMealPhotos(getTodayMealPhotos());
    syncMealPlanQueue();
    if (!serverOnline) {
      setMealPlan(getCachedMealPlan());
      setDashboardLoading(false);
      return;
    }
    setError('');
    try {
      const data = await fetchHomeDashboardData();
      setFood(data.food);
      setHabits(data.habits);
      setHistory(data.history);
      setHabitWeek(data.habitWeek);
      setMealPlan(data.mealPlan);
      setCalTarget(data.calTarget);
      setDecisionCard(data.decisionCard);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setDashboardLoading(false);
    }
  }, [serverOnline, syncMealPlanQueue]);

  const { pullProgress, refreshing, triggerRefresh } = usePullToRefresh({
    onRefresh: refresh,
    enabled: true,
  });

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  useHomeRefreshShortcut(triggerRefresh);

  const proteinTarget = food?.protein_target_g ?? 150;
  const habitPct = habitCompletionPct(habits);
  const burn = estimateActiveBurn(habits);
  const calorieTrend = history.length > 1 ? history.map((d) => d.calories) : undefined;
  const habitsTrend =
    habitWeek && habitWeek.recent_days.length > 1
      ? habitWeek.recent_days.map((d) =>
          habitCompletionPct({ date: d.date, metrics: d.metrics } as HabitsTodayResponse),
        )
      : undefined;

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
