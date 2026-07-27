import { BarcodeScanner } from './BarcodeScanner';
import { Card } from './ui/Card';
import { MealPlanQuickAddBar } from './MealPlanQuickAddBar';
import type { FoodLogItem, FoodSearchResult, FoodTodayResponse } from '../lib/api';
import type { OptimisticFoodEntry } from '../hooks/useOptimisticFoodLog';
import type { MealPlanEntry } from '../lib/mealPlanQueue';
import { MEAL_TYPES } from '../lib/logSectionShared';
import { scaleOffMacros, type OffProduct } from '../lib/openFoodFacts';
import { formatRelativeTime } from '../lib/relativeTime';

export interface LogTypeTabPanelProps {
  serverOnline: boolean;
  loading: boolean;
  offProduct: OffProduct | null;
  offQuantity: string;
  description: string;
  mealType: string;
  foodName: string;
  quantity: string;
  searchResults: FoodSearchResult[];
  pending: OptimisticFoodEntry[];
  data: FoodTodayResponse | null;
  mealPlan: MealPlanEntry[];
  loggingMealKey: string | null;
  onLogMealPlanEntry: (entry: MealPlanEntry) => void;
  onBarcodeScan: (code: string) => void;
  onOffQuantityChange: (value: string) => void;
  onLogOffProduct: () => void;
  onVoiceLog: (e: React.FormEvent) => void;
  onDescriptionChange: (value: string) => void;
  onMealTypeChange: (value: string) => void;
  onManualLog: (e: React.FormEvent) => void;
  onFoodNameChange: (value: string) => void;
  onSelectSearchResult: (name: string) => void;
  onQuantityChange: (value: string) => void;
  onRetryPending: (entry: OptimisticFoodEntry) => void;
  onDismissPending: (id: string) => void;
  onDeleteItem: (row: number) => void;
}

export function LogTypeTabPanel({
  serverOnline,
  loading,
  offProduct,
  offQuantity,
  description,
  mealType,
  foodName,
  quantity,
  searchResults,
  pending,
  data,
  mealPlan,
  loggingMealKey,
  onLogMealPlanEntry,
  onBarcodeScan,
  onOffQuantityChange,
  onLogOffProduct,
  onVoiceLog,
  onDescriptionChange,
  onMealTypeChange,
  onManualLog,
  onFoodNameChange,
  onSelectSearchResult,
  onQuantityChange,
  onRetryPending,
  onDismissPending,
  onDeleteItem,
}: LogTypeTabPanelProps) {
  const offQty = Number.parseFloat(offQuantity);
  const offScaled =
    offProduct && offQty > 0 ? scaleOffMacros(offProduct.per100g, offQty) : null;

  return (
    <>
      <MealPlanQuickAddBar
        meals={mealPlan}
        loggingMealKey={loggingMealKey}
        serverOnline={serverOnline}
        onLogEntry={onLogMealPlanEntry}
      />

      <Card>
        <h2>Barcode</h2>
        <p className="muted">Scan packaged food — looks up your sheet, then Open Food Facts</p>
        <BarcodeScanner disabled={loading} onScan={onBarcodeScan} />
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
              onChange={(e) => onOffQuantityChange(e.target.value)}
              disabled={loading}
            />
          </label>
          {offScaled && (
            <p className="muted">
              For {offQty}g: {offScaled.calories} kcal · {offScaled.protein}g protein
            </p>
          )}
          <button type="button" disabled={loading} onClick={onLogOffProduct}>
            Log from Open Food Facts
          </button>
          <p className="muted">Or pick a matching food from your sheet below</p>
        </Card>
      )}

      <form className="card" onSubmit={onVoiceLog}>
        <h2>Quick log</h2>
        <label className="field">
          What did you eat?
          <input
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="200g paneer and 250g broccoli"
            disabled={!serverOnline || loading}
          />
        </label>
        <label className="field">
          Meal
          <select
            value={mealType}
            onChange={(e) => onMealTypeChange(e.target.value)}
            disabled={!serverOnline || loading}
          >
            {MEAL_TYPES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={!serverOnline || loading || !description.trim()}>
          Log meal
        </button>
      </form>

      <form className="card" onSubmit={onManualLog}>
        <h2>Manual entry</h2>
        <label className="field">
          Food
          <input
            value={foodName}
            onChange={(e) => onFoodNameChange(e.target.value)}
            placeholder="Arla Paneer"
            disabled={!serverOnline || loading}
            autoComplete="off"
          />
        </label>
        {searchResults.length > 0 && (
          <ul className="search-suggestions">
            {searchResults.map((r) => (
              <li key={r.name}>
                <button type="button" onClick={() => onSelectSearchResult(r.name)}>
                  {r.name}
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
            onChange={(e) => onQuantityChange(e.target.value)}
            disabled={!serverOnline || loading}
          />
        </label>
        <button type="submit" disabled={!serverOnline || loading || !foodName.trim()}>
          Add
        </button>
      </form>

      <Card>
        <h2>Today&apos;s log</h2>
        {!pending.length && !data?.items.length ? (
          <p className="muted">No entries yet.</p>
        ) : (
          <ul className="food-list">
            {pending.map((entry) => {
              const queuedAgo = entry.created_at ? formatRelativeTime(entry.created_at) : '';
              const statusSuffix =
                entry.status === 'pending'
                  ? ' · Saving…'
                  : entry.status === 'queued'
                    ? queuedAgo
                      ? ` · Queued ${queuedAgo}`
                      : ' · Queued offline'
                    : ' · Failed to save';
              return (
                <li key={entry.id} className={`food-row food-row--${entry.status}`}>
                  <div>
                    <strong>{entry.food}</strong>
                    <span className="muted">
                      {entry.quantity_g > 0 ? ` · ${entry.quantity_g}g` : ''}
                      {entry.source === 'macros' ? ' · Open Food Facts' : ''}
                      {statusSuffix}
                    </span>
                  </div>
                  {entry.status === 'failed' && (
                    <div className="food-row-actions">
                      <button type="button" className="btn-small" onClick={() => onRetryPending(entry)}>
                        Retry
                      </button>
                      <button
                        type="button"
                        className="btn-small btn-danger"
                        aria-label="Dismiss failed entry"
                        onClick={() => onDismissPending(entry.id)}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
            {data?.items.map((item: FoodLogItem) => (
              <li key={item.row} className="food-row">
                <div>
                  <strong>{item.food}</strong>
                  <span className="muted">
                    {' '}
                    · {item.quantity_g}g · {item.protein.toFixed(1)}g protein
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-small btn-danger"
                  aria-label={`Remove ${item.food}`}
                  onClick={() => onDeleteItem(item.row)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
