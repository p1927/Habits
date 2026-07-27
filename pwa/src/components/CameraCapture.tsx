import { useCameraCapture } from '../hooks/useCameraCapture';

export interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  disabled?: boolean;
  /** 'environment' = rear camera (food scan); 'user' = selfie */
  facingMode?: 'user' | 'environment';
  placeholder?: string;
}

function CameraIcon() {
  return (
    <svg className="camera-placeholder__icon" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
      <path
        fill="currentColor"
        d="M9.5 4.5 8.25 6H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-3.25L14.5 4.5h-5ZM12 17a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
      />
    </svg>
  );
}

export function CameraCapture({
  onCapture,
  disabled,
  facingMode = 'user',
  placeholder = 'Take a photo',
}: CameraCaptureProps) {
  const {
    videoRef,
    preview,
    live,
    videoReady,
    error,
    startCamera,
    stopCamera,
    takePhoto,
    handleFile,
    retake,
  } = useCameraCapture({ onCapture, disabled, facingMode });

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
              <div className="camera-preview camera-placeholder" aria-hidden={live}>
                <CameraIcon />
                <p className="camera-placeholder__text muted">{placeholder}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="camera-actions">
        {!live && !preview && (
          <button type="button" className="btn-pill" onClick={() => void startCamera()} disabled={disabled}>
            Open camera
          </button>
        )}
        {live && (
          <>
            <button type="button" className="btn-pill" onClick={takePhoto} disabled={!videoReady}>
              {videoReady ? 'Capture' : 'Starting camera…'}
            </button>
            <button type="button" className="btn-pill btn-pill-outline" onClick={stopCamera}>
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
          <button type="button" className="btn-pill btn-pill-outline" onClick={retake} disabled={disabled}>
            Retake
          </button>
        )}
      </div>
      {error && <div className="banner banner-warn banner-revolut">{error}</div>}
    </div>
  );
}
