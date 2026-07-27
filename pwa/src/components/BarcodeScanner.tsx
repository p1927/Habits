import { useBarcodeScanner } from '../hooks/useBarcodeScanner';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  disabled?: boolean;
}

function BarcodeIcon() {
  return (
    <svg className="barcode-placeholder__icon" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 6h2v12H4V6Zm3 0h1v12H7V6Zm2 0h2v12H9V6Zm3 0h1v12h-1V6Zm2 0h3v12h-3V6Zm4 0h1v12h-1V6Zm2 0h2v12h-2V6Z"
      />
    </svg>
  );
}

export function BarcodeScanner({ onScan, disabled }: BarcodeScannerProps) {
  const {
    videoRef,
    live,
    manual,
    setManual,
    error,
    supported,
    stop,
    startScanner,
    submitManual,
  } = useBarcodeScanner({ onScan, disabled });

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
              <div className="barcode-placeholder">
                <BarcodeIcon />
                <p className="barcode-placeholder__text muted">
                  Scan a product barcode — Open Food Facts when not in your sheet
                </p>
              </div>
            )}
          </div>
          <div className="barcode-actions">
            {!live ? (
              <button type="button" className="btn-pill" onClick={() => void startScanner()} disabled={disabled}>
                Scan barcode
              </button>
            ) : (
              <button type="button" className="btn-pill btn-pill-outline" onClick={stop}>
                Stop scanner
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="muted">Barcode camera scan is not supported in this browser — enter the code manually.</p>
      )}

      <form className="barcode-manual" onSubmit={submitManual}>
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
        <button type="submit" className="btn-pill" disabled={disabled || !manual.trim()}>
          Look up
        </button>
      </form>

      {error && (
        <div className="banner banner-warn banner-revolut" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
