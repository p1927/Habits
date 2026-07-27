import {
  api,
  type FoodHistoryDay,
  type FoodTodayResponse,
  type FutureSelfCard,
  type HabitsTodayResponse,
  type HabitsWeekResponse,
} from './api';
import { cacheHabitStreak } from './habitQueue';
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

export async function fetchHomeDashboardData(): Promise<HomeDashboardData> {
  const [food, habits, hist, targets, cards, week, streaks, mealPlanToday] = await Promise.all([
    api.getFoodToday(),
    api.getHabitsToday(),
    api.getFoodHistory(7),
    api.getFoodTargets(),
    api.getFutureSelfCards(true),
    api.getHabitsWeek(),
    api.getHabitStreaks(),
    api.getMealPlanToday(),
  ]);
  cacheHabitStreak(streaks.overall);
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
}
