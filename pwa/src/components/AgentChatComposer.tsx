import type { VoiceOrbVisualState } from '../lib/voiceStatus';

import { AgentComposerAttachPreview } from './agentChatComposer/attachPreview';
import { AgentComposerBar } from './agentChatComposer/bar';
import { AgentComposerDisclaimer } from './agentChatComposer/disclaimer';
import { AgentComposerStatusChips } from './agentChatComposer/statusChips';
import { AgentComposerVoiceNudge } from './agentChatComposer/voiceNudge';

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
  return (
    <div className="agent-composer-dock" aria-label="Message composer">
      {loading && (
        <AgentComposerStatusChips
          loading={loading}
          activeTools={activeTools}
          toolStatusLabels={toolStatusLabels}
        />
      )}

      {showVoiceNudge && onDismissVoiceNudge && (
        <AgentComposerVoiceNudge onOpenVoice={onOpenVoice} onDismiss={onDismissVoiceNudge} />
      )}

      {attachImage && (
        <AgentComposerAttachPreview attachImage={attachImage} onClear={onClearAttach} />
      )}

      <AgentComposerBar
        serverOnline={serverOnline}
        loading={loading}
        scanning={scanning}
        input={input}
        attachImage={attachImage}
        voiceOrbState={voiceOrbState}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
        onOpenCamera={onOpenCamera}
        onOpenVoice={onOpenVoice}
        onOpenTools={onOpenTools}
      />

      {showDisclaimer && <AgentComposerDisclaimer />}
    </div>
  );
}
