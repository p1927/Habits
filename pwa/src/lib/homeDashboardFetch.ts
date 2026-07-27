import {
  api,
  type FoodHistoryDay,
  type FoodTodayResponse,
  type FutureSelfCard,
  type HabitsTodayResponse,
  type HabitsWeekResponse,
} from './api';
import { cacheHabitStreak } from './habitQueue';
import { primeFoodTodaySnapshot } from './foodTodaySnapshot';
import { cacheMealPlan, type MealPlanEntry } from './mealPlanQueue';

export interface HomeDashboardData {
  food: FoodTodayResponse;
  habits: HabitsTodayResponse;
  history: FoodHistoryDay[];
  calTarget: number;
  habitWeek: HabitsWeekResponse;
  mealPlan: MealPlanEntry[];
  decisionCard: FutureSelfCard | null;
}

let inflightDashboard: Promise<HomeDashboardData> | null = null;

export function fetchHomeDashboardData(): Promise<HomeDashboardData> {
  if (inflightDashboard) return inflightDashboard;

  inflightDashboard = (async () => {
    const [food, habits, hist, targets, cards, week, streaks, mealPlanToday] = await Promise.all([
      api.getFoodToday(),
      api.getHabitsToday(),
      api.getFoodHistory(7),
      api.getFoodTargets(),
      api.getFutureSelfCards(false),
      api.getHabitsWeek(),
      api.getHabitStreaks(),
      api.getMealPlanToday(),
    ]);
    cacheHabitStreak(streaks.overall);
    primeFoodTodaySnapshot(food);
    const mealPlan = mealPlanToday.meals ?? [];
    cacheMealPlan(mealPlan);
    return {
      food,
      habits,
      history: hist.days,
      calTarget: targets.calorie_target ?? 2200,
      habitWeek: week,
      mealPlan,
      decisionCard: cards.cards.length > 0 ? cards.cards[0] : null,
    };
  })().finally(() => {
    inflightDashboard = null;
  });

  return inflightDashboard;
}
