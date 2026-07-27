import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type HabitsStreaksResponse, type HabitsTodayResponse } from '../lib/api';
import { cacheHabitStreak } from '../lib/habitQueue';
import { cacheMealPlan, getCachedMealPlan, type MealPlanEntry } from '../lib/mealPlanQueue';
import type { DayCalendarEvent } from '../lib/daySectionShared';

export function useDaySectionData(serverOnline: boolean) {
  const [habits, setHabits] = useState<HabitsTodayResponse | null>(null);
  const [events, setEvents] = useState<DayCalendarEvent[]>([]);
  const [manageDay, setManageDay] = useState<Record<string, string[]>>({});
  const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>(() => getCachedMealPlan());
  const [streaks, setStreaks] = useState<HabitsStreaksResponse | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!serverOnline) return;
    try {
      const [h, cal, md, mp, st] = await Promise.all([
        api.getHabitsToday(),
        api.getCalendarToday(),
        api.getManageDay(),
        api.getMealPlanToday(),
        api.getHabitStreaks(),
      ]);
      setHabits(h);
      setEvents(cal.events ?? []);
      setManageDay(md.quadrants ?? {});
      setMealPlan(mp.meals ?? []);
      cacheMealPlan(mp.meals ?? []);
      setStreaks(st);
      cacheHabitStreak(st.overall);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
      setError(e instanceof Error ? e.message : 'Failed to load day');
    }
  }, [serverOnline]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  return {
    habits,
    setHabits,
    events,
    manageDay,
    mealPlan,
    streaks,
    error,
    setError,
    refresh,
  };
}
