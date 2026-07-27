import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { parseVoiceIframeMessage, type VoiceIframeStatus } from '../lib/voiceStatus';

interface VoiceEmbedProps {
  url: string;
  agent?: string;
  onStatusChange?: (status: VoiceIframeStatus) => void;
  /** Keep iframe mounted and listening while parent is visually hidden (header orb sync). */
  persist?: boolean;
}

/** Embeds the local-voice-ai frontend (Docker, default :8080). */
export function VoiceEmbed({ url, agent = 'habits', onStatusChange, persist = false }: VoiceEmbedProps) {
  const [expanded, setExpanded] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const src = useMemo(() => {
    if (!url) return '';
    try {
      const u = new URL(url);
      if (agent) u.searchParams.set('agent', agent);
      return u.toString();
    } catch {
      const sep = url.includes('?') ? '&' : '?';
      return agent ? `${url}${sep}agent=${encodeURIComponent(agent)}` : url;
    }
  }, [url, agent]);

  const voiceOrigin = useMemo(() => {
    try {
      return src ? new URL(src).origin : '';
    } catch {
      return '';
    }
  }, [src]);

  const sendSubscribe = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'habits-voice-parent', action: 'subscribe' },
      voiceOrigin,
    );
  }, [voiceOrigin]);

  useEffect(() => {
    if (!onStatusChangeRef.current || !voiceOrigin) return;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== voiceOrigin) return;
      const status = parseVoiceIframeMessage(event.data);
      if (status) onStatusChangeRef.current?.(status);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [voiceOrigin]);

  useEffect(() => {
    if (!expanded && !persist) return;
    sendSubscribe();
  }, [src, voiceOrigin, expanded, persist, sendSubscribe]);

  if (!src) return null;

  const showIframe = persist || expanded;

  return (
    <div className={`voice-embed-section ${showIframe ? 'voice-embed-expanded' : 'voice-embed-collapsed'}`}>
      {!persist && (
        <button
          type="button"
          className="voice-embed-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? 'Hide voice controls' : 'Show voice controls'}
        </button>
      )}
      {showIframe && (
        <div className="voice-embed-wrap">
          <iframe
            ref={iframeRef}
            src={src}
            title="Voice agent (local-voice-ai)"
            className="voice-embed"
            allow="microphone *; camera *; autoplay; display-capture"
            onLoad={() => {
              sendSubscribe();
              onStatusChangeRef.current?.('connecting');
            }}
          />
        </div>
      )}
    </div>
  );
}
