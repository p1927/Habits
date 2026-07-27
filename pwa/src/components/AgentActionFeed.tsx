import { useCallback, useEffect, useRef, useState } from 'react';
import { api, type FoodLogItem } from '../lib/api';
import type { CalendarEvent } from '../hooks/useAgentContext';

export interface AgentAction {
  id: string;
  kind: 'food' | 'calendar';
  message: string;
  at: number;
}

interface AgentActionFeedProps {
  serverOnline: boolean;
  active: boolean;
  onDataChange?: () => void;
  seedActions?: AgentAction[];
  pollToken?: number;
}

function foodFingerprint(items: FoodLogItem[]): string {
  return items.map((i) => `${i.row}:${i.food}:${i.quantity_g}`).join('|');
}

function calendarFingerprint(events: CalendarEvent[]): string {
  return events.map((e) => `${e.id}:${e.summary}`).join('|');
}

export function AgentActionFeed({ serverOnline, active, onDataChange, seedActions, pollToken = 0 }: AgentActionFeedProps) {
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

      if (initializedRef.current) {
        const newActions: AgentAction[] = [];

        if (foodFp !== prevFoodRef.current && food.items.length > 0) {
          const prevRows = new Set(prevFoodRef.current.split('|').map((p) => p.split(':')[0]));
          for (const item of food.items) {
            const key = String(item.row);
            if (!prevRows.has(key) && prevFoodRef.current) {
              newActions.push({
                id: `food-${item.row}-${Date.now()}`,
                kind: 'food',
                message: `Logged ${item.quantity_g}g ${item.food}`,
                at: Date.now(),
              });
            }
          }
        }

        if (calFp !== prevCalRef.current && (calendar.events?.length ?? 0) > 0) {
          const prevIds = new Set(
            prevCalRef.current.split('|').map((p) => p.split(':')[0]).filter(Boolean),
          );
          for (const ev of calendar.events ?? []) {
            if (!prevIds.has(ev.id) && prevCalRef.current) {
              newActions.push({
                id: `cal-${ev.id}-${Date.now()}`,
                kind: 'calendar',
                message: `Scheduled: ${ev.summary}`,
                at: Date.now(),
              });
            }
          }
        }

        if (newActions.length > 0) {
          setActions((prev) => [...newActions, ...prev].slice(0, 12));
          onDataChangeRef.current?.();
        }
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

  if (actions.length === 0) {
    return (
      <div className="agent-action-feed agent-action-feed-empty">
        <span className="muted">Voice actions will appear here when meals or events are logged.</span>
      </div>
    );
  }

  return (
    <ul className="agent-action-feed">
      {actions.map((action) => (
        <li key={action.id} className={`agent-action agent-action-${action.kind}`}>
          <span className="agent-action-icon">{action.kind === 'food' ? '🥗' : '📅'}</span>
          <span className="agent-action-text">{action.message}</span>
        </li>
      ))}
    </ul>
  );
}
