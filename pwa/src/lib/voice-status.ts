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
  micActive?: boolean;
  detail?: string;
}

export function parseVoiceIframeMessage(data: unknown): VoiceIframeStatus | null {
  if (!data || typeof data !== 'object') return null;
  const msg = data as Record<string, unknown>;

  if (msg.type === 'habits-voice') {
    if (msg.micActive === true) return 'listening';
    if (typeof msg.status === 'string') return normalizeVoiceStatus(msg.status);
  }

  if (msg.source === 'local-voice-ai' && typeof msg.phase === 'string') {
    return normalizeVoiceStatus(msg.phase);
  }

  if (msg.type === 'voice-status' && typeof msg.state === 'string') {
    return normalizeVoiceStatus(msg.state);
  }

  return null;
}

function normalizeVoiceStatus(raw: string): VoiceIframeStatus | null {
  const status = raw.toLowerCase();
  if (status === 'mic_on' || status === 'mic-on' || status === 'recording') return 'listening';
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
