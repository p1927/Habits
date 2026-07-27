import { StreamingDots } from './StreamingDots';
import { AGENT_GREETING_CATEGORIES, type AgentChatMessage } from '../lib/agentSectionShared';

export interface AgentChatPanelProps {
  messages: AgentChatMessage[];
  loading: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  onSelectPrompt?: (text: string) => void;
}

export function AgentChatPanel({ messages, loading, listRef, onSelectPrompt }: AgentChatPanelProps) {
  const showGreeting = messages.length === 0;

  return (
    <div className="agent-chat" ref={listRef} role="log" aria-live="polite" aria-label="Chat messages">
      {showGreeting && (
        <div className="agent-greeting">
          <h2 className="agent-greeting__title">Hello</h2>
          <p className="agent-greeting__sub">What would you like to do?</p>
          {onSelectPrompt && (
            <div className="agent-greeting-grid" role="group" aria-label="Suggested actions">
              {AGENT_GREETING_CATEGORIES.map(({ label, icon, description, text }) => (
                <button
                  key={label}
                  type="button"
                  className="agent-greeting-card"
                  onClick={() => onSelectPrompt(text)}
                >
                  <span className="agent-greeting-card__icon" aria-hidden="true">{icon}</span>
                  <span className="agent-greeting-card__label">{label}</span>
                  <span className="agent-greeting-card__desc">{description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {messages.map((m, i) => (
        <div key={i} className={`chat-bubble chat-bubble--${m.role}`} aria-label={m.role === 'user' ? 'You' : 'Coach'}>
          {m.imageUrl && <img src={m.imageUrl} alt="" className="chat-bubble-image" />}
          {m.content}
          {m.role === 'assistant' && i === messages.length - 1 && !loading && (
            <p className="chat-bubble-disclaimer muted">Coach can make mistakes — double-check important details.</p>
          )}
        </div>
      ))}
      {loading && <StreamingDots />}
    </div>
  );
}
