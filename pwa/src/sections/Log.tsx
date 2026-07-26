import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraCapture } from '../components/CameraCapture';
import { SwipeFoodCard } from '../components/SwipeFoodCard';
import { Card } from '../components/ui/Card';
import { BottomSheet } from '../components/ui/BottomSheet';
import {
  api,
  ApiError,
  type FoodLogItem,
  type FoodScanResult,
  type FoodSearchResult,
  type FoodTodayResponse,
} from '../lib/api';

interface LogProps {
  serverOnline: boolean;
}

type LogTab = 'scan' | 'type' | 'history' | 'recipes';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'other', label: 'Other' },
];

function dataUrlToFile(dataUrl: string, name = 'scan.jpg'): File {
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], name, { type: mime });
}

export function Log({ serverOnline }: LogProps) {
  const [tab, setTab] = useState<LogTab>('scan');
  const [data, setData] = useState<FoodTodayResponse | null>(null);
  const [history, setHistory] = useState<{ days: { date: string; calories: number; protein: number }[] } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<FoodScanResult | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState('100');
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState('other');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [recipe, setRecipe] = useState<{
    name: string;
    items: { food: string; quantity_g: number; calories: number; protein: number }[];
    totals: { calories: number; protein: number } | null;
  } | null>(null);
  const searchTimer = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!serverOnline) return;
    try {
      const [today, hist] = await Promise.all([api.getFoodToday(), api.getFoodHistory(14)]);
      setData(today);
      setHistory(hist);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
    }
  }, [serverOnline]);

  useEffect(() => {
    void refresh();
    if (tab === 'recipes' && serverOnline) {
      void api.getSavedRecipe().then((r) => setRecipe(r.recipe)).catch(() => setRecipe(null));
    }
  }, [refresh, tab, serverOnline]);

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

  async function handleCapture(dataUrl: string) {
    setLoading(true);
    setError('');
    try {
      const file = dataUrlToFile(dataUrl);
      const result = await api.scanFood(file);
      setScanResult(result);
      setEditName(result.matched_name ?? result.detected_name);
      setEditQty(String(result.suggested_grams));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  }

  async function logScan(name: string, qty: number) {
    setLoading(true);
    try {
      const res = await api.logFoodItem(name, qty);
      setData(res.summary);
      setSuccess(res.message);
      setScanResult(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Log failed');
    } finally {
      setLoading(false);
    }
  }

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
      setData(await api.deleteFoodRow(row));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section">
      <h1>Log Food</h1>
      <p className="muted">Scan, type, or review history</p>

      <div className="sub-tabs">
        {(['scan', 'type', 'recipes', 'history'] as LogTab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`sub-tab ${tab === t ? 'sub-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'scan' ? 'Scan' : t === 'type' ? 'Type' : t === 'recipes' ? 'Recipes' : 'History'}
          </button>
        ))}
      </div>

      {tab === 'scan' && (
        <>
          {!scanResult ? (
            <Card>
              <h2>Camera scan</h2>
              <p className="muted">Point at your food — like Google Translate</p>
              <CameraCapture
                facingMode="environment"
                placeholder="Point at your food — like Google Translate"
                onCapture={(url) => void handleCapture(url)}
                disabled={!serverOnline || loading}
              />
              {loading && <p className="muted">Identifying food…</p>}
            </Card>
          ) : (
            <SwipeFoodCard
              scan={scanResult}
              onAction={(dir) => {
                if (dir === 'right') {
                  void logScan(editName, Number.parseFloat(editQty) || scanResult.suggested_grams);
                } else if (dir === 'up') {
                  setScanResult(null);
                }
              }}
              onEdit={() => setEditOpen(true)}
            />
          )}
        </>
      )}

      {tab === 'type' && (
        <>
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
            <button type="submit" disabled={!serverOnline || loading || !description.trim()}>Log meal</button>
          </form>

          <form className="card" onSubmit={handleManualLog}>
            <h2>Manual entry</h2>
            <label className="field">
              Food
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
                    <button type="button" onClick={() => { setFoodName(r.name); setSearchResults([]); }}>
                      {r.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <label className="field">
              Quantity (g)
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} disabled={!serverOnline || loading} />
            </label>
            <button type="submit" disabled={!serverOnline || loading || !foodName.trim()}>Add</button>
          </form>

          <Card>
            <h2>Today&apos;s log</h2>
            {!data?.items.length ? (
              <p className="muted">No entries yet.</p>
            ) : (
              <ul className="food-list">
                {data.items.map((item: FoodLogItem) => (
                  <li key={item.row} className="food-row">
                    <div>
                      <strong>{item.food}</strong>
                      <span className="muted"> · {item.quantity_g}g · {item.protein.toFixed(1)}g protein</span>
                    </div>
                    <button type="button" className="btn-small btn-danger" onClick={() => void handleDelete(item.row)}>×</button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}

      {tab === 'recipes' && (
        <Card>
          <h2>Saved recipe</h2>
          <p className="muted">From Save Reciepe tab in Nutrition sheet</p>
          {!recipe ? (
            <p className="muted">No saved recipe found.</p>
          ) : (
            <>
              <h3>{recipe.name}</h3>
              <ul className="food-list">
                {recipe.items.map((item) => (
                  <li key={item.food} className="food-row">
                    <strong>{item.food}</strong>
                    <span className="muted">
                      {item.quantity_g}g · {item.protein.toFixed(1)}g protein · {item.calories.toFixed(0)} kcal
                    </span>
                  </li>
                ))}
              </ul>
              {recipe.totals && (
                <p className="muted">
                  Total: {recipe.totals.calories.toFixed(0)} kcal · {recipe.totals.protein.toFixed(1)}g protein
                </p>
              )}
              <button
                type="button"
                disabled={!serverOnline || loading}
                onClick={() => {
                  setLoading(true);
                  void api
                    .logSavedRecipe()
                    .then((res) => {
                      setData(res.summary);
                      setSuccess(res.message);
                    })
                    .catch((e) => setError(e instanceof Error ? e.message : 'Recipe log failed'))
                    .finally(() => setLoading(false));
                }}
              >
                Log entire recipe today
              </button>
            </>
          )}
        </Card>
      )}

      {tab === 'history' && (
        <Card>
          <h2>14-day history</h2>
          {!history?.days.length ? (
            <p className="muted">No history in Followed tab.</p>
          ) : (
            <ul className="food-list">
              {[...history.days].reverse().map((d) => (
                <li key={d.date} className="food-row">
                  <strong>{d.date}</strong>
                  <span className="muted">
                    {d.calories.toFixed(0)} kcal · {d.protein.toFixed(1)}g protein
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <BottomSheet open={editOpen} onClose={() => setEditOpen(false)} title="Edit scan">
        <label className="field">
          Food name
          <input value={editName} onChange={(e) => setEditName(e.target.value)} />
        </label>
        <label className="field">
          Quantity (g)
          <input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} />
        </label>
        <button
          type="button"
          onClick={() => {
            void logScan(editName, Number.parseFloat(editQty));
            setEditOpen(false);
          }}
        >
          Log food
        </button>
      </BottomSheet>

      {success && <div className="banner banner-ok">{success}</div>}
      {error && <div className="banner banner-warn">{error}</div>}
    </section>
  );
}
