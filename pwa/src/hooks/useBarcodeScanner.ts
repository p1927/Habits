import { useCallback, useEffect, useRef, useState } from 'react';
import { BARCODE_DETECTOR_FORMATS, isBarcodeDetectorSupported } from '../lib/barcodeScannerSupport';
import { stopMediaStream } from '../lib/cameraCaptureFrame';

interface UseBarcodeScannerOptions {
  onScan: (code: string) => void;
  disabled?: boolean;
}

export function useBarcodeScanner({ onScan, disabled }: UseBarcodeScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const rafRef = useRef<number | null>(null);
  const [live, setLive] = useState(false);
  const [manual, setManual] = useState('');
  const [error, setError] = useState('');
  const supported = isBarcodeDetectorSupported();

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setLive(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const handleDetected = useCallback(
    (code: string) => {
      stop();
      onScan(code.trim());
    },
    [onScan, stop],
  );

  const scanFrame = useCallback(async () => {
    const video = videoRef.current;
    const detector = detectorRef.current;
    if (!video || !detector || video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(() => void scanFrame());
      return;
    }
    try {
      const codes = await detector.detect(video);
      if (codes.length > 0 && codes[0].rawValue) {
        handleDetected(codes[0].rawValue);
        return;
      }
    } catch {
      // keep scanning
    }
    rafRef.current = requestAnimationFrame(() => void scanFrame());
  }, [handleDetected]);

  const startScanner = useCallback(async () => {
    if (disabled || !supported) return;
    setError('');
    stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      detectorRef.current = new BarcodeDetector({ formats: [...BARCODE_DETECTOR_FORMATS] });
      setLive(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Camera access denied');
    }
  }, [disabled, supported, stop]);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!live || !video || !stream) return;

    video.srcObject = stream;
    void video
      .play()
      .then(() => {
        rafRef.current = requestAnimationFrame(() => void scanFrame());
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Could not start barcode scanner');
      });

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [live, scanFrame]);

  const submitManual = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!manual.trim()) return;
      handleDetected(manual.trim());
      setManual('');
    },
    [handleDetected, manual],
  );

  return {
    videoRef,
    live,
    manual,
    setManual,
    error,
    supported,
    stop,
    startScanner,
    submitManual,
  };
}
