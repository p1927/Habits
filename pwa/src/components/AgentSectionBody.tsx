import { useCallback, useRef } from 'react';
import type { RefObject } from 'react';
import { AgentActionFeed } from './AgentActionFeed';
import { AgentChatPanel } from './AgentChatPanel';
import { AgentContextPanel } from './AgentContextPanel';
import type { AgentNavigateMealPlanSyncSource, AgentSectionContext } from '../hooks/useAgentSection';
import type { AgentChatMessage } from '../lib/agentSectionShared';

interface AgentSectionBodyProps {
  serverOnline: boolean;
  messages: AgentChatMessage[];
  loading: boolean;
  listRef: RefObject<HTMLDivElement | null>;
  onSelectPrompt: (prompt: string) => void;
  context: AgentSectionContext;
  onNavigateMealPlanSyncSource?: AgentNavigateMealPlanSyncSource;
}

export function AgentSectionBody({
  serverOnline,
  messages,
  loading,
  listRef,
  onSelectPrompt,
  context,
  onNavigateMealPlanSyncSource,
}: AgentSectionBodyProps) {
  const refreshRef = useRef(context.refresh);
  refreshRef.current = context.refresh;
  const onActionFeedDataChange = useCallback(() => {
    void refreshRef.current();
  }, []);

  return (
    <div className="agent-body">
      <AgentChatPanel
        messages={messages}
        loading={loading}
        listRef={listRef}
        onSelectPrompt={onSelectPrompt}
      />

      <details className="agent-context-drawer">
        <summary className="agent-context-drawer__summary">Today&apos;s context</summary>
        <AgentContextPanel context={context} onNavigateMealPlanSyncSource={onNavigateMealPlanSyncSource} />
      </details>

      {messages.length > 0 && (
        <>
          <p className="section-eyebrow">Activity</p>
          <AgentActionFeed
            serverOnline={serverOnline}
            active
            onDataChange={onActionFeedDataChange}
          />
        </>
      )}
    </div>
  );
}
