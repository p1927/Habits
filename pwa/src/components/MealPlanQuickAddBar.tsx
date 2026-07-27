import type { MealPlanEntry } from '../lib/mealPlanQueue';

export interface MealPlanQuickAddBarProps {
  meals: MealPlanEntry[];
  loggingMealKey: string | null;
  serverOnline: boolean;
  onLogEntry: (entry: MealPlanEntry) => void;
}

/** One-tap chips to log today's WEEK MEALS without opening the Plan sub-tab. */
export function MealPlanQuickAddBar({
  meals,
  loggingMealKey,
  serverOnline,
  onLogEntry,
}: MealPlanQuickAddBarProps) {
  if (!meals.length) return null;

  return (
    <div className="meal-plan-quick-add" aria-label="Quick log from meal plan">
      <p className="section-eyebrow meal-plan-quick-add__label">From WEEK MEALS</p>
      <div className="meal-plan-quick-add__chips" role="group" aria-label="Today's planned meals">
        {meals.map((entry) => {
          const busy = loggingMealKey === entry.meal;
          return (
            <button
              key={entry.meal}
              type="button"
              className="meal-plan-quick-add__chip btn-pill"
              disabled={!serverOnline || busy}
              aria-busy={busy}
              aria-label={`Log ${entry.label}: ${entry.description}`}
              title={entry.description}
              onClick={() => onLogEntry(entry)}
            >
              {busy ? 'Logging…' : entry.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
