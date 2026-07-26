import { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { BottomSheet } from '../components/ui/BottomSheet';
import { api, ApiError, type KeepCard } from '../lib/api';

interface CardsProps {
  serverOnline: boolean;
}

const FILTERS = ['all', 'sickness', 'notes', 'strategy'] as const;
const KEEP_VARIANTS: Record<string, 'keep-yellow' | 'keep-blue' | 'keep-green' | 'keep-pink' | 'keep-purple'> = {
  sickness: 'keep-yellow',
  notes: 'keep-blue',
  strategy: 'keep-green',
};

export function Cards({ serverOnline }: CardsProps) {
  const [cards, setCards] = useState<KeepCard[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [search, setSearch] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  const [newType, setNewType] = useState<'sickness' | 'notes' | 'strategy'>('notes');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!serverOnline) return;
    try {
      const type = filter === 'all' ? undefined : filter;
      const res = await api.getCards(type);
      setCards(res.cards);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
      setError(e instanceof Error ? e.message : 'Failed to load cards');
    }
  }, [serverOnline, filter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = cards.filter((c) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return c.title.toLowerCase().includes(q) || c.body.toLowerCase().includes(q);
  });

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
    <section className="section cards-section">
      <h1>Cards</h1>
      <p className="muted">Notes, sickness, strategy — like Google Keep</p>

      <input
        className="cards-search"
        placeholder="Search cards…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="sub-tabs">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`sub-tab ${filter === f ? 'sub-tab-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="cards-grid">
        {filtered.map((card) => (
          <Card
            key={card.id}
            variant={KEEP_VARIANTS[card.type] ?? 'keep-purple'}
            className="keep-card"
            onClick={() => {}}
          >
            <div className="keep-card-header">
              <span className="keep-card-type">{card.type}</span>
              <button
                type="button"
                className="btn-small btn-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleDelete(card);
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

      {!filtered.length && <p className="muted">No cards yet.</p>}

      <button type="button" className="fab" onClick={() => setFabOpen(true)} aria-label="Add card">
        +
      </button>

      <BottomSheet open={fabOpen} onClose={() => setFabOpen(false)} title="New card">
        <form onSubmit={(e) => void handleCreate(e)}>
          <label className="field">
            Type
            <select value={newType} onChange={(e) => setNewType(e.target.value as typeof newType)}>
              <option value="notes">Notes</option>
              <option value="sickness">Sickness</option>
              <option value="strategy">Strategy</option>
            </select>
          </label>
          <label className="field">
            Title
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
          </label>
          <label className="field">
            Body
            <textarea value={newBody} onChange={(e) => setNewBody(e.target.value)} rows={3} />
          </label>
          <button type="submit" disabled={!serverOnline}>Save</button>
        </form>
      </BottomSheet>

      {error && <div className="banner banner-warn">{error}</div>}
    </section>
  );
}
