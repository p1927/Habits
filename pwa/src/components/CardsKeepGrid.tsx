import { Card } from './ui/Card';
import type { KeepCard } from '../lib/api';
import {
  highlightSearchMatch,
  KEEP_CARD_VARIANTS,
  CARDS_BULK_LONG_PRESS_MS,
  CARDS_BULK_LONG_PRESS_MOVE_PX,
} from '../lib/cardsSectionShared';
import { useLongPress } from '../hooks/useLongPress';

interface CardsKeepGridProps {
  cards: KeepCard[];
  onDelete: (card: KeepCard) => void;
  search?: string;
  totalCount?: number;
  /** When true, render checkboxes + selection visuals. */
  selectionMode?: boolean;
  /** Currently-selected card ids. */
  selectedIds?: Set<string>;
  onToggleSelect?: (card: KeepCard) => void;
  /** Fired when a card is long-pressed while not yet in selection mode. */
  onLongPressCard?: (card: KeepCard) => void;
}

const KEEP_CHIP_CLASS: Record<string, string> = {
  sickness: 'keep-chip keep-chip--yellow',
  notes: 'keep-chip keep-chip--blue',
  strategy: 'keep-chip keep-chip--green',
};

export function CardsKeepGrid({
  cards,
  onDelete,
  search = '',
  totalCount,
  selectionMode = false,
  selectedIds,
  onToggleSelect,
  onLongPressCard,
}: CardsKeepGridProps) {
  const trimmed = search.trim();
  const total = totalCount ?? cards.length;
  const hasResults = cards.length > 0;

  if (!hasResults) {
    if (trimmed && total > 0) {
      return (
        <div className="cards-empty-keep" role="status" aria-live="polite">
          <p>No matches for &ldquo;{trimmed}&rdquo;.</p>
        </div>
      );
    }
    return (
      <div className="cards-empty-keep">
        <p>No notes yet — tap + to capture.</p>
      </div>
    );
  }

  return (
    <div className="cards-grid" role="list" aria-label="Keep cards">
      {cards.map((card) => (
        <div key={card.id} role="listitem" className="keep-card-listitem">
          <KeepCardItem
            card={card}
            trimmed={trimmed}
            onDelete={onDelete}
            selectionMode={selectionMode}
            selected={selectedIds?.has(card.id) ?? false}
            onToggleSelect={onToggleSelect}
            onLongPressCard={onLongPressCard}
          />
        </div>
      ))}
    </div>
  );
}

interface KeepCardItemProps {
  card: KeepCard;
  trimmed: string;
  onDelete: (card: KeepCard) => void;
  selectionMode: boolean;
  selected: boolean;
  onToggleSelect?: (card: KeepCard) => void;
  onLongPressCard?: (card: KeepCard) => void;
}

function KeepCardItem({
  card,
  trimmed,
  onDelete,
  selectionMode,
  selected,
  onToggleSelect,
  onLongPressCard,
}: KeepCardItemProps) {
  const longPress = useLongPress(
    {
      onLongPress: () => {
        if (!selectionMode && onLongPressCard) onLongPressCard(card);
      },
    },
    { threshold: CARDS_BULK_LONG_PRESS_MS, movementThreshold: CARDS_BULK_LONG_PRESS_MOVE_PX },
  );

  const handleCardClick = () => {
    if (selectionMode) {
      onToggleSelect?.(card);
    }
  };

  const cardClasses = [
    'keep-card',
    'keep-card--pinned',
    selectionMode ? 'keep-card--selectable' : '',
    selectionMode && selected ? 'keep-card--selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Card
      variant={KEEP_CARD_VARIANTS[card.type] ?? 'keep-purple'}
      className={cardClasses}
      onClick={selectionMode ? handleCardClick : undefined}
      ariaLabel={
        selectionMode
          ? `${selected ? 'Deselect' : 'Select'} ${card.title}`
          : `${card.type} card: ${card.title}`
      }
    >
      {/* Long-press capture layer — invisible span that owns pointer events. */}
      {!selectionMode && onLongPressCard && (
        <span
          className="keep-card-long-press"
          aria-hidden="true"
          {...longPress}
          data-testid={`cards-longpress-${card.id}`}
        />
      )}
      <div className="keep-card-header">
        {selectionMode ? (
          <span
            className={`keep-card-checkbox ${selected ? 'keep-card-checkbox--checked' : ''}`}
            aria-hidden="true"
          >
            {selected ? '✓' : ''}
          </span>
        ) : (
          <span className={KEEP_CHIP_CLASS[card.type] ?? 'keep-chip'}>{card.type}</span>
        )}
        {!selectionMode && (
          <button
            type="button"
            className="keep-card-delete"
            aria-label={`Delete ${card.title}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card);
            }}
          >
            ×
          </button>
        )}
      </div>
      <h3>{highlightSearchMatch(card.title, trimmed)}</h3>
      {card.body && <p>{highlightSearchMatch(card.body, trimmed)}</p>}
    </Card>
  );
}