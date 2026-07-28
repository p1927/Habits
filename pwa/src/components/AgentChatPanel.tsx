import { useCallback, useState } from 'react';
import { StreamingDots } from './StreamingDots';
import { AGENT_GREETING_CATEGORIES, type AgentChatMessage } from '../lib/agentSectionShared';

export interface AgentChatPanelProps {
  messages: AgentChatMessage[];
  loading: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  composerDraft?: string;
  attachImage?: string | null;
  greetingActionsDisabled?: boolean;
  onSelectPrompt?: (text: string) => void;
  onRegenerateLastReply?: () => void;
}

export function AgentChatPanel({
  messages,
  loading,
  listRef,
  composerDraft = '',
  attachImage = null,
  greetingActionsDisabled = false,
  onSelectPrompt,
  onRegenerateLastReply,
}: AgentChatPanelProps) {
  const isEmptyChat = messages.length === 0 && !composerDraft.trim();
  const reserveGreetingLayout = isEmptyChat || Boolean(attachImage);
  const showGreetingVisible = isEmptyChat && !attachImage;
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyMessage = useCallback(async (content: string, index: number) => {
    if (!content.trim()) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      window.setTimeout(() => {
        setCopiedIndex((current) => (current === index ? null : current));
      }, 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  return (
    <div className="agent-chat" ref={listRef} role="log" aria-live="polite" aria-label="Chat messages">
      {reserveGreetingLayout && (
        <div
          className={`agent-greeting${showGreetingVisible ? '' : ' agent-greeting--visually-hidden'}`}
          aria-hidden={showGreetingVisible ? undefined : true}
        >
          <h2 className="agent-greeting__title">Hello</h2>
          <p className="agent-greeting__sub">Where should we start?</p>
          {onSelectPrompt && (
            <div
              className="agent-greeting-grid"
              role="group"
              aria-label="Suggested actions"
              aria-busy={loading || undefined}
            >
              {AGENT_GREETING_CATEGORIES.map(({ label, icon, description, text }) => (
                <button
                  key={label}
                  type="button"
                  className="agent-greeting-card"
                  disabled={greetingActionsDisabled}
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
      {messages.map((m, i) => {
        const isStreaming = loading && i === messages.length - 1;
        const canCopy = m.role === 'assistant' && m.content.trim() && !isStreaming;
        const canRegenerate =
          canCopy && i === messages.length - 1 && Boolean(onRegenerateLastReply);

        return (
        <div key={i} className={`chat-bubble chat-bubble--${m.role}`} aria-label={m.role === 'user' ? 'You' : 'Coach'}>
          {m.imageUrl && <img src={m.imageUrl} alt="" className="chat-bubble-image" />}
          {m.content}
          {(canCopy || canRegenerate) && (
            <div className="chat-bubble-actions">
              {canRegenerate && (
                <button
                  type="button"
                  className="chat-bubble-copy-btn"
                  aria-label="Regenerate coach reply"
                  onClick={() => onRegenerateLastReply?.()}
                >
                  Regenerate
                </button>
              )}
              {canCopy && (
                <button
                  type="button"
                  className="chat-bubble-copy-btn"
                  aria-label={copiedIndex === i ? 'Copied to clipboard' : 'Copy coach message'}
                  onClick={() => void copyMessage(m.content, i)}
                >
                  {copiedIndex === i ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          )}
          {m.role === 'assistant' && isStreaming && m.content && (
            <span className="chat-stream-cursor" aria-hidden="true" />
          )}
          {m.role === 'assistant' && i === messages.length - 1 && !loading && (
            <p className="chat-bubble-disclaimer muted">Coach can make mistakes — double-check important details.</p>
          )}
        </div>
        );
      })}
      {loading && (messages.length === 0 || messages[messages.length - 1]?.role !== 'assistant' || !messages[messages.length - 1]?.content) && (
        <StreamingDots />
      )}
    </div>
  );
}
