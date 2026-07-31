import { useCallback, useEffect, useRef, useState } from 'react';
import { onAgentDataRefresh } from '../lib/agentDataRefresh';
import { primeFoodTodaySnapshot } from '../lib/foodTodaySnapshot';
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

  const refreshInFlightRef = useRef<Promise<void> | null>(null);
  // Keep the latest serverOnline inside the refresh closure without making
  // the callback identity change on every flip — that would tear down and
  // recreate the polling interval and the data-refresh subscription on
  // every connect/disconnect transition.
  const serverOnlineRef = useRef(serverOnline);
  serverOnlineRef.current = serverOnline;

  const refresh = useCallback(async () => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const run = (async () => {
      if (!serverOnlineRef.current) {
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
        primeFoodTodaySnapshot(food);
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
    })();

    refreshInFlightRef.current = run;
    try {
      await run;
    } finally {
      if (refreshInFlightRef.current === run) {
        refreshInFlightRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    void refresh();
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [active, refresh]);

  useEffect(() => { if (!active) return undefined; return onAgentDataRefresh(() => { void refresh(); }); }, [active, refresh]);

  // React explicitly to serverOnline flips so we stop hammering the API when
  // it goes down and pick up immediately when it returns.
  useEffect(() => {
    if (!active) return;
    if (serverOnline) {
      void refresh();
    } else {
      setState((s) => ({ ...s, loading: false, error: 'habits-api offline' }));
    }
  }, [active, serverOnline, refresh]);

  return { ...state, refresh };
}
