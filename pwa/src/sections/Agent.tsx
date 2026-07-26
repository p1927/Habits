import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraCapture } from '../components/CameraCapture';
import { getConfig } from '../lib/config';
import { api, type FoodScanResult } from '../lib/api';
import { toOrbVisual, type VoiceIframeStatus } from '../lib/voice-status';
import { addMealPhoto } from '../lib/mealPhotos';
import { AgentActionFeed } from '../components/AgentActionFeed';
import { AgentContextPanel } from '../components/AgentContextPanel';
import { VoiceEmbed } from '../components/VoiceEmbed';
import { VoiceStatusOrb } from '../components/VoiceStatusOrb';
import { BottomSheet } from '../components/ui/BottomSheet';
import { useAgentContext } from '../hooks/useAgentContext';
import { StreamingDots } from '../components/StreamingDots';

interface AgentProps {
  serverOnline: boolean;
}

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

const QUICK_PROMPTS = [
  { label: 'Log food', text: 'Help me log what I ate today' },
  { label: 'Habits', text: 'How am I doing on habits today?' },
  { label: 'Schedule', text: 'Add a calendar event for tomorrow' },
  { label: 'Health note', text: 'Add a note to my health cards' },
] as const;

function dataUrlToFile(dataUrl: string, name = 'chat-scan.jpg'): File {
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], name, { type: mime });
}

function scanSummary(scan: FoodScanResult): string {
  const name = scan.matched_name ?? scan.detected_name;
  const macros = scan.macros;
  const macroText = macros
    ? ` — ${macros.calories.toFixed(0)} kcal, ${macros.protein.toFixed(1)}g protein`
    : '';
  return `Log this food from my photo: ${name}, ${scan.suggested_grams}g${macroText}`;
}

export function Agent({ serverOnline }: AgentProps) {
  const { voiceUiUrl } = getConfig();
  const context = useAgentContext(serverOnline, true);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
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
    const userMsg: ChatMsg = { role: 'user', content: message, imageUrl };
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
      const scan = await api.scanFood(dataUrlToFile(dataUrl));
      setAttachImage(dataUrl);
      setInput(scanSummary(scan));
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

      <AgentContextPanel context={context} />

      <div className="agent-chat" ref={listRef} role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 && (
          <p className="muted agent-chat-empty">
            Ask me to log food, update habits, schedule events, or add health notes.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble chat-bubble--${m.role}`} aria-label={m.role === 'user' ? 'You' : 'Coach'}>
            {m.imageUrl && (
              <img src={m.imageUrl} alt="" className="chat-bubble-image" />
            )}
            {m.content}
          </div>
        ))}
        {loading && <StreamingDots />}
      </div>

      <div className="agent-tool-chips" role="group" aria-label="Quick prompts">
        {QUICK_PROMPTS.map(({ label, text }) => (
          <button
            key={label}
            type="button"
            className="agent-tool-chip"
            disabled={!serverOnline || loading || scanning}
            onClick={() => setInput(text)}
          >
            {label}
          </button>
        ))}
      </div>

      {attachImage && (
        <div className="agent-attach-preview">
          <img src={attachImage} alt="Attached food photo" className="agent-attach-thumb" />
          <button type="button" className="btn-small" onClick={() => { setAttachImage(null); setInput(''); }}>
            Remove
          </button>
        </div>
      )}

      <form
        className="agent-chat-input"
        aria-label="Send a message"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <label className="sr-only" htmlFor="agent-chat-input">Message</label>
        <input
          id="agent-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message your coach…"
          disabled={!serverOnline || loading || scanning}
        />
        <button type="submit" disabled={!serverOnline || loading || scanning || (!input.trim() && !attachImage)}>
          Send
        </button>
      </form>

      <div className="agent-actions-row">
        <button type="button" className="btn-secondary" onClick={() => setCameraOpen(true)} disabled={!serverOnline || scanning}>
          {scanning ? 'Scanning…' : 'Camera'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setVoiceOpen(true)}>
          Voice
        </button>
      </div>

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
