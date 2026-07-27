import { useState } from 'react';
import { CameraCapture } from '../components/CameraCapture';
import { getConfig } from '../lib/config';
import { toOrbVisual, type VoiceIframeStatus } from '../lib/voiceStatus';
import { AgentAttachSheet } from '../components/AgentAttachSheet';
import { AgentActionFeed } from '../components/AgentActionFeed';
import { AgentToolsSheet } from '../components/AgentToolsSheet';
import { AgentContextPanel } from '../components/AgentContextPanel';
import { AgentChatPanel } from '../components/AgentChatPanel';
import { AgentChatComposer } from '../components/AgentChatComposer';
import { VoiceCoachLayer } from '../components/VoiceCoachLayer';
import { VoiceStatusOrb } from '../components/VoiceStatusOrb';
import { BottomSheet } from '../components/ui/BottomSheet';
import { useAgentContext } from '../hooks/useAgentContext';
import { useAgentChat } from '../hooks/useAgentChat';
import { useAgentPhotoAttach } from '../hooks/useAgentPhotoAttach';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

interface AgentProps {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
}

export function Agent({ serverOnline, onNavigateMealPlanSyncSource }: AgentProps) {
  const { voiceUiUrl } = getConfig();
  const context = useAgentContext(serverOnline, true);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceIframeStatus, setVoiceIframeStatus] = useState<VoiceIframeStatus | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);

  const orbState = toOrbVisual(voiceIframeStatus, serverOnline);

  const {
    messages,
    input,
    setInput,
    loading,
    attachImage,
    setAttachImage,
    error,
    setError,
    listRef,
    send,
    clearAttach,
  } = useAgentChat({
    serverOnline,
    onToolResults: () => void context.refresh(),
  });

  const {
    cameraOpen,
    setCameraOpen,
    attachOpen,
    setAttachOpen,
    recentPhotos,
    scanning,
    handlePhotoCapture,
  } = useAgentPhotoAttach({ setAttachImage, setInput, setError });

  return (
    <section className="section agent-section agent-section--gemini" aria-labelledby="agent-heading">
      <header className="agent-header agent-header--gemini">
        <div>
          <p className="section-eyebrow">Assistant</p>
          <h1 id="agent-heading">Coach</h1>
        </div>
        <button type="button" className="agent-voice-orb-btn" aria-label="Open voice coach" onClick={() => setVoiceOpen(true)}>
          <VoiceStatusOrb state={orbState} />
        </button>
      </header>

      {!serverOnline && (
        <div className="banner banner-warn banner-revolut" role="alert">habits-api offline — context unavailable.</div>
      )}

      <div className="agent-body">
        <AgentChatPanel
          messages={messages}
          loading={loading}
          listRef={listRef}
          onSelectPrompt={setInput}
        />

        <details className="agent-context-drawer">
          <summary className="agent-context-drawer__summary">Today&apos;s context</summary>
          <AgentContextPanel context={context} onNavigateMealPlanSyncSource={onNavigateMealPlanSyncSource} />
        </details>

        {messages.length > 0 && (
          <>
            <div className="agent-feed-label">Recent actions</div>
            <AgentActionFeed
              serverOnline={serverOnline}
              active
              onDataChange={() => void context.refresh()}
            />
          </>
        )}
      </div>

      <AgentChatComposer
        serverOnline={serverOnline}
        loading={loading}
        scanning={scanning}
        input={input}
        attachImage={attachImage}
        showDisclaimer={messages.length === 0 && !input.trim()}
        onInputChange={setInput}
        onSubmit={() => void send()}
        onClearAttach={clearAttach}
        onOpenCamera={() => setAttachOpen(true)}
        onOpenVoice={() => setVoiceOpen(true)}
        onOpenTools={() => setToolsOpen(true)}
        voiceOrbState={voiceOpen ? (orbState !== 'idle' ? orbState : 'active') : undefined}
      />

      <AgentToolsSheet
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
        onSelect={setInput}
      />

      <AgentAttachSheet
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        recentPhotos={recentPhotos}
        onOpenCamera={() => setCameraOpen(true)}
        onPickImage={(dataUrl, label) => void handlePhotoCapture(dataUrl, label)}
      />

      <BottomSheet open={cameraOpen} onClose={() => setCameraOpen(false)} title="Camera">
        <CameraCapture
          facingMode="environment"
          placeholder="Point at your food"
          disabled={!serverOnline || scanning}
          onCapture={(url) => void handlePhotoCapture(url)}
        />
      </BottomSheet>

      {voiceUiUrl ? (
        <VoiceCoachLayer
          url={voiceUiUrl}
          open={voiceOpen}
          onClose={() => setVoiceOpen(false)}
          onStatusChange={setVoiceIframeStatus}
        />
      ) : (
        <BottomSheet open={voiceOpen} onClose={() => setVoiceOpen(false)} title="Voice coach">
          <p className="muted">Set VITE_VOICE_UI_URL in config.</p>
        </BottomSheet>
      )}

      {error && <div className="banner banner-warn banner-revolut" role="alert">{error}</div>}
    </section>
  );
}
