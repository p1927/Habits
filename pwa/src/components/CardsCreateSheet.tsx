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
          <input value={newTitle} onChange={(e) => onTitleChange(e.target.value)} required />
        </label>
        <label className="field">
          Body
          <textarea value={newBody} onChange={(e) => onBodyChange(e.target.value)} rows={3} />
        </label>
        <button type="submit" disabled={!serverOnline}>Save</button>
      </form>
    </BottomSheet>
  );
}
