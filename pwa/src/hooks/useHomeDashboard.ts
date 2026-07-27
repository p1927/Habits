import { useCallback, useEffect, useState } from 'react';
import { usePullToRefresh } from './usePullToRefresh';
import {
  api,
  ApiError,
  type FoodHistoryDay,
  type FoodTodayResponse,
  type FutureSelfCard,
  type HabitsTodayResponse,
  type HabitsWeekResponse,
} from '../lib/api';
import { getTodayMealPhotos, type MealPhoto } from '../lib/mealPhotos';
import { cacheHabitStreak, getCachedHabitStreak } from '../lib/habitQueue';
import {
  cacheMealPlan,
  getCachedMealPlan,
  type MealPlanEntry,
} from '../lib/mealPlanQueue';
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
      const [f, h, hist, targets, cards, week, streaks, mealPlanToday] = await Promise.all([
        api.getFoodToday(),
        api.getHabitsToday(),
        api.getFoodHistory(7),
        api.getFoodTargets(),
        api.getFutureSelfCards(true),
        api.getHabitsWeek(),
        api.getHabitStreaks(),
        api.getMealPlanToday(),
      ]);
      setFood(f);
      setHabits(h);
      setHistory(hist.days);
      setHabitWeek(week);
      cacheHabitStreak(streaks.overall);
      setMealPlan(mealPlanToday.meals ?? []);
      cacheMealPlan(mealPlanToday.meals ?? []);
      setCalTarget(targets.calorie_target ?? 2200);
      if (cards.cards.length > 0) {
        setDecisionCard(cards.cards[0]);
      }
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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== 'r' && e.key !== 'R') return;
      const target = e.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) return;
      }
      e.preventDefault();
      void triggerRefresh();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [triggerRefresh]);

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

  const handleShareRings = useCallback(async () => {
    setSharingRings(true);
    setError('');
    try {
      let streakDays = getCachedHabitStreak();
      if (serverOnline) {
        try {
          const st = await api.getHabitStreaks();
          streakDays = st.overall;
          cacheHabitStreak(st.overall);
        } catch {
          /* use cached streak when fetch fails */
        }
      }
      const { downloadRingShareCard } = await import('../lib/ringShareCard');
      downloadRingShareCard({
        protein: { value: food?.protein_g ?? 0, max: proteinTarget },
        calories: { value: food?.calories ?? 0, max: calTarget },
        habits: { value: habitPct, max: 100 },
        date: habits?.date || new Date().toISOString().slice(0, 10),
        streakDays,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Share card export failed');
    } finally {
      setSharingRings(false);
    }
  }, [serverOnline, food, proteinTarget, calTarget, habitPct, habits?.date]);

  const handleExportWeekPdf = useCallback(async () => {
    if (!serverOnline) return;
    setExporting(true);
    setError('');
    try {
      const [hist, week, streaks, targets] = await Promise.all([
        api.getFoodHistory(7),
        api.getHabitsWeek(),
        api.getHabitStreaks(),
        api.getFoodTargets(),
      ]);
      const { downloadWeekReportPdf } = await import('../lib/weekReportPdf');
      downloadWeekReportPdf({
        foodDays: hist.days,
        habitWeek: week,
        streaks,
        calorieTarget: targets.calorie_target ?? 2200,
        proteinTarget: targets.protein_target_g ?? 150,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'PDF export failed');
    } finally {
      setExporting(false);
    }
  }, [serverOnline]);

  const handleAcceptCard = useCallback(async () => {
    if (!decisionCard) return;
    try {
      await api.acceptFutureSelfCard(decisionCard.id);
      setDecisionCard(null);
      void refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Accept failed');
    }
  }, [decisionCard, refresh]);

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
