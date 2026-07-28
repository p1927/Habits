import type { VoiceOrbVisualState } from '../lib/voiceStatus';

import { shortcutModifierLabel } from '../lib/logSectionShared';
import { toolStatusLabel } from '../lib/agentToolStatus';

export interface AgentChatComposerProps {
  serverOnline: boolean;
  loading: boolean;
  scanning: boolean;
  input: string;
  attachImage: string | null;
  showDisclaimer?: boolean;
  showVoiceNudge?: boolean;
  toolStatusLabels?: string[];
  activeTools?: string[];
  onDismissVoiceNudge?: () => void;
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
  showVoiceNudge = false,
  toolStatusLabels = [],
  activeTools = [],
  onDismissVoiceNudge,
  voiceOrbState,
  onInputChange,
  onSubmit,
  onClearAttach,
  onOpenCamera,
  onOpenVoice,
  onOpenTools,
}: AgentChatComposerProps) {
  const canSend = serverOnline && !scanning && (input.trim() || attachImage);
  const toolLabels = (() => {
    if (activeTools.length > 0) {
      const seen = new Set<string>();
      return activeTools.reduce<string[]>((labels, tool) => {
        const label = toolStatusLabel(tool);
        if (seen.has(label)) return labels;
        seen.add(label);
        return [...labels, label];
      }, []);
    }
    return toolStatusLabels;
  })();
  const statusChips = toolLabels.length > 0 ? toolLabels : loading ? ['Working…'] : [];

  return (
    <div className="agent-composer-dock" aria-label="Message composer">
      {loading && statusChips.length > 0 && (
        <div className="agent-tool-status" role="status" aria-live="polite" aria-label="Coach activity">
          {statusChips.map((label, i) => (
            <span key={`${label}-${i}`} className="agent-tool-status__chip">
              {label}
            </span>
          ))}
        </div>
      )}

      {showVoiceNudge && (
        <div className="agent-voice-nudge" role="region" aria-label="Voice coach suggestion" aria-live="polite">
          <button type="button" className="agent-voice-nudge__chip" onClick={onOpenVoice}>
            Try voice coach
          </button>
          <button
            type="button"
            className="agent-voice-nudge__dismiss"
            aria-label="Dismiss voice coach suggestion"
            onClick={onDismissVoiceNudge}
          >
            ×
          </button>
        </div>
      )}

      {attachImage && (
        <div className="agent-attach-preview">
          <img src={attachImage} alt="Attached food photo" className="agent-attach-thumb" />
          <button type="button" className="btn-pill btn-pill-outline" onClick={onClearAttach}>
            Remove
          </button>
        </div>
      )}

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

      {showDisclaimer && (
        <p className="agent-composer-disclaimer muted">
          Coach can make mistakes — double-check food and calendar changes. Press{' '}
          <kbd>{shortcutModifierLabel()}K</kbd> to focus the composer.
        </p>
      )}
    </div>
  );
}
