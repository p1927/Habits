import type { SettingsResponse } from '../lib/api';
import {
  SETTINGS_MEAL_PLAN_KEYS,
  SETTINGS_WEEKDAYS,
  settingsMealLabel,
} from '../lib/settingsSectionShared';

interface SettingsMealPlanCardProps {
  settings: SettingsResponse;
  mealDay: string;
  saving: boolean;
  onMealDayChange: (day: string) => void;
  onMealPlanChange: (mealKey: string, day: string, value: string) => void;
  onSave: () => void;
}

export function SettingsMealPlanCard({
  settings,
  mealDay,
  saving,
  onMealDayChange,
  onMealPlanChange,
  onSave,
}: SettingsMealPlanCardProps) {
  return (
    <article className="settings-card">
      <p className="section-eyebrow">Planning</p>
      <h2>Weekly meal plan</h2>
      <label className="settings-row settings-row--input">
        <span className="settings-row-label">Day</span>
        <select className="settings-select" value={mealDay} onChange={(e) => onMealDayChange(e.target.value)}>
          {SETTINGS_WEEKDAYS.map((d) => (
            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>
      </label>
      {SETTINGS_MEAL_PLAN_KEYS.map((mealKey) => {
        const val = settings.meal_plan[mealKey]?.[mealDay] ?? '';
        return (
          <label key={mealKey} className="settings-row settings-row--input">
            <span className="settings-row-label">{settingsMealLabel(mealKey)}</span>
            <input
              className="settings-text-input"
              value={val}
              onChange={(e) => onMealPlanChange(mealKey, mealDay, e.target.value)}
            />
          </label>
        );
      })}
      <div className="settings-actions">
        <button type="button" className="btn-pill" disabled={saving} onClick={onSave}>
          Save meal plan
        </button>
      </div>
    </article>
  );
}
