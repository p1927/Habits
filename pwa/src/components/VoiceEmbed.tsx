import { useEffect, useMemo, useRef, useState } from 'react';
import type { VoiceIframeStatus } from '../lib/voice-status';

interface VoiceEmbedProps {
  url: string;
  agent?: string;
  onStatusChange?: (status: VoiceIframeStatus) => void;
}

/** Embeds the local-voice-ai frontend (Docker, default :8080). */
export function VoiceEmbed({ url, agent = 'habits', onStatusChange }: VoiceEmbedProps) {
  const [expanded, setExpanded] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  useEffect(() => {
    if (!onStatusChange || !voiceOrigin) return;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== voiceOrigin) return;
      const data = event.data as { type?: string; status?: VoiceIframeStatus };
      if (data?.type === 'habits-voice' && data.status) {
        onStatusChange(data.status);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onStatusChange, voiceOrigin]);

  useEffect(() => {
    if (!iframeRef.current?.contentWindow || !voiceOrigin) return;
    iframeRef.current.contentWindow.postMessage(
      { type: 'habits-voice-parent', action: 'subscribe' },
      voiceOrigin,
    );
  }, [src, voiceOrigin, expanded]);

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
          />
        </div>
      )}
    </div>
  );
}
