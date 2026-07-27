import { MEAL_TYPES } from '../lib/logSectionShared';

export interface LogVoiceQuickFormProps {
  serverOnline: boolean;
  loading: boolean;
  description: string;
  mealType: string;
  onDescriptionChange: (value: string) => void;
  onMealTypeChange: (value: string) => void;
  onVoiceLog: (e: React.FormEvent) => void;
}

export function LogVoiceQuickForm({
  serverOnline,
  loading,
  description,
  mealType,
  onDescriptionChange,
  onMealTypeChange,
  onVoiceLog,
}: LogVoiceQuickFormProps) {
  return (
    <form className="ui-card ui-card--default log-type-card home-export-card--health" onSubmit={onVoiceLog}>
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
      <button type="submit" className="btn-pill" disabled={!serverOnline || loading || !description.trim()}>
        Log meal
      </button>
    </form>
  );
}
