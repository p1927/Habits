import type { FoodSearchResult } from '../lib/api';

interface FoodManualEntryFormProps {
  foodName: string;
  quantity: string;
  searchResults: FoodSearchResult[];
  loading: boolean;
  serverOnline: boolean;
  onFoodNameChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onSelectSearchResult: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FoodManualEntryForm({
  foodName,
  quantity,
  searchResults,
  loading,
  serverOnline,
  onFoodNameChange,
  onQuantityChange,
  onSelectSearchResult,
  onSubmit,
}: FoodManualEntryFormProps) {
  return (
    <form className="card" onSubmit={onSubmit}>
      <h2>Manual entry</h2>
      <label className="field">
        Food (from your database)
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
          onChange={(e) => onQuantityChange(e.target.value)}
          disabled={!serverOnline || loading}
        />
      </label>
      <button type="submit" disabled={!serverOnline || loading || !foodName.trim()}>
        Add
      </button>
    </form>
  );
}
