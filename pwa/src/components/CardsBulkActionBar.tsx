import { useEffect, useState } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import { CARD_TYPE_OPTIONS, type CardTypeOption } from '../lib/cardsSectionShared';

interface CardsBulkActionBarProps {
  /** Number of currently-selected cards. */
  selectedCount: number;
  /** Total cards currently rendered (post-filter). */
  visibleCount: number;
  /** Disable actions while a bulk operation is in flight. */
  disabled?: boolean;
  onCancel: () => void;
  onDeleteSelected: () => void;
  onChangeTypeClick: () => void;
}

/**
 * Sticky chip-toolbar that replaces CardsFilterBar's filter row when the
 * user has entered selection mode. Mirrors Google Keep's bulk-select bar:
 * Cancel | Delete selected | Change type sheet.
 */
export function CardsBulkActionBar({
  selectedCount,
  visibleCount,
  disabled = false,
  onCancel,
  onDeleteSelected,
  onChangeTypeClick,
}: CardsBulkActionBarProps) {
  return (
    <div
      className="cards-bulk-bar"
      role="toolbar"
      aria-label="Bulk card actions"
    >
      <span
        className="cards-bulk-bar__count"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {selectedCount > 0
          ? `Selected ${selectedCount} card${selectedCount === 1 ? '' : 's'}`
          : 'Select cards'}
      </span>
      <div className="cards-bulk-bar__chips">
        <button
          type="button"
          className="chip chip--ghost"
          onClick={onCancel}
          disabled={disabled}
        >
          Cancel
        </button>
        <button
          type="button"
          className="chip chip--danger"
          onClick={onDeleteSelected}
          disabled={disabled || selectedCount === 0}
          aria-label={`Delete ${selectedCount} selected card${selectedCount === 1 ? '' : 's'}`}
        >
          Delete selected
        </button>
        <button
          type="button"
          className="chip chip--primary"
          onClick={onChangeTypeClick}
          disabled={disabled || selectedCount === 0}
        >
          Change type
        </button>
      </div>
      <span className="sr-only" aria-live="polite">
        {selectedCount} of {visibleCount} cards selected
      </span>
    </div>
  );
}

interface CardsChangeTypeSheetProps {
  open: boolean;
  selectedCount: number;
  currentTypeById: Map<string, CardTypeOption>;
  onClose: () => void;
  onConfirm: (nextType: CardTypeOption) => void;
}

const TYPE_LABEL: Record<CardTypeOption, string> = {
  notes: 'Notes',
  sickness: 'Sickness',
  strategy: 'Strategy',
};

/**
 * BottomSheet for the bulk "Change type" action. Renders radio chips for
 * each card type. Confirms via the existing save flow.
 */
export function CardsChangeTypeSheet({
  open,
  selectedCount,
  currentTypeById,
  onClose,
  onConfirm,
}: CardsChangeTypeSheetProps) {
  const currentTypes = new Set(currentTypeById.values());
  const defaultType = currentTypes.size === 1 ? [...currentTypes][0] : undefined;
  const [nextType, setNextType] = useState<CardTypeOption | undefined>(defaultType);

  useEffect(() => {
    if (open) setNextType(defaultType);
  }, [defaultType, open]);

  return (
    <BottomSheet open={open} onClose={onClose} title={`Change type for ${selectedCount} card${selectedCount === 1 ? '' : 's'}`}>
      <p className="muted cards-change-type-hint">
        Pick a type. Existing rows will be re-saved under the new type.
      </p>
      <div className="cards-change-type-options" role="radiogroup" aria-label="Card type">
        {CARD_TYPE_OPTIONS.map((t) => (
          <label key={t} className="cards-change-type-option">
            <input
              type="radio"
              name="cards-change-type"
              value={t}
              checked={nextType === t}
              onChange={() => setNextType(t)}
            />
            <span>
              {TYPE_LABEL[t]}
              {currentTypes.size === 1 && currentTypes.has(t) ? ' (current)' : ''}
            </span>
          </label>
        ))}
      </div>
      <div className="cards-change-type-actions">
        <button type="button" className="chip chip--ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="chip chip--primary"
          onClick={() => nextType && onConfirm(nextType)}
          disabled={!nextType}
        >
          Save
        </button>
      </div>
    </BottomSheet>
  );
}