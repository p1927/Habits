import { useEffect, useRef, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  disabled?: boolean;
  /** 'environment' = rear camera (food scan); 'user' = selfie */
  facingMode?: 'user' | 'environment';
  placeholder?: string;
}

export function CameraCapture({
  onCapture,
  disabled,
  facingMode = 'user',
  placeholder = 'Take a photo',
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      for (const t of streamRef.current?.getTracks() ?? []) t.stop();
      streamRef.current = null;
    };
  }, []);

  // Video stays mounted; attach stream after live=true so the ref exists.
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

  function stopCamera() {
    for (const t of streamRef.current?.getTracks() ?? []) t.stop();
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
    setLive(false);
    setVideoReady(false);
  }

  async function startCamera() {
    if (disabled) return;
    setError('');
    stopCamera();
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 720 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setPreview(null);
      setLive(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Camera access denied');
    }
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera not ready yet — wait a moment and try again');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPreview(dataUrl);
    stopCamera();
    onCapture(dataUrl);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    stopCamera();
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (result) {
        setPreview(result);
        onCapture(result);
      }
    };
    reader.onerror = () => setError('Could not read that image file');
    reader.readAsDataURL(file);
  }

  return (
    <div className="camera-section">
      <div className="camera-preview-wrap">
        {preview ? (
          <img src={preview} alt="Your baseline photo" className="camera-preview" />
        ) : (
          <>
            <video
              ref={videoRef}
              className={`camera-preview ${live ? 'camera-preview-live' : 'camera-preview-hidden'}`}
              playsInline
              muted
              autoPlay
            />
            {!live && (
              <div className="camera-preview card-placeholder camera-placeholder">
                <p className="muted">{placeholder}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="camera-actions">
        {!live && !preview && (
          <button type="button" onClick={() => void startCamera()} disabled={disabled}>
            Open camera
          </button>
        )}
        {live && (
          <>
            <button type="button" onClick={takePhoto} disabled={!videoReady}>
              {videoReady ? 'Capture' : 'Starting camera…'}
            </button>
            <button type="button" onClick={stopCamera}>
              Cancel
            </button>
          </>
        )}
        <label className="btn-link camera-file-input-label">
          Upload photo
          <input
            type="file"
            accept="image/*"
            className="camera-file-input"
            onChange={handleFile}
            disabled={disabled}
          />
        </label>
        {preview && (
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              void startCamera();
            }}
            disabled={disabled}
          >
            Retake
          </button>
        )}
      </div>
      {error && <div className="banner banner-warn banner-revolut">{error}</div>}
    </div>
  );
}
