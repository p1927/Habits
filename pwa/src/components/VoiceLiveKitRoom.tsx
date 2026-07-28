import '@livekit/components-styles';
import { useEffect } from 'react';
import { LiveKitRoom, RoomAudioRenderer, VoiceAssistantControlBar, useConnectionState, useVoiceAssistant } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import type { VoiceIframeStatus } from '../lib/voiceStatus';
export interface VoiceLiveKitSession { token: string; url: string; room: string; }
function mapState(c: ConnectionState, a?: string): VoiceIframeStatus {
  if (c === ConnectionState.Connecting || c === ConnectionState.Reconnecting) return 'connecting';
  if (c === ConnectionState.Disconnected) return 'idle';
  if (a === 'listening') return 'listening';
  if (a === 'thinking' || a === 'initializing') return 'thinking';
  if (a === 'speaking') return 'speaking';
  return 'connected';
}
function Bridge({ onStatusChange }: { onStatusChange?: (s: VoiceIframeStatus) => void }) {
  const c = useConnectionState(); const { state: a } = useVoiceAssistant();
  useEffect(() => { onStatusChange?.(mapState(c, a)); }, [c, a, onStatusChange]);
  return null;
}
export function VoiceLiveKitRoom({ session, active, onStatusChange }: { session: VoiceLiveKitSession; active: boolean; onStatusChange?: (s: VoiceIframeStatus) => void }) {
  if (!active) return null;
  return (<div className="voice-livekit-room"><LiveKitRoom token={session.token} serverUrl={session.url} connect={active} audio video={false}><Bridge onStatusChange={onStatusChange} /><RoomAudioRenderer /><VoiceAssistantControlBar controls={{ leave: false, microphone: true }} /></LiveKitRoom></div>);
}
