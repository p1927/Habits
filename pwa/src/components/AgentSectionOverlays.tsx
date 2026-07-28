import { CameraCapture } from './CameraCapture';
import { AgentAttachSheet } from './AgentAttachSheet';
import { AgentToolsSheet } from './AgentToolsSheet';
import { VoiceCoachLayer } from './VoiceCoachLayer';
import { BottomSheet } from './ui/BottomSheet';
import { focusAgentComposer } from '../hooks/useAgentComposerFocusShortcut';
import type { MealPhoto } from '../lib/mealPhotos';
import type { VoiceIframeStatus } from '../lib/voiceStatus';
export function AgentSectionOverlays(p: { voiceOpen: boolean; onVoiceOpenChange: (o: boolean) => void; onVoiceStatusChange: (s: VoiceIframeStatus | null) => void; toolsOpen: boolean; onToolsOpenChange: (o: boolean) => void; onSelectToolPrompt: (t: string) => void; attachOpen: boolean; onAttachOpenChange: (o: boolean) => void; cameraOpen: boolean; onCameraOpenChange: (o: boolean) => void; recentPhotos: MealPhoto[]; onPickImage: (d: string, l?: string) => void; onCapture: (d: string) => void; serverOnline: boolean; scanning: boolean }) {
  const closeAttachSheet = (opts?: { focusComposer?: boolean }) => {
    p.onAttachOpenChange(false);
    if (opts?.focusComposer !== false) {
      requestAnimationFrame(() => focusAgentComposer());
    }
  };
  return (<><AgentToolsSheet open={p.toolsOpen} onClose={() => p.onToolsOpenChange(false)} onSelect={p.onSelectToolPrompt} /><AgentAttachSheet open={p.attachOpen} onClose={closeAttachSheet} recentPhotos={p.recentPhotos} onOpenCamera={() => p.onCameraOpenChange(true)} onPickImage={p.onPickImage} /><BottomSheet open={p.cameraOpen} onClose={() => p.onCameraOpenChange(false)} title="Camera"><CameraCapture facingMode="environment" placeholder="Point at your food" disabled={!p.serverOnline || p.scanning} onCapture={p.onCapture} /><p className="muted agent-camera-sheet-hint">Press Escape to close</p></BottomSheet>{p.serverOnline ? <VoiceCoachLayer open={p.voiceOpen} serverOnline={p.serverOnline} onClose={() => p.onVoiceOpenChange(false)} onStatusChange={p.onVoiceStatusChange} /> : <BottomSheet open={p.voiceOpen} onClose={() => p.onVoiceOpenChange(false)} title="Voice coach"><p className="muted">Connect to the Habits server to use voice coach.</p></BottomSheet>}</>);
}
