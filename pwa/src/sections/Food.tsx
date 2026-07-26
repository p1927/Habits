import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, type FoodLogItem, type FoodSearchResult, type FoodTodayResponse } from '../lib/api';

interface FoodProps {
  serverOnline: boolean;
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'other', label: 'Other' },
];

export function Food({ serverOnline }: FoodProps) {
  const [data, setData] = useState<FoodTodayResponse | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState('other');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editQty, setEditQty] = useState('');
  const searchTimer = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!serverOnline) return;
    setError('');
    try {
      const d = await api.getFoodToday();
      setData(d);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
      setError(e instanceof Error ? e.message : 'Failed to load food log');
    }
  }, [serverOnline]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!foodName.trim() || foodName.length < 2) {
      setSearchResults([]);
      return;
    }
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      void api.searchFood(foodName.trim()).then((r) => setSearchResults(r.results)).catch(() => setSearchResults([]));
    }, 250);
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [foodName]);

  async function handleVoiceLog(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.logFood(description.trim(), mealType);
      setData(res.summary);
      setDescription('');
      setSuccess(res.message);
      if (res.errors?.length) setError(res.errors.join('; '));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Log failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleManualLog(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number.parseFloat(quantity);
    if (!foodName.trim() || !qty) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.logFoodItem(foodName.trim(), qty);
      setData(res.summary);
      setFoodName('');
      setSearchResults([]);
      setSuccess(res.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Log failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(row: number) {
    if (!window.confirm('Remove this entry?')) return;
    setLoading(true);
    try {
      const summary = await api.deleteFoodRow(row);
      setData(summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit(item: FoodLogItem) {
    const qty = Number.parseFloat(editQty);
    if (!qty) return;
    setLoading(true);
    try {
      const summary = await api.updateFoodRow(item.row, item.food, qty);
      setData(summary);
      setEditingRow(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item: FoodLogItem) {
    setEditingRow(item.row);
    setEditQty(String(item.quantity_g));
  }

  const protein = data?.protein_g ?? 0;
  const target = data?.protein_target_g;
  const pct = target && target > 0 ? Math.min(100, (protein / target) * 100) : 0;

  return (
    <section className="section">
      <h1>Food Tracker</h1>
      <p className="muted">Synced to Daily calculation tab in your Nutrition Google Sheet.</p>

      {!serverOnline && (
        <div className="banner banner-warn">Mac server offline — connect to sync with Sheets.</div>
      )}

      {data && !data.sheets_connected && serverOnline && (
        <div className="banner banner-warn">
          Google not connected — go to Settings and connect Google Sheets.
        </div>
      )}

      <div className="progress-card card">
        <div className="progress-label">
          <span>Protein today</span>
          <span>
            {protein.toFixed(1)}g{target != null ? ` / ${target}g` : ''}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="muted macro-line">
          {data
            ? `${data.calories.toFixed(0)} kcal · ${data.carbs.toFixed(1)}g carbs · ${data.fat.toFixed(1)}g fat`
            : '—'}
        </p>
      </div>

      <form className="card" onSubmit={handleVoiceLog}>
        <h2>Quick log</h2>
        <label className="field">
          What did you eat?
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="200g paneer and 250g broccoli"
            disabled={!serverOnline || loading}
          />
        </label>
        <label className="field">
          Meal
          <select value={mealType} onChange={(e) => setMealType(e.target.value)} disabled={!serverOnline || loading}>
            {MEAL_TYPES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={!serverOnline || loading || !description.trim()}>
          Log meal
        </button>
      </form>

      <form className="card" onSubmit={handleManualLog}>
        <h2>Manual entry</h2>
        <label className="field">
          Food (from your database)
          <input
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            placeholder="Arla Paneer"
            disabled={!serverOnline || loading}
            autoComplete="off"
          />
        </label>
        {searchResults.length > 0 && (
          <ul className="search-suggestions">
            {searchResults.map((r) => (
              <li key={r.name}>
                <button
                  type="button"
                  onClick={() => {
                    setFoodName(r.name);
                    setSearchResults([]);
                  }}
                >
                  {r.name}
                  <span className="muted">
                    {' '}
                    · {r.protein}g protein / {r.ref_grams}g
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="field">
          Quantity (g)
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={!serverOnline || loading}
          />
        </label>
        <button type="submit" disabled={!serverOnline || loading || !foodName.trim()}>
          Add
        </button>
      </form>

      <div className="card">
        <h2>Today&apos;s log</h2>
        {!data?.items.length ? (
          <p className="muted">No entries yet today.</p>
        ) : (
          <ul className="food-list">
            {data.items.map((item) => (
              <li key={item.row} className="food-row">
                <div>
                  <strong>{item.food}</strong>
                  {editingRow === item.row ? (
                    <span>
                      {' '}
                      <input
                        type="number"
                        className="inline-edit"
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                      />
                      g
                      <button type="button" className="btn-small" onClick={() => void handleSaveEdit(item)}>
                        Save
                      </button>
                      <button type="button" className="btn-small" onClick={() => setEditingRow(null)}>
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <span className="muted">
                      {' '}
                      · {item.quantity_g}g · {item.protein.toFixed(1)}g protein · {item.calories.toFixed(0)} kcal
                    </span>
                  )}
                </div>
                <div className="food-row-actions">
                  {editingRow !== item.row && (
                    <button type="button" className="btn-small" onClick={() => startEdit(item)} disabled={loading}>
                      Edit
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-small btn-danger"
                    onClick={() => void handleDelete(item.row)}
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {success && <div className="banner banner-ok">{success}</div>}
      {error && <div className="banner banner-warn">{error}</div>}
    </section>
  );
}
