import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraCapture } from '../components/CameraCapture';
import { BarcodeScanner } from '../components/BarcodeScanner';
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
import { useOptimisticFoodLog } from '../hooks/useOptimisticFoodLog';
import { addMealPhoto, getTodayMealPhotos } from '../lib/mealPhotos';
import { lookupOpenFoodFacts, scaleOffMacros, type OffProduct } from '../lib/openFoodFacts';

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
  const [offProduct, setOffProduct] = useState<OffProduct | null>(null);
  const [offQuantity, setOffQuantity] = useState('100');
  const [recipe, setRecipe] = useState<{
    name: string;
    items: { food: string; quantity_g: number; calories: number; protein: number }[];
    totals: { calories: number; protein: number } | null;
  } | null>(null);
  const [recipePhoto, setRecipePhoto] = useState<string | null>(null);
  const [recipeScanResult, setRecipeScanResult] = useState<FoodScanResult | null>(null);
  const [recipeScanning, setRecipeScanning] = useState(false);
  const [recipeEditOpen, setRecipeEditOpen] = useState(false);
  const [recipeEditName, setRecipeEditName] = useState('');
  const [recipeEditQty, setRecipeEditQty] = useState('100');
  const searchTimer = useRef<number | null>(null);

  const { pending, logItem, logMeal, retry, dismiss, queuedCount } = useOptimisticFoodLog({
    serverOnline,
    setData,
    setSuccess,
    setError,
  });

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
    if (tab !== 'recipes') return;
    const label = recipe?.name ?? 'Recipe';
    const match = getTodayMealPhotos().find((p) => p.label === label);
    setRecipePhoto(match?.dataUrl ?? null);
  }, [tab, recipe?.name]);

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
      addMealPhoto(dataUrl, result.matched_name ?? result.detected_name);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  }

  async function logScan(name: string, qty: number) {
    setScanResult(null);
    await logItem(name, qty);
  }

  async function handleVoiceLog(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSuccess('');
    const desc = description.trim();
    const meal = mealType;
    setDescription('');
    await logMeal(desc, meal);
  }

  async function handleRecipePhoto(dataUrl: string) {
    const label = recipe?.name ?? 'Recipe';
    addMealPhoto(dataUrl, label);
    setRecipePhoto(dataUrl);
    setRecipeScanResult(null);
    setError('');

    if (!serverOnline) {
      setSuccess('Recipe photo saved — visible on Home');
      return;
    }

    setRecipeScanning(true);
    try {
      const result = await api.scanFood(dataUrlToFile(dataUrl, 'recipe.jpg'));
      setRecipeScanResult(result);
      setRecipeEditName(result.matched_name ?? result.detected_name);
      setRecipeEditQty(String(result.suggested_grams));
      setSuccess(
        `Identified ${result.matched_name ?? result.detected_name} — swipe to log or use saved recipe below`,
      );
    } catch (e) {
      setSuccess('Recipe photo saved — visible on Home');
      setError(e instanceof Error ? e.message : 'Recipe scan failed');
    } finally {
      setRecipeScanning(false);
    }
  }

  async function logRecipeScan(name: string, qty: number) {
    setRecipeScanResult(null);
    await logItem(name, qty);
  }

  async function handleManualLog(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number.parseFloat(quantity);
    if (!foodName.trim() || !qty) return;
    const name = foodName.trim();
    setFoodName('');
    setSearchResults([]);
    await logItem(name, qty);
  }

  async function handleLogOffProduct() {
    if (!offProduct || !serverOnline) return;
    const qty = Number.parseFloat(offQuantity);
    if (!qty || qty <= 0) return;
    setLoading(true);
    setError('');
    try {
      const macros = scaleOffMacros(offProduct.per100g, qty);
      const res = await api.logFoodMacros({
        food: offProduct.name,
        quantity_g: qty,
        ...macros,
      });
      setData(res.summary);
      setSuccess(res.message);
      setOffProduct(null);
      setFoodName('');
      setSearchResults([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Open Food Facts log failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleBarcode(code: string) {
    setError('');
    setSuccess('');
    setOffProduct(null);
    setTab('type');
    setLoading(true);
    try {
      if (serverOnline) {
        const res = await api.searchFood(code);
        if (res.results[0]) {
          setFoodName(res.results[0].name);
          setSearchResults(res.results);
          setSuccess(`Found in your database: ${res.results[0].name}`);
          return;
        }
      }

      const off = await lookupOpenFoodFacts(code);
      if (off) {
        setOffProduct(off);
        setOffQuantity(String(off.quantityG));
        setFoodName(off.name);
        if (serverOnline) {
          const local = await api.searchFood(off.name.split(/\s+/)[0] ?? off.name);
          setSearchResults(local.results);
        } else {
          setSearchResults([]);
        }
        setSuccess(
          `Open Food Facts: ${off.name}${off.brand ? ` (${off.brand})` : ''} — log directly or pick a sheet match`,
        );
        return;
      }

      setFoodName(code);
      setSearchResults([]);
      if (serverOnline) {
        const res = await api.searchFood(code);
        setSearchResults(res.results);
      }
      setSuccess(`Barcode ${code} — not found in Open Food Facts or your database`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Barcode lookup failed');
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
    <section className="section" aria-labelledby="log-heading">
      <h1 id="log-heading">Log Food</h1>
      <p className="muted">Scan, type, or review history</p>

      {queuedCount > 0 && (
        <div className="banner banner-warn" role="status">
          {queuedCount} food log{queuedCount === 1 ? '' : 's'} queued offline — will sync when online.
        </div>
      )}

      <div className="sub-tabs" role="tablist" aria-label="Log food views">
        {(['scan', 'type', 'recipes', 'history'] as LogTab[]).map((t) => {
          const label = t === 'scan' ? 'Scan' : t === 'type' ? 'Type' : t === 'recipes' ? 'Recipes' : 'History';
          return (
          <button
            key={t}
            type="button"
            role="tab"
            id={`log-tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`log-panel-${t}`}
            className={`sub-tab ${tab === t ? 'sub-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {label}
          </button>
        );})}
      </div>

      <div role="tabpanel" id={`log-panel-${tab}`} aria-labelledby={`log-tab-${tab}`}>
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
              {loading && <p className="muted" role="status" aria-live="polite">Identifying food…</p>}
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
          <Card>
            <h2>Barcode</h2>
            <p className="muted">Scan packaged food — looks up your sheet, then Open Food Facts</p>
            <BarcodeScanner
              disabled={loading}
              onScan={(code) => void handleBarcode(code)}
            />
          </Card>

          {offProduct && (
            <Card className="off-product-card">
              <h2>Open Food Facts</h2>
              <p className="off-product-name">{offProduct.name}</p>
              {offProduct.brand && <p className="muted">{offProduct.brand}</p>}
              <p className="muted">Per 100g · barcode {offProduct.barcode}</p>
              <div className="off-product-macros">
                <span>{offProduct.per100g.calories} kcal</span>
                <span>{offProduct.per100g.protein}g protein</span>
                <span>{offProduct.per100g.carbs}g carbs</span>
                <span>{offProduct.per100g.fat}g fat</span>
              </div>
              <label className="field">
                Serving (g)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={offQuantity}
                  onChange={(e) => setOffQuantity(e.target.value)}
                  disabled={loading}
                />
              </label>
              {(() => {
                const qty = Number.parseFloat(offQuantity);
                if (!qty || qty <= 0) return null;
                const scaled = scaleOffMacros(offProduct.per100g, qty);
                return (
                  <p className="muted">
                    For {qty}g: {scaled.calories} kcal · {scaled.protein}g protein
                  </p>
                );
              })()}
              <button
                type="button"
                disabled={!serverOnline || loading}
                onClick={() => void handleLogOffProduct()}
              >
                Log from Open Food Facts
              </button>
              <p className="muted">Or pick a matching food from your sheet below</p>
            </Card>
          )}

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
            {!pending.length && !data?.items.length ? (
              <p className="muted">No entries yet.</p>
            ) : (
              <ul className="food-list">
                {pending.map((entry) => (
                  <li
                    key={entry.id}
                    className={`food-row food-row--${entry.status}`}
                  >
                    <div>
                      <strong>{entry.food}</strong>
                      <span className="muted">
                        {entry.quantity_g > 0 ? ` · ${entry.quantity_g}g` : ''}
                        {entry.status === 'pending'
                          ? ' · Saving…'
                          : entry.status === 'queued'
                            ? ' · Queued offline'
                            : ' · Failed to save'}
                      </span>
                    </div>
                    {entry.status === 'failed' && (
                      <div className="food-row-actions">
                        <button type="button" className="btn-small" onClick={() => retry(entry)}>
                          Retry
                        </button>
                        <button type="button" className="btn-small btn-danger" aria-label="Dismiss failed entry" onClick={() => dismiss(entry.id)}>
                          ×
                        </button>
                      </div>
                    )}
                  </li>
                ))}
                {data?.items.map((item: FoodLogItem) => (
                  <li key={item.row} className="food-row">
                    <div>
                      <strong>{item.food}</strong>
                      <span className="muted"> · {item.quantity_g}g · {item.protein.toFixed(1)}g protein</span>
                    </div>
                    <button type="button" className="btn-small btn-danger" aria-label={`Remove ${item.food}`} onClick={() => void handleDelete(item.row)}>×</button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}

      {tab === 'recipes' && (
        <>
          <Card>
            <h2>Recipe photo</h2>
            <p className="muted">
              Photograph your prepared meal — AI identifies it for logging and saves to Home gallery
            </p>
            {recipePhoto && (
              <img
                src={recipePhoto}
                alt={recipe?.name ? `Photo of ${recipe.name}` : 'Recipe photo'}
                className="recipe-photo-preview"
              />
            )}
            {!recipeScanResult && (
              <CameraCapture
                facingMode="environment"
                placeholder="Photograph your prepared recipe"
                onCapture={(url) => void handleRecipePhoto(url)}
                disabled={loading || recipeScanning}
              />
            )}
            {recipeScanning && (
              <p className="muted" role="status" aria-live="polite">Identifying recipe…</p>
            )}
          </Card>

          {recipeScanResult && (
            <SwipeFoodCard
              scan={recipeScanResult}
              onAction={(dir) => {
                if (dir === 'right') {
                  void logRecipeScan(
                    recipeEditName,
                    Number.parseFloat(recipeEditQty) || recipeScanResult.suggested_grams,
                  );
                } else if (dir === 'up' || dir === 'left') {
                  setRecipeScanResult(null);
                }
              }}
              onEdit={() => setRecipeEditOpen(true)}
            />
          )}

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
        </>
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

      </div>

      <BottomSheet open={recipeEditOpen} onClose={() => setRecipeEditOpen(false)} title="Edit recipe scan">
        <label className="field">
          Food name
          <input value={recipeEditName} onChange={(e) => setRecipeEditName(e.target.value)} />
        </label>
        <label className="field">
          Quantity (g)
          <input type="number" value={recipeEditQty} onChange={(e) => setRecipeEditQty(e.target.value)} />
        </label>
        <button
          type="button"
          onClick={() => {
            void logRecipeScan(recipeEditName, Number.parseFloat(recipeEditQty));
            setRecipeEditOpen(false);
          }}
        >
          Log food
        </button>
      </BottomSheet>

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

      <div role="status" aria-live="polite">
        {success && <div className="banner banner-ok">{success}</div>}
      </div>
      {error && <div className="banner banner-warn" role="alert">{error}</div>}
    </section>
  );
}
