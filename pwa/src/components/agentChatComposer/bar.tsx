import { shortcutModifierLabel } from '../../lib/logSectionShared';
import type { VoiceOrbVisualState } from '../../lib/voiceStatus';

export interface AgentComposerBarProps {
  serverOnline: boolean;
  loading: boolean;
  scanning: boolean;
  input: string;
  attachImage: string | null;
  voiceOrbState?: VoiceOrbVisualState;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onOpenCamera: () => void;
  onOpenVoice: () => void;
  onOpenTools: () => void;
}

export function AgentComposerBar({
  serverOnline,
  loading,
  scanning,
  input,
  attachImage,
  voiceOrbState,
  onInputChange,
  onSubmit,
  onOpenCamera,
  onOpenVoice,
  onOpenTools,
}: AgentComposerBarProps) {
  const canSend = serverOnline && !scanning && (input.trim() || attachImage);
  return (
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
        disabled={loading || scanning}
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
        placeholder={scanning ? 'Scanning photo…' : loading ? 'Send to interrupt…' : 'Ask Coach'}
        disabled={!serverOnline || scanning}
        aria-keyshortcuts={`${shortcutModifierLabel()}K`}
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
  );
}
