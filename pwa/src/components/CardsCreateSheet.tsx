import { useEffect, useRef } from 'react';
import { BottomSheet } from './ui/BottomSheet';

interface CardsCreateSheetProps {
  open: boolean;
  serverOnline: boolean;
  newType: 'sickness' | 'notes' | 'strategy';
  newTitle: string;
  newBody: string;
  onClose: () => void;
  onTypeChange: (type: 'sickness' | 'notes' | 'strategy') => void;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const TITLE_PREVIEW_MAX = 80;

/**
 * ui-068 / crit-075 / prop-ui-048 — body-first capture.
 *
 * Body is the source of truth: Save is gated on `newBody.trim()` non-empty.
 * The title field is optional; if left blank the server derives a title from
 * the first non-empty body line (max 80 chars). When the title field is empty
 * we surface a live `Title: {preview}` placeholder so the user can see what
 * the auto-derived title will be without an extra tap.
 */
export function CardsCreateSheet({
  open,
  serverOnline,
  newType,
  newTitle,
  newBody,
  onClose,
  onTypeChange,
  onTitleChange,
  onBodyChange,
  onSubmit,
}: CardsCreateSheetProps) {
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  // Autofocus body textarea when the sheet opens (Keep-style quick capture).
  useEffect(() => {
    if (!open) return;
    // Wait a frame so the BottomSheet's focus management settles first.
    const id = window.setTimeout(() => {
      bodyRef.current?.focus();
      const ta = bodyRef.current;
      if (ta) {
        // Place caret at end of any prefilled content.
        const len = ta.value.length;
        ta.setSelectionRange(len, len);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const trimmedBody = newBody.trim();
  const trimmedTitle = newTitle.trim();
  const derivedTitle = trimmedBody
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0)
    ?.slice(0, TITLE_PREVIEW_MAX) ?? '';
  const previewTitle = trimmedTitle || derivedTitle;
  const canSave = trimmedBody.length > 0 && serverOnline;

  return (
    <BottomSheet open={open} onClose={onClose} title="New card">
      <form onSubmit={onSubmit}>
        <label className="field">
          Type
          <select value={newType} onChange={(e) => onTypeChange(e.target.value as typeof newType)}>
            <option value="notes">Notes</option>
            <option value="sickness">Sickness</option>
            <option value="strategy">Strategy</option>
          </select>
        </label>
        <label className="field">
          Title
          <input
            value={newTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={previewTitle ? `Title: ${previewTitle}` : 'Title (optional — derived from body)'}
            maxLength={120}
            aria-label="Title (optional, derived from body when blank)"
          />
        </label>
        <label className="field">
          Body
          <textarea
            ref={bodyRef}
            value={newBody}
            onChange={(e) => onBodyChange(e.target.value)}
            rows={4}
            required
            placeholder="Type a thought — title is optional"
          />
        </label>
        <button type="submit" disabled={!canSave}>Save</button>
      </form>
      <p className="muted cards-create-sheet-hint">Press Escape to close</p>
    </BottomSheet>
  );
}
