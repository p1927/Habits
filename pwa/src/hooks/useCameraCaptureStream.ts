import { useCallback, useEffect, useRef, useState } from 'react';
import { stopMediaStream } from '../lib/cameraCaptureFrame';

export interface UseCameraCaptureStreamOptions {
  disabled?: boolean;
  facingMode?: 'user' | 'environment';
}

export function useCameraCaptureStream({ disabled, facingMode = 'user' }: UseCameraCaptureStreamOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [live, setLive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      stopMediaStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!live || !video || !stream) return;

    setVideoReady(false);
    video.srcObject = stream;

    const markReady = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setVideoReady(true);
      }
    };

    video.addEventListener('loadedmetadata', markReady);
    video.addEventListener('resize', markReady);

    void video.play().then(markReady).catch((e: unknown) => {
      setError(e instanceof Error ? e.message : 'Could not start camera preview');
    });

    return () => {
      video.removeEventListener('loadedmetadata', markReady);
      video.removeEventListener('resize', markReady);
    };
  }, [live]);

  const stopCamera = useCallback(() => {
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
    setLive(false);
    setVideoReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (disabled) return;
    setError('');
    stopCamera();
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 720 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setLive(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Camera access denied');
    }
  }, [disabled, facingMode, stopCamera]);

  return {
    videoRef,
    live,
    videoReady,
    error,
    setError,
    setLive,
    stopCamera,
    startCamera,
  };
}
