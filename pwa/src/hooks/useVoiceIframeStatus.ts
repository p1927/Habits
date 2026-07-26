import { useEffect, useState } from 'react';
import { parseVoiceIframeMessage, type VoiceIframeStatus } from '../lib/voice-status';

function originMatchesVoiceUrl(eventOrigin: string, voiceUiUrl: string): boolean {
  if (!voiceUiUrl) return false;
  try {
    const allowed = new URL(voiceUiUrl).origin;
    return eventOrigin === allowed;
  } catch {
    return false;
  }
}

/**
 * Listens for postMessage from local-voice-ai iframe.
 * Expected payload: { type: 'habits-voice', status: 'listening' | ... }
 */
export function useVoiceIframeStatus(voiceUiUrl: string, enabled = true): VoiceIframeStatus | null {
  const [status, setStatus] = useState<VoiceIframeStatus | null>(null);

  useEffect(() => {
    if (!enabled || !voiceUiUrl) {
      setStatus(null);
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (!originMatchesVoiceUrl(event.origin, voiceUiUrl)) return;
      const parsed = parseVoiceIframeMessage(event.data);
      if (parsed) setStatus(parsed);
    };

    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      setStatus(null);
    };
  }, [voiceUiUrl, enabled]);

  return status;
}
