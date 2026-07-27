import { CameraCapture } from './CameraCapture';
import { AgentAttachSheet } from './AgentAttachSheet';
import { AgentToolsSheet } from './AgentToolsSheet';
import { VoiceCoachLayer } from './VoiceCoachLayer';
import { BottomSheet } from './ui/BottomSheet';
import type { MealPhoto } from '../lib/mealPhotos';
import type { VoiceIframeStatus } from '../lib/voiceStatus';

interface AgentSectionOverlaysProps {
  voiceUiUrl: string | undefined;
  voiceOpen: boolean;
  onVoiceOpenChange: (open: boolean) => void;
  onVoiceStatusChange: (status: VoiceIframeStatus | null) => void;
  toolsOpen: boolean;
  onToolsOpenChange: (open: boolean) => void;
  onSelectToolPrompt: (prompt: string) => void;
  attachOpen: boolean;
  onAttachOpenChange: (open: boolean) => void;
  cameraOpen: boolean;
  onCameraOpenChange: (open: boolean) => void;
  recentPhotos: MealPhoto[];
  onPickImage: (dataUrl: string, label?: string) => void;
  onCapture: (dataUrl: string) => void;
  serverOnline: boolean;
  scanning: boolean;
}

export function AgentSectionOverlays({
  voiceUiUrl,
  voiceOpen,
  onVoiceOpenChange,
  onVoiceStatusChange,
  toolsOpen,
  onToolsOpenChange,
  onSelectToolPrompt,
  attachOpen,
  onAttachOpenChange,
  cameraOpen,
  onCameraOpenChange,
  recentPhotos,
  onPickImage,
  onCapture,
  serverOnline,
  scanning,
}: AgentSectionOverlaysProps) {
  return (
    <>
      <AgentToolsSheet open={toolsOpen} onClose={() => onToolsOpenChange(false)} onSelect={onSelectToolPrompt} />

      <AgentAttachSheet
        open={attachOpen}
        onClose={() => onAttachOpenChange(false)}
        recentPhotos={recentPhotos}
        onOpenCamera={() => onCameraOpenChange(true)}
        onPickImage={onPickImage}
      />

      <BottomSheet open={cameraOpen} onClose={() => onCameraOpenChange(false)} title="Camera">
        <CameraCapture
          facingMode="environment"
          placeholder="Point at your food"
          disabled={!serverOnline || scanning}
          onCapture={onCapture}
        />
        <p className="muted agent-camera-sheet-hint">Press Escape to close</p>
      </BottomSheet>

      {voiceUiUrl ? (
        <VoiceCoachLayer
          url={voiceUiUrl}
          open={voiceOpen}
          onClose={() => onVoiceOpenChange(false)}
          onStatusChange={onVoiceStatusChange}
        />
      ) : (
        <BottomSheet open={voiceOpen} onClose={() => onVoiceOpenChange(false)} title="Voice coach">
          <p className="muted">Set VITE_VOICE_UI_URL in config.</p>
        </BottomSheet>
      )}
    </>
  );
}
