import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CardsBulkActionBar, CardsChangeTypeSheet } from '../components/CardsBulkActionBar';
import { CardsCreateSheet } from '../components/CardsCreateSheet';
import { CardsFilterBar } from '../components/CardsFilterBar';
import { CardsKeepGrid } from '../components/CardsKeepGrid';
import { CardsSicknessTimelineCard } from '../components/CardsSicknessTimelineCard';
import { MealPlanSyncAwarenessSlot } from '../components/MealPlanSyncAwarenessSlot';
import { UndoToast } from '../components/UndoToast';
import { api, ApiError, type KeepCard, type SicknessTimelineEvent } from '../lib/api';
import {
  CARDS_BULK_HINT_KEY,
  filterCardsBySearch,
  type CardsFilter,
  type CardTypeOption,
} from '../lib/cardsSectionShared';
import { useCardsBulkShortcut } from '../hooks/useCardsBulkShortcut';
import { useCardsFilterShortcuts } from '../hooks/useCardsFilterShortcuts';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

interface CardsProps {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
}

interface BulkUndoSnapshot {
  /** Cards that were deleted from the visible list. Used to undo bulk operations. */
  deleted: KeepCard[];
}

export function Cards({ serverOnline, onNavigateMealPlanSyncSource }: CardsProps) {
  const [cards, setCards] = useState<KeepCard[]>([]);
  const [filter, setFilter] = useState<CardsFilter>('all');
  const [search, setSearch] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  const [newType, setNewType] = useState<CardTypeOption>('notes');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [error, setError] = useState('');
  const [sicknessEvents, setSicknessEvents] = useState<SicknessTimelineEvent[]>([]);
  // ui-072 / crit-081 — sickness timeline → related notes handoff
  // (announces the active event + scrolls the grid into view after a tap).
  const [sicknessHandoffMessage, setSicknessHandoffMessage] = useState('');
  const cardsGridRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceMotion.current = mq.matches;
  }, []);

  // Bulk-selection state (ui-070).
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkInFlight, setBulkInFlight] = useState(false);
  const [changeTypeOpen, setChangeTypeOpen] = useState(false);
  const [bulkUndo, setBulkUndo] = useState<{ snapshot: BulkUndoSnapshot; message: string } | null>(null);
  const [undoing, setUndoing] = useState(false);

  const { showShortcutHint, dismissShortcutHint } = useCardsFilterShortcuts(setFilter, fabOpen);

  // ui-070 — bulk-select first-visit hint (mirrors useCardsFilterShortcuts pattern).
  const [showBulkHint, setShowBulkHint] = useState(
    () => localStorage.getItem(CARDS_BULK_HINT_KEY) !== '1',
  );
  const dismissBulkHint = useCallback(() => {
    localStorage.setItem(CARDS_BULK_HINT_KEY, '1');
    setShowBulkHint(false);
  }, []);

  const enterSelection = useCallback((card?: KeepCard) => {
    setSelectionMode(true);
    if (card) setSelectedIds(new Set([card.id]));
    dismissBulkHint();
  }, [dismissBulkHint]);

  // ⌘/Ctrl+Shift+A enters selection; Escape exits (ui-070 / crit-079).
  useCardsBulkShortcut(selectionMode, setSelectionMode, fabOpen);

  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    setChangeTypeOpen(false);
  }, []);

  // Selection auto-exits when filter changes (per crit-084 mitigation + crit-042 sync).
  const handleFilterChange = useCallback(
    (next: CardsFilter) => {
      setFilter(next);
      exitSelection();
    },
    [exitSelection],
  );

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

  const filtered = useMemo(() => filterCardsBySearch(cards, search), [cards, search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    // ui-068 — body-first capture: require body, not title. The server derives
    // a title from the first body line when title is empty/whitespace.
    const body = newBody.trim();
    if (!body) return;
    try {
      const res = await api.createCard(newType, newTitle.trim(), body);
      setCards(res.cards);
      setFabOpen(false);
      setNewTitle('');
      setNewBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  }

  async function handleDelete(card: KeepCard) {
    if (!window.confirm('Delete this card?')) return;
    try {
      const res = await api.deleteCard(card.type, card.row);
      setCards(res.cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  const toggleSelect = useCallback((card: KeepCard) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(card.id)) next.delete(card.id);
      else next.add(card.id);
      // Auto-exit when last selection cleared.
      if (next.size === 0) {
        setSelectionMode(false);
      }
      return next;
    });
  }, []);

  const bulkDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const targets = cards.filter((c) => selectedIds.has(c.id));
    if (targets.length === 0) return;
    setBulkInFlight(true);
    const deletedTargets: KeepCard[] = [];
    try {
      for (const t of targets) {
        await api.deleteCard(t.type, t.row);
        deletedTargets.push(t);
      }
      await refresh();
      setBulkUndo({
        snapshot: { deleted: targets },
        message: `Deleted ${targets.length} card${targets.length === 1 ? '' : 's'}`,
      });
      exitSelection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk delete failed');
      if (deletedTargets.length > 0) {
        setBulkUndo({
          snapshot: { deleted: deletedTargets },
          message: 'Some cards could not be deleted — Undo restores the deleted cards',
        });
      }
      await refresh();
    } finally {
      setBulkInFlight(false);
    }
  }, [cards, selectedIds, exitSelection, refresh]);

  const bulkChangeType = useCallback(
    async (nextType: CardTypeOption) => {
      if (selectedIds.size === 0) return;
      const targets = cards.filter((c) => selectedIds.has(c.id));
      if (!targets.some((target) => target.type !== nextType)) {
        setChangeTypeOpen(false);
        return;
      }
      setBulkInFlight(true);
      try {
        // Delete originals, re-create under new type. Matches crit-084 "re-save".
        for (const t of targets) {
          await api.deleteCard(t.type, t.row);
        }
        for (const t of targets) {
          await api.createCard(nextType, t.title, t.body);
        }
        await refresh();
        setChangeTypeOpen(false);
        exitSelection();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bulk change-type failed');
        await refresh();
      } finally {
        setBulkInFlight(false);
      }
    },
    [cards, selectedIds, exitSelection, refresh],
  );

  const restoreSnapshot = useCallback(async (snapshot: BulkUndoSnapshot) => {
    for (const c of snapshot.deleted) {
      await api.createCard(c.type, c.title, c.body);
    }
    await refresh();
  }, [refresh]);

  const handleBulkUndo = useCallback(async () => {
    if (!bulkUndo) return;
    setUndoing(true);
    try {
      await restoreSnapshot(bulkUndo.snapshot);
      setBulkUndo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Undo failed');
    } finally {
      setUndoing(false);
    }
  }, [bulkUndo, restoreSnapshot]);

  const handleBulkDismiss = useCallback(() => {
    setBulkUndo(null);
  }, []);

  // ui-072 / crit-081 — sickness timeline event activation switches to the
  // sickness filter, prefills the event label into search, scrolls the grid
  // into view, and announces the handoff for screen-reader users.
  const handleSicknessEventSelect = useCallback(
    (ev: SicknessTimelineEvent) => {
      setFilter('sickness');
      setSearch(ev.label);
      setSicknessHandoffMessage(`Showing sickness notes for ${ev.label}.`);
      // Scroll the grid into view on the next paint so the filter + search
      // have been applied and matches are visible. jsdom does not implement
      // Element.scrollIntoView, so the call is feature-detected.
      requestAnimationFrame(() => {
        const node = cardsGridRef.current;
        if (!node || typeof node.scrollIntoView !== 'function') return;
        if (reduceMotion.current) {
          node.scrollIntoView();
        } else {
          node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    },
    [],
  );

  // UndoToast manages its own setTimeout dismissal; no manual cleanup needed.

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

      {selectionMode ? (
        <CardsBulkActionBar
          selectedCount={selectedIds.size}
          visibleCount={filtered.length}
          disabled={bulkInFlight}
          onCancel={exitSelection}
          onDeleteSelected={() => void bulkDeleteSelected()}
          onChangeTypeClick={() => setChangeTypeOpen(true)}
        />
      ) : (
        <CardsFilterBar
          search={search}
          filter={filter}
          onSearchChange={setSearch}
          onFilterChange={handleFilterChange}
          showShortcutHint={showShortcutHint}
          onDismissShortcutHint={dismissShortcutHint}
          selectionMode={selectionMode}
          hasCards={filtered.length > 0}
          onEnterSelection={enterSelection}
          showBulkHint={showBulkHint}
          onDismissBulkHint={dismissBulkHint}
        />
      )}

      {(filter === 'all' || filter === 'sickness') && (
        <CardsSicknessTimelineCard events={sicknessEvents} onEventSelect={handleSicknessEventSelect} />
      )}

      <div role="tabpanel" id="cards-filter-panel" aria-labelledby={`cards-filter-${filter}`} ref={cardsGridRef}>
        <CardsKeepGrid
          cards={filtered}
          onDelete={(card) => void handleDelete(card)}
          search={search}
          totalCount={cards.length}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onLongPressCard={enterSelection}
        />
      </div>

      {!selectionMode && (
        <button
          type="button"
          className="fab fab--keep"
          onClick={() => setFabOpen(true)}
          aria-label="Add note"
        >
          +
        </button>
      )}

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

      <CardsChangeTypeSheet
        open={changeTypeOpen}
        selectedCount={selectedIds.size}
        currentTypeById={new Map(cards.filter((c) => selectedIds.has(c.id)).map((c) => [c.id, c.type]))}
        onClose={() => setChangeTypeOpen(false)}
        onConfirm={(t) => void bulkChangeType(t)}
      />

      {bulkUndo && (
        <UndoToast
          message={bulkUndo.message}
          onUndo={() => void handleBulkUndo()}
          onDismiss={handleBulkDismiss}
          undoing={undoing}
        />
      )}

      {error && (
        <div className="banner banner-warn banner-revolut" role="alert">
          {error}
        </div>
      )}

      {/* ui-072 / crit-081 — visually hidden, screen-reader announcement of
          the sickness-event handoff. The Cards section has no other polite
          live region, so the wrapper is owned by the section. */}
      <p className="sr-only" role="status" aria-live="polite">
        {sicknessHandoffMessage}
      </p>
    </section>
  );
}