import { useEffect } from 'react';
import { VoiceEmbed } from './VoiceEmbed';
import type { VoiceIframeStatus } from '../lib/voiceStatus';

interface VoiceCoachLayerProps {
  url: string;
  open: boolean;
  onClose: () => void;
  onStatusChange: (status: VoiceIframeStatus) => void;
}

/** Persistent voice iframe — stays mounted when closed so the header orb reflects mic state. */
export function VoiceCoachLayer({ url, open, onClose, onStatusChange }: VoiceCoachLayerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div className={`voice-coach-root ${open ? 'voice-coach-root--open' : 'voice-coach-root--persist'}`}>
      {open && (
        <button
          type="button"
          className="voice-coach-scrim"
          aria-label="Close voice coach"
          onClick={onClose}
        />
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
          </>
        )}
        <VoiceEmbed url={url} agent="habits" onStatusChange={onStatusChange} />
      </div>
    </div>
  );
}
