import { useCallback, useEffect, useState } from 'react';
import {
  api,
  ApiError,
  type FoodTodayResponse,
  type HabitsTodayResponse,
} from '../lib/api';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
}

export interface AgentContextState {
  food: FoodTodayResponse | null;
  habits: HabitsTodayResponse | null;
  calendar: CalendarEvent[];
  summary: string | null;
  loading: boolean;
  error: string | null;
}

export function useAgentContext(serverOnline: boolean, active: boolean) {
  const [state, setState] = useState<AgentContextState>({
    food: null,
    habits: null,
    calendar: [],
    summary: null,
    loading: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!serverOnline) {
      setState((s) => ({ ...s, loading: false, error: 'habits-api offline' }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [food, habits, calendar, futureSelf] = await Promise.all([
        api.getFoodToday(),
        api.getHabitsToday(),
        api.getCalendarToday(),
        api.getFutureSelfSummary(),
      ]);
      setState({
        food,
        habits,
        calendar: calendar.events ?? [],
        summary: futureSelf.summary ?? null,
        loading: false,
        error: null,
      });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setState((s) => ({ ...s, loading: false, error: 'Unauthorized — save bearer in Settings' }));
        return;
      }
      setState((s) => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to load context',
      }));
    }
  }, [serverOnline]);

  useEffect(() => {
    if (!active) return;
    void refresh();
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [active, refresh]);

  return { ...state, refresh };
}
