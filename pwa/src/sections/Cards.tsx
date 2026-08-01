import { useCallback, useEffect, useState } from 'react';
import { CardsCreateSheet } from '../components/CardsCreateSheet';
import { CardsFilterBar } from '../components/CardsFilterBar';
import { CardsKeepGrid } from '../components/CardsKeepGrid';
import { CardsSicknessTimelineCard } from '../components/CardsSicknessTimelineCard';
import { MealPlanSyncAwarenessSlot } from '../components/MealPlanSyncAwarenessSlot';
import { api, ApiError, type KeepCard, type SicknessTimelineEvent } from '../lib/api';
import { filterCardsBySearch, type CardsFilter } from '../lib/cardsSectionShared';
import { useCardsFilterShortcuts } from '../hooks/useCardsFilterShortcuts';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

interface CardsProps {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
}

export function Cards({ serverOnline, onNavigateMealPlanSyncSource }: CardsProps) {
  const [cards, setCards] = useState<KeepCard[]>([]);
  const [filter, setFilter] = useState<CardsFilter>('all');
  const [search, setSearch] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  const [newType, setNewType] = useState<'sickness' | 'notes' | 'strategy'>('notes');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [error, setError] = useState('');
  const [sicknessEvents, setSicknessEvents] = useState<SicknessTimelineEvent[]>([]);

  const { showShortcutHint, dismissShortcutHint } = useCardsFilterShortcuts(setFilter, fabOpen);

  const refresh = useCallback(async () => {
    if (!serverOnline) return;
    try {
      const type = filter === 'all' ? undefined : filter;
      const [res, timeline] = await Promise.all([
        api.getCards(type),
        filter === 'all' || filter === 'sickness' ? api.getSicknessTimeline() : Promise.resolve(null),
      ]);
      setCards(res.cards);
      setSicknessEvents(timeline?.events ?? []);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
      setError(e instanceof Error ? e.message : 'Failed to load cards');
    }
  }, [serverOnline, filter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = filterCardsBySearch(cards, search);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await api.createCard(newType, newTitle.trim(), newBody.trim());
      setCards(res.cards);
      setFabOpen(false);
      setNewTitle('');
      setNewBody('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    }
  }

  async function handleDelete(card: KeepCard) {
    if (!window.confirm('Delete this card?')) return;
    try {
      const res = await api.deleteCard(card.type, card.row);
      setCards(res.cards);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  return (
    <section className="section cards-section cards-section--keep" aria-labelledby="cards-heading">
      <p className="section-eyebrow">Notes</p>
      <h1 id="cards-heading">Keep</h1>
      <p className="muted cards-lede">Quick capture — notes, sickness, strategy</p>

      <MealPlanSyncAwarenessSlot
        viewer="external"
        onNavigate={onNavigateMealPlanSyncSource}
        showPendingWhenIdle
      />

      <CardsFilterBar
        search={search}
        filter={filter}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
        showShortcutHint={showShortcutHint}
        onDismissShortcutHint={dismissShortcutHint}
      />

      {(filter === 'all' || filter === 'sickness') && (
        <CardsSicknessTimelineCard events={sicknessEvents} />
      )}

      <div role="tabpanel" id="cards-filter-panel" aria-labelledby={`cards-filter-${filter}`}>
        <CardsKeepGrid
          cards={filtered}
          onDelete={(card) => void handleDelete(card)}
          search={search}
          totalCount={cards.length}
        />
      </div>

      <button type="button" className="fab fab--keep" onClick={() => setFabOpen(true)} aria-label="Add note">
        +
      </button>

      <CardsCreateSheet
        open={fabOpen}
        serverOnline={serverOnline}
        newType={newType}
        newTitle={newTitle}
        newBody={newBody}
        onClose={() => setFabOpen(false)}
        onTypeChange={setNewType}
        onTitleChange={setNewTitle}
        onBodyChange={setNewBody}
        onSubmit={(e) => void handleCreate(e)}
      />

      {error && <div className="banner banner-warn banner-revolut" role="alert">{error}</div>}
    </section>
  );
}
