export type AgentDataRefreshKind = 'food' | 'calendar' | 'habits' | 'all';
const EVENT_NAME = 'habits:agent-data-refresh';
export function emitAgentDataRefresh(kind: AgentDataRefreshKind = 'all'): void {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { kind } }));
}
export function onAgentDataRefresh(handler: (kind: AgentDataRefreshKind) => void): () => void {
  const listener = (event: Event) => {
    handler((event as CustomEvent<{ kind?: AgentDataRefreshKind }>).detail?.kind ?? 'all');
  };
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
