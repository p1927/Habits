import type { CSSProperties } from 'react';
import type { VoiceOrbVisualState } from '../lib/voice-status';

interface VoiceStatusOrbProps {
  state?: VoiceOrbVisualState;
  title?: string;
}

export function VoiceStatusOrb({ state = 'idle', title }: VoiceStatusOrbProps) {
  const label =
    title ??
    ({
      idle: 'Voice idle',
      active: 'Voice connected',
      listening: 'Listening',
      thinking: 'Thinking',
      speaking: 'Speaking',
      error: 'Voice error',
    }[state] ?? 'Voice');

  return (
    <div
      className={`voice-status-orb voice-status-orb-${state}`}
      role="status"
      aria-label={label}
      title={label}
    >
      <div className="voice-status-orb-core" />
      <div className="voice-status-bars">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="voice-status-bar" style={{ '--i': i } as CSSProperties} />
        ))}
      </div>
    </div>
  );
}
