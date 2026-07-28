import { useAgentActionFeed, type UseAgentActionFeedOptions } from '../hooks/useAgentActionFeed';

export type { AgentAction } from '../lib/agentActionFeedTypes';

export type AgentActionFeedProps = UseAgentActionFeedOptions;

export function AgentActionFeed(props: AgentActionFeedProps) {
  const { actions } = useAgentActionFeed(props);

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
