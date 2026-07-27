import { AgentChatComposer } from '../components/AgentChatComposer';
import { AgentSectionBody } from '../components/AgentSectionBody';
import { AgentSectionHeader } from '../components/AgentSectionHeader';
import { AgentSectionOverlays } from '../components/AgentSectionOverlays';
import { useAgentSection, type AgentNavigateMealPlanSyncSource } from '../hooks/useAgentSection';

interface AgentProps {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: AgentNavigateMealPlanSyncSource;
}

export function Agent({ serverOnline, onNavigateMealPlanSyncSource }: AgentProps) {
  const s = useAgentSection({ serverOnline });

  return (
    <section className="section agent-section agent-section--gemini" aria-labelledby="agent-heading">
      <AgentSectionHeader orbState={s.orbState} onOpenVoice={() => s.setVoiceOpen(true)} />

      {!serverOnline && (
        <div className="banner banner-warn banner-revolut" role="alert">habits-api offline — context unavailable.</div>
      )}

      <AgentSectionBody
        serverOnline={serverOnline}
        messages={s.messages}
        loading={s.loading}
        listRef={s.listRef}
        onSelectPrompt={s.setInput}
        context={s.context}
        onNavigateMealPlanSyncSource={onNavigateMealPlanSyncSource}
        toolFeedActions={s.toolFeedActions}
        actionPollToken={s.actionPollToken}
      />

      <AgentChatComposer
        serverOnline={serverOnline}
        loading={s.loading}
        scanning={s.scanning}
        input={s.input}
        attachImage={s.attachImage}
        showDisclaimer={s.messages.length === 0 && !s.input.trim()}
        onInputChange={s.setInput}
        onSubmit={() => void s.send()}
        onClearAttach={s.clearAttach}
        onOpenCamera={() => s.setAttachOpen(true)}
        onOpenVoice={() => s.setVoiceOpen(true)}
        onOpenTools={() => s.setToolsOpen(true)}
        voiceOrbState={s.composerVoiceOrbState}
      />

      <AgentSectionOverlays
        voiceUiUrl={s.voiceUiUrl}
        voiceOpen={s.voiceOpen}
        onVoiceOpenChange={s.setVoiceOpen}
        onVoiceStatusChange={s.setVoiceIframeStatus}
        toolsOpen={s.toolsOpen}
        onToolsOpenChange={s.setToolsOpen}
        onSelectToolPrompt={s.setInput}
        attachOpen={s.attachOpen}
        onAttachOpenChange={s.setAttachOpen}
        cameraOpen={s.cameraOpen}
        onCameraOpenChange={s.setCameraOpen}
        recentPhotos={s.recentPhotos}
        onPickImage={(dataUrl, label) => void s.handlePhotoCapture(dataUrl, label)}
        onCapture={(url) => void s.handlePhotoCapture(url)}
        serverOnline={serverOnline}
        scanning={s.scanning}
      />

      {s.error && <div className="banner banner-warn banner-revolut" role="alert">{s.error}</div>}
    </section>
  );
}
