import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { parseVoiceIframeMessage, type VoiceIframeStatus } from '../lib/voiceStatus';

interface VoiceEmbedProps {
  url: string;
  agent?: string;
  onStatusChange?: (status: VoiceIframeStatus) => void;
}

/** Embeds the local-voice-ai frontend (Docker, default :8080). */
export function VoiceEmbed({ url, agent = 'habits', onStatusChange }: VoiceEmbedProps) {
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
    if (!expanded) return;
    sendSubscribe();
  }, [src, voiceOrigin, expanded, sendSubscribe]);

  if (!src) return null;

  return (
    <div className={`voice-embed-section ${expanded ? 'voice-embed-expanded' : 'voice-embed-collapsed'}`}>
      <button
        type="button"
        className="voice-embed-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? 'Hide voice controls' : 'Show voice controls'}
      </button>
      {expanded && (
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
