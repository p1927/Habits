import { useCallback, useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  disabled?: boolean;
}

function barcodeSupported(): boolean {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window;
}

export function BarcodeScanner({ onScan, disabled }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const rafRef = useRef<number | null>(null);
  const [live, setLive] = useState(false);
  const [manual, setManual] = useState('');
  const [error, setError] = useState('');
  const supported = barcodeSupported();

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    for (const t of streamRef.current?.getTracks() ?? []) t.stop();
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

  async function startScanner() {
    if (disabled || !supported) return;
    setError('');
    stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      detectorRef.current = new BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
      });
      setLive(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Camera access denied');
    }
  }

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!live || !video || !stream) return;

    video.srcObject = stream;
    void video.play().then(() => {
      rafRef.current = requestAnimationFrame(() => void scanFrame());
    }).catch((e: unknown) => {
      setError(e instanceof Error ? e.message : 'Could not start barcode scanner');
    });

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [live, scanFrame]);

  return (
    <div className="barcode-scanner">
      {supported ? (
        <>
          <div className="barcode-preview-wrap">
            <video
              ref={videoRef}
              className={`barcode-preview ${live ? 'barcode-preview-live' : 'barcode-preview-hidden'}`}
              playsInline
              muted
              autoPlay
            />
            {!live && (
              <div className="barcode-placeholder muted">
                Scan a product barcode — Open Food Facts when not in your sheet
              </div>
            )}
          </div>
          <div className="barcode-actions">
            {!live ? (
              <button type="button" onClick={() => void startScanner()} disabled={disabled}>
                Scan barcode
              </button>
            ) : (
              <button type="button" onClick={stop}>
                Stop scanner
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="muted">Barcode camera scan is not supported in this browser — enter the code manually.</p>
      )}

      <form
        className="barcode-manual"
        onSubmit={(e) => {
          e.preventDefault();
          if (!manual.trim()) return;
          handleDetected(manual.trim());
          setManual('');
        }}
      >
        <label className="field">
          Barcode number
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="EAN / UPC"
            inputMode="numeric"
            disabled={disabled}
          />
        </label>
        <button type="submit" disabled={disabled || !manual.trim()}>
          Look up
        </button>
      </form>

      {error && <div className="banner banner-warn" role="alert">{error}</div>}
    </div>
  );
}
