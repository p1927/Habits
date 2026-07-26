import { useCallback, useRef, useState } from 'react';
import { getConfig } from '../lib/config';
import { api } from '../lib/api';
import { toOrbVisual } from '../lib/voice-status';
import { useVoiceIframeStatus } from '../hooks/useVoiceIframeStatus';
import { AgentActionFeed } from '../components/AgentActionFeed';
import { AgentContextPanel } from '../components/AgentContextPanel';
import { VoiceEmbed } from '../components/VoiceEmbed';
import { VoiceStatusOrb } from '../components/VoiceStatusOrb';
import { BottomSheet } from '../components/ui/BottomSheet';
import { useAgentContext } from '../hooks/useAgentContext';

interface AgentProps {
  serverOnline: boolean;
}

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export function Agent({ serverOnline }: AgentProps) {
  const { voiceUiUrl } = getConfig();
  const context = useAgentContext(serverOnline, true);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const iframeVoiceStatus = useVoiceIframeStatus(voiceUiUrl, voiceOpen);
  const orbState = toOrbVisual(iframeVoiceStatus, serverOnline);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || !serverOnline) return;
    setInput('');
    setLoading(true);
    setError('');
    const userMsg: ChatMsg = { role: 'user', content: text };
    setMessages((m) => [...m, userMsg]);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.agentChat(text, history);
      setMessages((m) => [...m, { role: 'assistant', content: res.reply || 'Done.' }]);
      if (res.tool_results.length) void context.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chat failed');
    } finally {
      setLoading(false);
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [input, serverOnline, messages, context]);

  return (
    <section className="section agent-section" aria-labelledby="agent-heading">
      <header className="agent-header">
        <div>
          <h1 id="agent-heading">Coach</h1>
          <p className="muted agent-subtitle">Chat, voice, and daily context</p>
        </div>
        <VoiceStatusOrb state={voiceOpen ? orbState : toOrbVisual(null, serverOnline)} />
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
            {m.content}
          </div>
        ))}
        {loading && <div className="chat-bubble chat-bubble--assistant" role="status">Thinking…</div>}
      </div>

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
          disabled={!serverOnline || loading}
        />
        <button type="submit" disabled={!serverOnline || loading || !input.trim()}>
          Send
        </button>
      </form>

      <div className="agent-actions-row">
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

      <BottomSheet open={voiceOpen} onClose={() => setVoiceOpen(false)} title="Voice coach">
        {!voiceUiUrl ? (
          <p className="muted">Set VITE_VOICE_UI_URL in config.</p>
        ) : (
          <VoiceEmbed url={voiceUiUrl} agent="habits" />
        )}
      </BottomSheet>

      {error && <div className="banner banner-warn" role="alert">{error}</div>}
    </section>
  );
}
