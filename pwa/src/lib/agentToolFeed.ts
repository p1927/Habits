import type { ChatResponse } from './api';
import type { AgentAction } from './agentActionFeedTypes';
import { emitAgentDataRefresh } from './agentDataRefresh';
function msg(r: unknown): string { return r && typeof r === 'object' && r !== null && 'message' in r ? String((r as {message?:string}).message ?? '') : ''; }
export function toolResultsToActions(results: ChatResponse['tool_results']): AgentAction[] {
  const actions: AgentAction[] = []; const at = Date.now();
  results.forEach((tr, i) => {  const m = msg(tr.result);
    switch (tr.tool) {
      case 'log_food': case 'log_food_item': actions.push({ id: `f-${at}-${i}`, kind: 'food', message: m || 'Logged food', at }); emitAgentDataRefresh('food'); break;
      case 'create_event': case 'update_calendar_event': case 'delete_calendar_event': actions.push({ id: `c-${at}-${i}`, kind: 'calendar', message: m || 'Calendar updated', at }); emitAgentDataRefresh('calendar'); break;
      case 'update_habit': actions.push({ id: `h-${at}-${i}`, kind: 'food', message: 'Habit updated', at }); emitAgentDataRefresh('habits'); break;
    }
  }); return actions;
}
