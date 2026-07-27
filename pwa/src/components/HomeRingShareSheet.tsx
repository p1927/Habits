import { BottomSheet } from './ui/BottomSheet';

interface HomeRingShareSheetProps {
  previewUrl: string | null;
  onClose: () => void;
  onDownload: () => void;
}

export function HomeRingShareSheet({ previewUrl, onClose, onDownload }: HomeRingShareSheetProps) {
  return (
    <BottomSheet open={previewUrl != null} onClose={onClose} title="Share rings">
      {previewUrl && (
        <div className="home-ring-share-sheet">
          <img
            src={previewUrl}
            alt="Activity rings share preview"
            className="home-ring-share-sheet__preview"
          />
          <div className="home-ring-share-sheet__actions">
            <button type="button" className="btn-pill" onClick={onDownload}>
              Save PNG
            </button>
            <button type="button" className="btn-pill btn-pill-outline" onClick={onClose}>
              Close
            </button>
          </div>
          <p className="muted home-ring-share-sheet__hint">Press Escape to close</p>
        </div>
      )}
    </BottomSheet>
  );
}
