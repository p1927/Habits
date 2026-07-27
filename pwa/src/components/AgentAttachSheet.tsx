import { useRef } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import type { MealPhoto } from '../lib/mealPhotos';

interface AgentAttachSheetProps {
  open: boolean;
  onClose: () => void;
  recentPhotos: MealPhoto[];
  onOpenCamera: () => void;
  onPickImage: (dataUrl: string, label?: string) => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function AgentAttachSheet({
  open,
  onClose,
  recentPhotos,
  onOpenCamera,
  onPickImage,
}: AgentAttachSheetProps) {
  const galleryRef = useRef<HTMLInputElement>(null);

  return (
    <BottomSheet open={open} onClose={onClose} title="Add to chat">
      <div className="agent-attach-sheet" role="group" aria-label="Attachment options">
        <div className="agent-attach-pills">
          <button
            type="button"
            className="agent-attach-pill"
            onClick={() => {
              onClose();
              onOpenCamera();
            }}
          >
            Camera
          </button>
          <button
            type="button"
            className="agent-attach-pill"
            onClick={() => galleryRef.current?.click()}
          >
            Gallery
          </button>
        </div>
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            void readFileAsDataUrl(file).then((dataUrl) => {
              onPickImage(dataUrl, file.name);
              onClose();
            });
          }}
        />
        {recentPhotos.length > 0 && (
          <>
            <p className="agent-attach-recent-label">Recent uploads</p>
            <div className="agent-attach-recent" role="list" aria-label="Recent meal photos">
              {recentPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  role="listitem"
                  className="agent-attach-recent-item"
                  aria-label={`Attach ${photo.label}`}
                  onClick={() => {
                    onPickImage(photo.dataUrl, photo.label);
                    onClose();
                  }}
                >
                  <img src={photo.dataUrl} alt="" className="agent-attach-recent-thumb" />
                  <span className="agent-attach-recent-name">{photo.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <p className="muted agent-attach-sheet-hint">Press Escape to close</p>
    </BottomSheet>
  );
}
