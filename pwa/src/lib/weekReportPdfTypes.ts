import type { FoodHistoryDay, HabitsStreaksResponse, HabitsWeekResponse } from './api';

export interface WeekReportData {
  foodDays: FoodHistoryDay[];
  habitWeek: HabitsWeekResponse;
  streaks: HabitsStreaksResponse;
  calorieTarget: number;
  proteinTarget: number;
}

export const WEEK_REPORT_HABIT_COLS = ['sleep', 'work', 'read', 'speak', 'game', 'wasted'] as const;
