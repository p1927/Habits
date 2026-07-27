import type { FoodSearchResult } from '../lib/api';

export interface LogManualEntryFormProps {
  serverOnline: boolean;
  loading: boolean;
  foodName: string;
  quantity: string;
  searchResults: FoodSearchResult[];
  onFoodNameChange: (value: string) => void;
  onSelectSearchResult: (name: string) => void;
  onQuantityChange: (value: string) => void;
  onManualLog: (e: React.FormEvent) => void;
}

export function LogManualEntryForm({
  serverOnline,
  loading,
  foodName,
  quantity,
  searchResults,
  onFoodNameChange,
  onSelectSearchResult,
  onQuantityChange,
  onManualLog,
}: LogManualEntryFormProps) {
  return (
    <form className="ui-card ui-card--default log-type-card home-export-card--health" onSubmit={onManualLog}>
      <p className="section-eyebrow">Search</p>
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
      <button type="submit" className="btn-pill" disabled={!serverOnline || loading || !foodName.trim()}>
        Add
      </button>
    </form>
  );
}
