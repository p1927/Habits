import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import type { VoiceIframeStatus } from '../lib/voiceStatus';
import type { VoiceLiveKitSession } from './VoiceLiveKitRoom';
const VoiceLiveKitRoom = lazy(() => import('./VoiceLiveKitRoom').then((m) => ({ default: m.VoiceLiveKitRoom })));
export function VoiceCoachLayer({ open, serverOnline, onClose, onStatusChange }: { open: boolean; serverOnline: boolean; onClose: () => void; onStatusChange: (s: VoiceIframeStatus) => void }) {
  const [session, setSession] = useState<VoiceLiveKitSession | null>(null);
  const [error, setError] = useState('');
  const sessionRef = useRef<VoiceLiveKitSession | null>(null);
  const ensureSession = useCallback(async () => {
    if (!serverOnline) return;
    if (sessionRef.current) { setSession(sessionRef.current); return; }
    try { setError(''); const next = await api.getVoiceToken(); sessionRef.current = next; setSession(next); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not connect voice'); onStatusChange('error'); }
  }, [serverOnline, onStatusChange]);
  useEffect(() => { if (open || sessionRef.current) void ensureSession(); }, [open, ensureSession]);
  useEffect(() => { if (!open) return; const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden'; return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; }; }, [open, onClose]);
  const connected = Boolean(session);
  return (<div className={`voice-coach-root ${open ? 'voice-coach-root--open' : 'voice-coach-root--persist'}`}>{open && <button type="button" className="voice-coach-scrim" aria-label="Close voice coach" onClick={onClose} />}<div className="voice-coach-panel" role={open ? 'dialog' : undefined} aria-modal={open || undefined} aria-label={open ? 'Voice coach' : undefined} aria-hidden={open ? undefined : true}>{open && (<><div className="ui-sheet__handle" /><h2 className="ui-sheet__title">Voice coach</h2></>)}{error && open && <p className="muted voice-livekit-error">{error}</p>}{connected && session && (<Suspense fallback={open ? <p className="muted">Loading voice…</p> : null}><VoiceLiveKitRoom session={session} active={connected} onStatusChange={onStatusChange} /></Suspense>)}{!connected && open && !error && <p className="muted">Connecting to voice coach…</p>}{open && <p className="muted agent-voice-sheet-hint">Press Escape to close</p>}</div></div>);
}
