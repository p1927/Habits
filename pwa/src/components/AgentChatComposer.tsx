import type { VoiceOrbVisualState } from '../lib/voiceStatus';

import { AgentToolChips } from './AgentToolChips';

export interface AgentChatComposerProps {
  serverOnline: boolean;
  loading: boolean;
  scanning: boolean;
  input: string;
  attachImage: string | null;
  showDisclaimer?: boolean;
  voiceOrbState?: VoiceOrbVisualState;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onClearAttach: () => void;
  onOpenCamera: () => void;
  onOpenVoice: () => void;
  onOpenTools: () => void;
}

export function AgentChatComposer({
  serverOnline,
  loading,
  scanning,
  input,
  attachImage,
  showDisclaimer = false,
  voiceOrbState,
  onInputChange,
  onSubmit,
  onClearAttach,
  onOpenCamera,
  onOpenVoice,
  onOpenTools,
}: AgentChatComposerProps) {
  const canSend = serverOnline && !loading && !scanning && (input.trim() || attachImage);

  return (
    <div className="agent-composer-dock" aria-label="Message composer">
      {attachImage && (
        <div className="agent-attach-preview">
          <img src={attachImage} alt="Attached food photo" className="agent-attach-thumb" />
          <button type="button" className="btn-small" onClick={onClearAttach}>
            Remove
          </button>
        </div>
      )}

      <AgentToolChips
        disabled={!serverOnline || loading || scanning}
        onSelect={onInputChange}
      />

      <form
        className="agent-composer-bar"
        aria-label="Send a message"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) onSubmit();
        }}
      >
        <button
          type="button"
          className="agent-composer-icon"
          aria-label="Attach food photo"
          disabled={!serverOnline || scanning}
          onClick={onOpenCamera}
        >
          +
        </button>

        <button
          type="button"
          className="agent-composer-tools"
          aria-label="Open tools"
          disabled={!serverOnline || loading || scanning}
          onClick={onOpenTools}
        >
          Tools
        </button>

        <label className="sr-only" htmlFor="agent-chat-input">
          Message
        </label>
        <input
          id="agent-chat-input"
          className="agent-composer-field"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={scanning ? 'Scanning photo…' : 'Ask Coach'}
          disabled={!serverOnline || loading || scanning}
        />

        {input.trim() || attachImage ? (
          <button type="submit" className="agent-composer-send" disabled={!canSend} aria-label="Send message">
            ↑
          </button>
        ) : (
          <button
            type="button"
            className={`agent-composer-mic${voiceOrbState ? ` agent-composer-mic--${voiceOrbState}` : ''}`}
            aria-label={voiceOrbState === 'listening' ? 'Voice listening' : 'Open voice coach'}
            aria-pressed={voiceOrbState === 'listening'}
            disabled={!serverOnline}
            onClick={onOpenVoice}
          >
            <span className="agent-composer-mic-dot" aria-hidden="true" />
          </button>
        )}
      </form>

      {showDisclaimer && (
        <p className="agent-composer-disclaimer muted">
          Coach can make mistakes — double-check food and calendar changes.
        </p>
      )}
    </div>
  );
}
