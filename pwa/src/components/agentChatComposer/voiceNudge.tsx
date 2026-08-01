export interface AgentComposerVoiceNudgeProps {
  onOpenVoice: () => void;
  onDismiss: () => void;
}

export function AgentComposerVoiceNudge({ onOpenVoice, onDismiss }: AgentComposerVoiceNudgeProps) {
  return (
    <div className="agent-voice-nudge" role="region" aria-label="Voice coach suggestion" aria-live="polite">
      <button type="button" className="agent-voice-nudge__chip" onClick={onOpenVoice}>
        Try voice coach
      </button>
      <button
        type="button"
        className="agent-voice-nudge__dismiss"
        aria-label="Dismiss voice coach suggestion"
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  );
}
