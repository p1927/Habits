import { useCallback, useRef } from 'react';
import type { RefObject } from 'react';
import { AgentActionFeed } from './AgentActionFeed';
import { AgentChatPanel } from './AgentChatPanel';
import { AgentContextPanel } from './AgentContextPanel';
import type { AgentAction } from '../components/AgentActionFeed';
import type { AgentNavigateMealPlanSyncSource, AgentSectionContext } from '../hooks/useAgentSection';
import type { AgentChatMessage } from '../lib/agentSectionShared';

interface AgentSectionBodyProps {
  serverOnline: boolean;
  messages: AgentChatMessage[];
  loading: boolean;
  listRef: RefObject<HTMLDivElement | null>;
  composerDraft?: string;
  attachImage?: string | null;
  scanning?: boolean;
  onSelectPrompt: (prompt: string) => void;
  onRegenerateLastReply?: () => void;
  context: AgentSectionContext;
  onNavigateMealPlanSyncSource?: AgentNavigateMealPlanSyncSource;
  toolFeedActions?: AgentAction[];
  actionPollToken?: number;
}

export function AgentSectionBody({
  serverOnline,
  messages,
  loading,
  listRef,
  composerDraft,
  attachImage = null,
  scanning = false,
  onSelectPrompt,
  onRegenerateLastReply,
  context,
  onNavigateMealPlanSyncSource,
  toolFeedActions,
  actionPollToken,
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
        composerDraft={composerDraft}
        attachImage={attachImage}
        greetingActionsDisabled={!serverOnline || loading || scanning}
        onSelectPrompt={onSelectPrompt}
        onRegenerateLastReply={onRegenerateLastReply}
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
            seedActions={toolFeedActions}
            pollToken={actionPollToken}
          />
        </>
      )}
    </div>
  );
}
