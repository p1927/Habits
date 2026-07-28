import { useEffect } from 'react';
import { getConfig } from '../lib/config';
import type { VoiceIframeStatus } from '../lib/voiceStatus';
import { VoiceEmbed } from './VoiceEmbed';

export function VoiceCoachLayer({
  open,
  serverOnline,
  onClose,
  onStatusChange,
}: {
  open: boolean;
  serverOnline: boolean;
  onClose: () => void;
  onStatusChange: (s: VoiceIframeStatus) => void;
}) {
  const { voiceUiUrl } = getConfig();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!serverOnline) return null;

  return (
    <div
      className={`voice-coach-root ${open ? 'voice-coach-root--open' : 'voice-coach-root--persist'}`}
    >
      {open && (
        <button type="button" className="voice-coach-scrim" aria-label="Close voice coach" onClick={onClose} />
      )}
      <div
        className="voice-coach-panel"
        role={open ? 'dialog' : undefined}
        aria-modal={open || undefined}
        aria-label={open ? 'Voice coach' : undefined}
        aria-hidden={open ? undefined : true}
      >
        {open && (
          <>
            <div className="ui-sheet__handle" />
            <h2 className="ui-sheet__title">Voice coach</h2>
            <p className="muted voice-coach-lede">
              Talk hands-free about food, habits, and your schedule. Coach uses today&apos;s context from your rings and calendar.
            </p>
            <p className="voice-coach-legend muted">
              Tap the mic to start — you can interrupt anytime. Your voice stays on this device until you send a message.
            </p>
          </>
        )}
        {voiceUiUrl ? (
          <VoiceEmbed
            url={voiceUiUrl}
            agent="habits"
            onStatusChange={onStatusChange}
            persist={!open}
            expanded={open}
          />
        ) : (
          open && (
            <p className="muted voice-livekit-error" role="alert">
              Set <code>VITE_VOICE_UI_URL</code> (default http://localhost:8080) and run{' '}
              <code>bash scripts/up-with-voice.sh</code>.
            </p>
          )
        )}
        {open && <p className="muted agent-voice-sheet-hint">Press Escape to close</p>}
      </div>
    </div>
  );
}
