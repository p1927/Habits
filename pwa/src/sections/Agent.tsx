import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraCapture } from '../components/CameraCapture';
import { getConfig } from '../lib/config';
import { api } from '../lib/api';
import { toOrbVisual, type VoiceIframeStatus } from '../lib/voiceStatus';
import { addMealPhoto } from '../lib/mealPhotos';
import { dataUrlToFile } from '../lib/logSectionShared';
import { foodScanChatSummary, type AgentChatMessage } from '../lib/agentSectionShared';
import { AgentActionFeed } from '../components/AgentActionFeed';
import { AgentContextPanel } from '../components/AgentContextPanel';
import { AgentChatPanel } from '../components/AgentChatPanel';
import { AgentChatComposer } from '../components/AgentChatComposer';
import { VoiceEmbed } from '../components/VoiceEmbed';
import { VoiceStatusOrb } from '../components/VoiceStatusOrb';
import { BottomSheet } from '../components/ui/BottomSheet';
import { useAgentContext } from '../hooks/useAgentContext';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

interface AgentProps {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
}

export function Agent({ serverOnline, onNavigateMealPlanSyncSource }: AgentProps) {
  const { voiceUiUrl } = getConfig();
  const context = useAgentContext(serverOnline, true);
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceIframeStatus, setVoiceIframeStatus] = useState<VoiceIframeStatus | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [attachImage, setAttachImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!voiceOpen) setVoiceIframeStatus(null);
  }, [voiceOpen]);

  const orbState = toOrbVisual(voiceOpen ? voiceIframeStatus : null, serverOnline);

  const send = useCallback(async () => {
    const text = input.trim();
    if ((!text && !attachImage) || !serverOnline) return;
    const message = text || 'What is in this photo?';
    setInput('');
    setLoading(true);
    setError('');
    const imageUrl = attachImage ?? undefined;
    setAttachImage(null);
    const userMsg: AgentChatMessage = { role: 'user', content: message, imageUrl };
    setMessages((m) => [...m, userMsg]);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.agentChat(message, history);
      setMessages((m) => [...m, { role: 'assistant', content: res.reply || 'Done.' }]);
      if (res.tool_results.length) void context.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chat failed');
    } finally {
      setLoading(false);
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [input, attachImage, serverOnline, messages, context]);

  const handlePhotoCapture = useCallback(async (dataUrl: string) => {
    setCameraOpen(false);
    setScanning(true);
    setError('');
    try {
      const scan = await api.scanFood(dataUrlToFile(dataUrl, 'chat-scan.jpg'));
      setAttachImage(dataUrl);
      setInput(foodScanChatSummary(scan));
      addMealPhoto(dataUrl, scan.matched_name ?? scan.detected_name);
    } catch (e) {
      setAttachImage(dataUrl);
      setInput('I attached a food photo — please help me log it.');
      setError(e instanceof Error ? e.message : 'Food scan failed');
    } finally {
      setScanning(false);
    }
  }, []);

  return (
    <section className="section agent-section" aria-labelledby="agent-heading">
      <header className="agent-header">
        <div>
          <h1 id="agent-heading">Coach</h1>
          <p className="muted agent-subtitle">Chat, voice, and daily context</p>
        </div>
        <VoiceStatusOrb state={orbState} />
      </header>

      {!serverOnline && (
        <div className="banner banner-warn" role="alert">habits-api offline — context unavailable.</div>
      )}

      <AgentContextPanel context={context} onNavigateMealPlanSyncSource={onNavigateMealPlanSyncSource} />

      <AgentChatPanel messages={messages} loading={loading} listRef={listRef} />

      <AgentChatComposer
        serverOnline={serverOnline}
        loading={loading}
        scanning={scanning}
        input={input}
        attachImage={attachImage}
        onInputChange={setInput}
        onSubmit={() => void send()}
        onClearAttach={() => {
          setAttachImage(null);
          setInput('');
        }}
        onOpenCamera={() => setCameraOpen(true)}
        onOpenVoice={() => setVoiceOpen(true)}
      />

      <div className="agent-feed-label">Recent actions</div>
      <AgentActionFeed
        serverOnline={serverOnline}
        active
        onDataChange={() => void context.refresh()}
      />

      <BottomSheet open={cameraOpen} onClose={() => setCameraOpen(false)} title="Attach food photo">
        <CameraCapture
          facingMode="environment"
          placeholder="Point at your food"
          disabled={!serverOnline || scanning}
          onCapture={(url) => void handlePhotoCapture(url)}
        />
      </BottomSheet>

      <BottomSheet open={voiceOpen} onClose={() => setVoiceOpen(false)} title="Voice coach">
        {!voiceUiUrl ? (
          <p className="muted">Set VITE_VOICE_UI_URL in config.</p>
        ) : (
          <VoiceEmbed url={voiceUiUrl} agent="habits" onStatusChange={setVoiceIframeStatus} />
        )}
      </BottomSheet>

      {error && <div className="banner banner-warn" role="alert">{error}</div>}
    </section>
  );
}
