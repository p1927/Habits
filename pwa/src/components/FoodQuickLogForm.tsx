import { FOOD_MEAL_TYPES } from '../lib/foodSectionShared';

interface FoodQuickLogFormProps {
  description: string;
  mealType: string;
  loading: boolean;
  serverOnline: boolean;
  onDescriptionChange: (value: string) => void;
  onMealTypeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FoodQuickLogForm({
  description,
  mealType,
  loading,
  serverOnline,
  onDescriptionChange,
  onMealTypeChange,
  onSubmit,
}: FoodQuickLogFormProps) {
  return (
    <form className="ui-card ui-card--default log-type-card home-export-card--health" onSubmit={onSubmit}>
      <p className="section-eyebrow">Voice</p>
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
        <select value={mealType} onChange={(e) => onMealTypeChange(e.target.value)} disabled={!serverOnline || loading}>
          {FOOD_MEAL_TYPES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn-pill" disabled={!serverOnline || loading || !description.trim()}>
        Log meal
      </button>
    </form>
  );
}
