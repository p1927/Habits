import { useCameraCaptureActions } from './useCameraCaptureActions';
import { useCameraCaptureStream } from './useCameraCaptureStream';

export interface UseCameraCaptureOptions {
  onCapture: (dataUrl: string) => void;
  disabled?: boolean;
  facingMode?: 'user' | 'environment';
}

export function useCameraCapture({ onCapture, disabled, facingMode = 'user' }: UseCameraCaptureOptions) {
  const stream = useCameraCaptureStream({ disabled, facingMode });
  const actions = useCameraCaptureActions(stream, onCapture);

  return {
    videoRef: stream.videoRef,
    preview: actions.preview,
    live: stream.live,
    videoReady: stream.videoReady,
    error: stream.error,
    startCamera: actions.startCamera,
    stopCamera: stream.stopCamera,
    takePhoto: actions.takePhoto,
    handleFile: actions.handleFile,
    retake: actions.retake,
  };
}
