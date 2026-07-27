import { VoiceStatusOrb } from './VoiceStatusOrb';
import type { VoiceOrbVisualState } from '../lib/voiceStatus';

interface AgentSectionHeaderProps {
  orbState: VoiceOrbVisualState;
  onOpenVoice: () => void;
}

const VOICE_BTN_LABEL: Record<VoiceOrbVisualState, string> = {
  idle: 'Open voice coach',
  active: 'Open voice coach — connected',
  listening: 'Open voice coach — listening',
  thinking: 'Open voice coach — thinking',
  speaking: 'Open voice coach — speaking',
  error: 'Open voice coach — error',
};

export function AgentSectionHeader({ orbState, onOpenVoice }: AgentSectionHeaderProps) {
  return (
    <header className="agent-header agent-header--gemini">
      <div>
        <p className="section-eyebrow">Assistant</p>
        <h1 id="agent-heading">Coach</h1>
      </div>
      <button
        type="button"
        className="agent-voice-orb-btn"
        aria-label={VOICE_BTN_LABEL[orbState]}
        onClick={onOpenVoice}
      >
        <VoiceStatusOrb state={orbState} />
      </button>
    </header>
  );
}
