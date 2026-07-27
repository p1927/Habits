import { Card } from './ui/Card';
import type { KeepCard } from '../lib/api';
import { KEEP_CARD_VARIANTS } from '../lib/cardsSectionShared';

interface CardsKeepGridProps {
  cards: KeepCard[];
  onDelete: (card: KeepCard) => void;
}

const KEEP_CHIP_CLASS: Record<string, string> = {
  sickness: 'keep-chip keep-chip--yellow',
  notes: 'keep-chip keep-chip--blue',
  strategy: 'keep-chip keep-chip--green',
};

export function CardsKeepGrid({ cards, onDelete }: CardsKeepGridProps) {
  if (!cards.length) {
    return (
      <div className="cards-empty-keep">
        <p>No notes yet — tap + to capture.</p>
      </div>
    );
  }

  return (
    <div className="cards-grid" role="list" aria-label="Keep cards">
      {cards.map((card) => (
        <Card
          key={card.id}
          variant={KEEP_CARD_VARIANTS[card.type] ?? 'keep-purple'}
          className="keep-card keep-card--pinned"
          onClick={() => {}}
          ariaLabel={`${card.type} card: ${card.title}`}
        >
          <div className="keep-card-header">
            <span className={KEEP_CHIP_CLASS[card.type] ?? 'keep-chip'}>{card.type}</span>
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
          </div>
          <h3>{card.title}</h3>
          {card.body && <p>{card.body}</p>}
        </Card>
      ))}
    </div>
  );
}
