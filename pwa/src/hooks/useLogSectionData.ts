import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type FoodTodayResponse } from '../lib/api';
import {
  cacheMealPlan,
  getCachedMealPlan,
  type MealPlanEntry,
} from '../lib/mealPlanQueue';
import type { LogTab } from '../lib/logSectionShared';

interface UseLogSectionDataOptions {
  serverOnline: boolean;
  tab: LogTab;
  setTab: (tab: LogTab) => void;
  openMealPlan?: boolean;
  onMealPlanOpened?: () => void;
  openLogHistory?: boolean;
  onLogHistoryOpened?: () => void;
  openLogType?: boolean;
  onLogTypeOpened?: () => void;
  openLogRecipes?: boolean;
  onLogRecipesOpened?: () => void;
  scrollToMealPlanQueue?: number;
  scrollToFoodQueue?: number;
  onTabRecipes?: () => void;
}

export function useLogSectionData({
  serverOnline,
  tab,
  setTab,
  openMealPlan,
  onMealPlanOpened,
  openLogHistory,
  onLogHistoryOpened,
  openLogType,
  onLogTypeOpened,
  openLogRecipes,
  onLogRecipesOpened,
  scrollToMealPlanQueue,
  scrollToFoodQueue,
  onTabRecipes,
}: UseLogSectionDataOptions) {
  const [data, setData] = useState<FoodTodayResponse | null>(null);
  const [history, setHistory] = useState<{ days: { date: string; calories: number; protein: number }[] } | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>(() => getCachedMealPlan());

  const refresh = useCallback(async () => {
    if (!serverOnline) return;
    try {
      const [today, hist] = await Promise.all([api.getFoodToday(), api.getFoodHistory(14)]);
      setData(today);
      setHistory(hist);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
    }
  }, [serverOnline]);

  const loadMealPlan = useCallback(async () => {
    if (!serverOnline) {
      setMealPlan(getCachedMealPlan());
      return;
    }
    try {
      const res = await api.getMealPlanToday();
      setMealPlan(res.meals ?? []);
      cacheMealPlan(res.meals ?? []);
    } catch {
      setMealPlan(getCachedMealPlan());
    }
  }, [serverOnline]);

  useEffect(() => {
    if (!openMealPlan) return;
    setTab('mealplan');
    onMealPlanOpened?.();
  }, [openMealPlan, onMealPlanOpened, setTab]);

  useEffect(() => {
    if (!openLogHistory) return;
    setTab('history');
    onLogHistoryOpened?.();
  }, [openLogHistory, onLogHistoryOpened, setTab]);

  useEffect(() => {
    if (!openLogType) return;
    setTab('type');
    onLogTypeOpened?.();
  }, [openLogType, onLogTypeOpened, setTab]);

  useEffect(() => {
    if (!openLogRecipes) return;
    setTab('recipes');
    onTabRecipes?.();
    onLogRecipesOpened?.();
  }, [openLogRecipes, onLogRecipesOpened, setTab, onTabRecipes]);

  useEffect(() => {
    if (!scrollToMealPlanQueue) return;
    setTab('mealplan');
  }, [scrollToMealPlanQueue, setTab]);

  useEffect(() => {
    if (!scrollToFoodQueue) return;
    setTab('type');
  }, [scrollToFoodQueue, setTab]);

  useEffect(() => {
    void refresh();
    if (tab === 'recipes') onTabRecipes?.();
    if (tab === 'mealplan' || tab === 'type') void loadMealPlan();
  }, [refresh, tab, loadMealPlan, onTabRecipes]);

  return {
    data,
    setData,
    history,
    mealPlan,
    refresh,
    loadMealPlan,
  };
}
