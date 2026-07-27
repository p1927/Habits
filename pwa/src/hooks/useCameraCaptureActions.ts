import { useCallback, useState } from 'react';
import { captureVideoFrame, readImageFileAsDataUrl } from '../lib/cameraCaptureFrame';
import type { useCameraCaptureStream } from './useCameraCaptureStream';

type CameraStream = ReturnType<typeof useCameraCaptureStream>;

export function useCameraCaptureActions(
  stream: CameraStream,
  onCapture: (dataUrl: string) => void,
) {
  const [preview, setPreview] = useState<string | null>(null);

  const takePhoto = useCallback(() => {
    const video = stream.videoRef.current;
    if (!video) return;
    const dataUrl = captureVideoFrame(video);
    if (!dataUrl) {
      stream.setError('Camera not ready yet — wait a moment and try again');
      return;
    }
    setPreview(dataUrl);
    stream.stopCamera();
    onCapture(dataUrl);
  }, [onCapture, stream]);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      stream.stopCamera();
      readImageFileAsDataUrl(
        file,
        (result) => {
          setPreview(result);
          onCapture(result);
        },
        stream.setError,
      );
    },
    [onCapture, stream],
  );

  const retake = useCallback(() => {
    setPreview(null);
    void stream.startCamera();
  }, [stream]);

  const startCamera = useCallback(async () => {
    setPreview(null);
    await stream.startCamera();
  }, [stream]);

  return {
    preview,
    takePhoto,
    handleFile,
    retake,
    startCamera,
  };
}
