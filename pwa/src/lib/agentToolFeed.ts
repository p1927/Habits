import type { ChatResponse } from './api';
import type { AgentAction } from '../components/AgentActionFeed';

export function toolResultsToActions(results: ChatResponse['tool_results']): AgentAction[] {
  const actions: AgentAction[] = [];
  const at = Date.now();

  results.forEach((tr, i) => {
    const args = tr.args ?? {};
    const result = tr.result;
    const messageFromResult =
      result && typeof result === 'object' && result !== null && 'message' in result
        ? String((result as { message?: string }).message ?? '')
        : '';

    switch (tr.tool) {
      case 'log_food': {
        const desc = String(args.description ?? 'food');
        actions.push({
          id: `tool-food-${at}-${i}`,
          kind: 'food',
          message: messageFromResult || `Logged ${desc}`,
          at,
        });
        break;
      }
      case 'create_event': {
        const title = String(args.title ?? 'Event');
        actions.push({
          id: `tool-cal-${at}-${i}`,
          kind: 'calendar',
          message: messageFromResult || `Scheduled: ${title}`,
          at,
        });
        break;
      }
      case 'update_habit': {
        const metric = String(args.metric ?? 'habit');
        const value = args.value;
        actions.push({
          id: `tool-habit-${at}-${i}`,
          kind: 'food',
          message: `Updated ${metric}${value != null ? ` → ${value}h` : ''}`,
          at,
        });
        break;
      }
      case 'add_card': {
        const title = String(args.title ?? 'Note');
        actions.push({
          id: `tool-card-${at}-${i}`,
          kind: 'calendar',
          message: `Added card: ${title}`,
          at,
        });
        break;
      }
      default:
        break;
    }
  });

  return actions;
}
