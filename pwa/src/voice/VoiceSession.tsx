import { useMemo } from 'react';
import {
  RoomAudioRenderer,
  SessionProvider,
  StartAudio,
  useSession,
  useSessionMessages,
  useSessionContext,
} from '@livekit/components-react';
import { TokenSource } from 'livekit-client';
import { getBearer, getConfig } from '../lib/config';
import { loadVoiceSettings } from '../lib/voice-settings';

function Transcript() {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  if (!messages.length) {
    return (
      <p className="muted">
        Speak after connecting — powered by local-voice-ai (Whisper + MiniMax + Kokoro)
      </p>
    );
  }
  return (
    <ul className="transcript-list">
      {messages.map((m) => (
        <li key={m.id} className={m.from?.isLocal ? 'msg-user' : 'msg-agent'}>
          <strong>{m.from?.isLocal ? 'You' : 'Agent'}:</strong> {m.message}
        </li>
      ))}
    </ul>
  );
}

function VoiceControls() {
  const session = useSessionContext();
  const connected = session.connectionState === 'connected';

  return (
    <div className="voice-controls">
      {!connected ? (
        <button type="button" className="mic-btn" onClick={() => void session.start()}>
          Connect voice
        </button>
      ) : (
        <button type="button" className="mic-btn mic-btn-active" onClick={() => void session.end()}>
          Disconnect
        </button>
      )}
      <p className="muted voice-status">Status: {session.connectionState}</p>
    </div>
  );
}

function VoiceSessionInner() {
  return (
    <>
      <VoiceControls />
      <div className="transcript card">
        <Transcript />
      </div>
      <StartAudio label="Enable audio" />
      <RoomAudioRenderer />
    </>
  );
}

function VoiceSessionActive() {
  const tokenSource = useMemo(
    () =>
      TokenSource.custom(async () => {
        const { apiUrl } = getConfig();
        const bearer = getBearer();
        if (!bearer) throw new Error('Set bearer token in Settings first');
        const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/connection-details`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearer}`,
          },
          body: JSON.stringify({ voice_pipeline: loadVoiceSettings() }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      }),
    [],
  );

  const session = useSession(tokenSource);

  return (
    <SessionProvider session={session}>
      <VoiceSessionInner />
    </SessionProvider>
  );
}

interface VoiceSessionProps {
  enabled: boolean;
}

export function VoiceSession({ enabled }: VoiceSessionProps) {
  if (!enabled) {
    return <div className="banner banner-warn">Mac server offline — voice unavailable.</div>;
  }
  return <VoiceSessionActive />;
}
