/** Voice iframe → parent postMessage protocol (local-voice-ai). */
export type VoiceIframeStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'error';

export interface VoiceIframeMessage {
  type: 'habits-voice';
  status: VoiceIframeStatus;
  detail?: string;
}

export function parseVoiceIframeMessage(data: unknown): VoiceIframeStatus | null {
  if (!data || typeof data !== 'object') return null;
  const msg = data as Record<string, unknown>;
  if (msg.type !== 'habits-voice') return null;
  const status = msg.status;
  if (
    status === 'idle' ||
    status === 'connecting' ||
    status === 'connected' ||
    status === 'listening' ||
    status === 'thinking' ||
    status === 'speaking' ||
    status === 'error'
  ) {
    return status;
  }
  return null;
}

/** Map iframe status to orb visual state. */
export type VoiceOrbVisualState = 'idle' | 'active' | 'listening' | 'thinking' | 'speaking' | 'error';

export function toOrbVisual(status: VoiceIframeStatus | null, serverOnline: boolean): VoiceOrbVisualState {
  if (!serverOnline) return 'idle';
  if (!status || status === 'idle') return 'idle';
  if (status === 'connecting' || status === 'connected') return 'active';
  if (status === 'listening') return 'listening';
  if (status === 'thinking') return 'thinking';
  if (status === 'speaking') return 'speaking';
  if (status === 'error') return 'error';
  return 'active';
}
