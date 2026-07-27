import { useCallback, useEffect, useRef, useState } from 'react';
import { usePullToRefresh } from './usePullToRefresh';
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

interface UseHomeDashboardRefreshOptions {
  serverOnline: boolean;
  syncMealPlanQueue: () => void;
}

export function useHomeDashboardRefresh({
  serverOnline,
  syncMealPlanQueue,
}: UseHomeDashboardRefreshOptions) {
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

  const syncMealPlanQueueRef = useRef(syncMealPlanQueue);
  syncMealPlanQueueRef.current = syncMealPlanQueue;
  const refreshInFlightRef = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async () => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const run = (async () => {
      setMealPhotos(getTodayMealPhotos());
      syncMealPlanQueueRef.current();
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
    })();

    refreshInFlightRef.current = run;
    try {
      await run;
    } finally {
      if (refreshInFlightRef.current === run) {
        refreshInFlightRef.current = null;
      }
    }
  }, [serverOnline]);

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
  };
}
