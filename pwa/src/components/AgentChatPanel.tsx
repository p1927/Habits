import { StreamingDots } from './StreamingDots';
import type { AgentChatMessage } from '../lib/agentSectionShared';

export interface AgentChatPanelProps {
  messages: AgentChatMessage[];
  loading: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
}

export function AgentChatPanel({ messages, loading, listRef }: AgentChatPanelProps) {
  return (
    <div className="agent-chat" ref={listRef} role="log" aria-live="polite" aria-label="Chat messages">
      {messages.length === 0 && (
        <p className="muted agent-chat-empty">
          Ask me to log food, update habits, schedule events, or add health notes.
        </p>
      )}
      {messages.map((m, i) => (
        <div key={i} className={`chat-bubble chat-bubble--${m.role}`} aria-label={m.role === 'user' ? 'You' : 'Coach'}>
          {m.imageUrl && <img src={m.imageUrl} alt="" className="chat-bubble-image" />}
          {m.content}
        </div>
      ))}
      {loading && <StreamingDots />}
    </div>
  );
}
