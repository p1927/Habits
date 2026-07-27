import type { FoodHistoryDay, FoodTodayResponse, HabitsTodayResponse, HabitsWeekResponse } from './api';
import { estimateActiveBurn, habitCompletionPct } from './homeSectionShared';

export function homeDashboardDerived(
  food: FoodTodayResponse | null,
  habits: HabitsTodayResponse | null,
  history: FoodHistoryDay[],
  habitWeek: HabitsWeekResponse | null,
) {
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

  return { proteinTarget, habitPct, burn, calorieTrend, habitsTrend };
}
