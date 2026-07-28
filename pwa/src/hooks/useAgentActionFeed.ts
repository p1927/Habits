import { useCallback, useEffect, useRef, useState } from 'react';
import { emitAgentDataRefresh } from '../lib/agentDataRefresh';
import type { AgentAction } from '../lib/agentActionFeedTypes';
import {
  calendarFingerprint,
  detectNewActionsFromPoll,
  foodFingerprint,
} from '../lib/agentActionFeedPoll';
import { api } from '../lib/api';

export interface UseAgentActionFeedOptions {
  serverOnline: boolean;
  active: boolean;
  onDataChange?: () => void;
  seedActions?: AgentAction[];
  pollToken?: number;
}

export function useAgentActionFeed({
  serverOnline,
  active,
  onDataChange,
  seedActions,
  pollToken = 0,
}: UseAgentActionFeedOptions) {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const prevFoodRef = useRef<string>('');
  const prevCalRef = useRef<string>('');
  const initializedRef = useRef(false);
  const onDataChangeRef = useRef(onDataChange);
  onDataChangeRef.current = onDataChange;

  const poll = useCallback(async () => {
    if (!serverOnline) return;
    try {
      const [food, calendar] = await Promise.all([
        api.getFoodToday(),
        api.getCalendarToday(),
      ]);

      const foodFp = foodFingerprint(food.items);
      const calFp = calendarFingerprint(calendar.events ?? []);
      const newActions = detectNewActionsFromPoll({
        foodItems: food.items,
        foodFp,
        prevFoodFp: prevFoodRef.current,
        calendarEvents: calendar.events ?? [],
        calFp,
        prevCalFp: prevCalRef.current,
        initialized: initializedRef.current,
      });

      if (newActions.length > 0) {
        setActions((prev) => [...newActions, ...prev].slice(0, 12));
        onDataChangeRef.current?.();
        if (newActions.some((a) => a.kind === 'food')) emitAgentDataRefresh('food');
        if (newActions.some((a) => a.kind === 'calendar')) emitAgentDataRefresh('calendar');
      }

      prevFoodRef.current = foodFp;
      prevCalRef.current = calFp;
      initializedRef.current = true;
    } catch {
      // polling is best-effort
    }
  }, [serverOnline]);

  useEffect(() => {
    if (!active) return;
    void poll();
    const id = window.setInterval(() => void poll(), 20_000);
    return () => window.clearInterval(id);
  }, [active, poll]);

  useEffect(() => {
    if (!pollToken) return;
    void poll();
  }, [pollToken, poll]);

  useEffect(() => {
    if (!seedActions?.length) return;
    setActions((prev) => {
      const ids = new Set(prev.map((a) => a.id));
      const fresh = seedActions.filter((a) => !ids.has(a.id));
      if (!fresh.length) return prev;
      return [...fresh, ...prev].slice(0, 12);
    });
  }, [seedActions]);

  return { actions };
}
