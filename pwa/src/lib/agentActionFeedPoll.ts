import type { CalendarEvent } from '../hooks/useAgentContext';
import type { FoodLogItem } from './api';
import type { AgentAction } from './agentActionFeedTypes';

export function foodFingerprint(items: FoodLogItem[]): string {
  return items.map((i) => `${i.row}:${i.food}:${i.quantity_g}`).join('|');
}

export function calendarFingerprint(events: CalendarEvent[]): string {
  return events.map((e) => `${e.id}:${e.summary}`).join('|');
}

export function detectNewActionsFromPoll(args: {
  foodItems: FoodLogItem[];
  foodFp: string;
  prevFoodFp: string;
  calendarEvents: CalendarEvent[];
  calFp: string;
  prevCalFp: string;
  initialized: boolean;
}): AgentAction[] {
  const {
    foodItems,
    foodFp,
    prevFoodFp,
    calendarEvents,
    calFp,
    prevCalFp,
    initialized,
  } = args;

  if (!initialized) return [];

  const newActions: AgentAction[] = [];
  const at = Date.now();

  if (foodFp !== prevFoodFp && foodItems.length > 0 && prevFoodFp) {
    const prevRows = new Set(prevFoodFp.split('|').map((p) => p.split(':')[0]));
    for (const item of foodItems) {
      const key = String(item.row);
      if (!prevRows.has(key)) {
        newActions.push({
          id: `food-${item.row}-${at}`,
          kind: 'food',
          message: `Logged ${item.quantity_g}g ${item.food}`,
          at,
        });
      }
    }
  }

  if (calFp !== prevCalFp && calendarEvents.length > 0 && prevCalFp) {
    const prevIds = new Set(
      prevCalFp.split('|').map((p) => p.split(':')[0]).filter(Boolean),
    );
    for (const ev of calendarEvents) {
      if (!prevIds.has(ev.id)) {
        newActions.push({
          id: `cal-${ev.id}-${at}`,
          kind: 'calendar',
          message: `Scheduled: ${ev.summary}`,
          at,
        });
      }
    }
  }

  return newActions;
}
