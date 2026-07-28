import { useEffect, useMemo, useState } from 'react';
import { AgentChatComposer } from '../components/AgentChatComposer';
import { AgentSectionBody } from '../components/AgentSectionBody';
import { AgentSectionHeader } from '../components/AgentSectionHeader';
import { AgentSectionOverlays } from '../components/AgentSectionOverlays';
import { useAgentComposerFocusShortcut } from '../hooks/useAgentComposerFocusShortcut';
import { useAgentSection, type AgentNavigateMealPlanSyncSource } from '../hooks/useAgentSection';

interface AgentProps {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: AgentNavigateMealPlanSyncSource;
  agentPrompt?: { token: number; text: string } | null;
}

export function Agent({ serverOnline, onNavigateMealPlanSyncSource, agentPrompt }: AgentProps) {
  const s = useAgentSection({ serverOnline });
  const [voiceNudgeDismissed, setVoiceNudgeDismissed] = useState(false);

  useEffect(() => {
    if (!agentPrompt?.token) return;
    s.setInput(agentPrompt.text);
  }, [agentPrompt?.token, agentPrompt?.text, s.setInput]);

  useAgentComposerFocusShortcut(
    s.voiceOpen || s.toolsOpen || s.cameraOpen || s.attachOpen,
  );

  const showVoiceNudge = useMemo(() => {
    if (!serverOnline || voiceNudgeDismissed || s.loading || s.voiceOpen) return false;
    const userCount = s.messages.filter((m) => m.role === 'user').length;
    const hasAssistantReply = s.messages.some((m) => m.role === 'assistant' && m.content.trim());
    return userCount === 1 && hasAssistantReply;
  }, [serverOnline, voiceNudgeDismissed, s.loading, s.voiceOpen, s.messages]);

  const openVoiceCoach = () => {
    setVoiceNudgeDismissed(true);
    s.setVoiceOpen(true);
  };

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
        composerDraft={s.input}
        attachImage={s.attachImage}
        scanning={s.scanning}
        onSelectPrompt={(text) => void s.sendPrompt(text)}
        onRegenerateLastReply={() => void s.regenerateLastReply()}
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
        showDisclaimer={s.messages.length === 0 && !s.input.trim() && !s.attachImage}
        showVoiceNudge={showVoiceNudge}
        toolStatusLabels={s.toolStatusLabels}
        onDismissVoiceNudge={() => setVoiceNudgeDismissed(true)}
        onInputChange={s.setInput}
        onSubmit={() => void s.send()}
        onClearAttach={s.clearAttach}
        onOpenCamera={() => s.setAttachOpen(true)}
        onOpenVoice={openVoiceCoach}
        onOpenTools={() => s.setToolsOpen(true)}
        voiceOrbState={s.composerVoiceOrbState}
      />

      <AgentSectionOverlays
        voiceOpen={s.voiceOpen}
        onVoiceOpenChange={s.setVoiceOpen}
        onVoiceStatusChange={s.setVoiceIframeStatus}
        toolsOpen={s.toolsOpen}
        onToolsOpenChange={s.setToolsOpen}
        onSelectToolPrompt={(text) => void s.sendPrompt(text)}
        toolsLoading={s.loading || s.scanning}
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
