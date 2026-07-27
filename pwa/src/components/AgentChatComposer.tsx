import { AGENT_QUICK_PROMPTS } from '../lib/agentSectionShared';

export interface AgentChatComposerProps {
  serverOnline: boolean;
  loading: boolean;
  scanning: boolean;
  input: string;
  attachImage: string | null;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onClearAttach: () => void;
  onOpenCamera: () => void;
  onOpenVoice: () => void;
}

export function AgentChatComposer({
  serverOnline,
  loading,
  scanning,
  input,
  attachImage,
  onInputChange,
  onSubmit,
  onClearAttach,
  onOpenCamera,
  onOpenVoice,
}: AgentChatComposerProps) {
  return (
    <>
      <div className="agent-tool-chips" role="group" aria-label="Quick prompts">
        {AGENT_QUICK_PROMPTS.map(({ label, text }) => (
          <button
            key={label}
            type="button"
            className="agent-tool-chip"
            disabled={!serverOnline || loading || scanning}
            onClick={() => onInputChange(text)}
          >
            {label}
          </button>
        ))}
      </div>

      {attachImage && (
        <div className="agent-attach-preview">
          <img src={attachImage} alt="Attached food photo" className="agent-attach-thumb" />
          <button type="button" className="btn-small" onClick={onClearAttach}>
            Remove
          </button>
        </div>
      )}

      <form
        className="agent-chat-input"
        aria-label="Send a message"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label className="sr-only" htmlFor="agent-chat-input">
          Message
        </label>
        <input
          id="agent-chat-input"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Message your coach…"
          disabled={!serverOnline || loading || scanning}
        />
        <button type="submit" disabled={!serverOnline || loading || scanning || (!input.trim() && !attachImage)}>
          Send
        </button>
      </form>

      <div className="agent-actions-row">
        <button type="button" className="btn-secondary" onClick={onOpenCamera} disabled={!serverOnline || scanning}>
          {scanning ? 'Scanning…' : 'Camera'}
        </button>
        <button type="button" className="btn-secondary" onClick={onOpenVoice}>
          Voice
        </button>
      </div>
    </>
  );
}
