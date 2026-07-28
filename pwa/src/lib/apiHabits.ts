import { get, request } from './apiClient';
import type {
  HabitsStreaksResponse,
  HabitsTodayResponse,
  HabitsWeekResponse,
} from './apiTypes';

export const habitsApi = {
  getHabitsToday: () => get<HabitsTodayResponse>('/api/habits/today'),
  getHabitsWeek: () => get<HabitsWeekResponse>('/api/habits/week'),
  getHabitStreaks: () => get<HabitsStreaksResponse>('/api/habits/streaks'),
  updateHabitMetric: (metric: string, value: number | null) =>
    request<HabitsTodayResponse>(`/api/habits/today/${metric}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),
};
