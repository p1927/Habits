import { Card } from './ui/Card';
import { shortcutModifierLabel } from '../lib/logSectionShared';
import type { MealPlanEntry } from '../lib/mealPlanQueue';

export interface MealPlanTodayCardProps {
  mealPlan: MealPlanEntry[];
  loggingMealKey: string | null;
  loggingMeals: boolean;
  onLogEntry: (entry: MealPlanEntry) => void;
  onLogAll: () => void;
  hideWhenEmpty?: boolean;
  message?: string;
  hideMessage?: boolean;
  className?: string;
  logAllClassName?: string;
  showShortcut?: boolean;
  disableLogAllWhenItemLogging?: boolean;
}

export function MealPlanTodayCard({
  mealPlan,
  loggingMealKey,
  loggingMeals,
  onLogEntry,
  onLogAll,
  hideWhenEmpty = false,
  message,
  hideMessage = false,
  className,
  logAllClassName,
  showShortcut = false,
  disableLogAllWhenItemLogging = false,
}: MealPlanTodayCardProps) {
  if (hideWhenEmpty && mealPlan.length === 0) return null;

  const logAllDisabled = loggingMeals || (disableLogAllWhenItemLogging && !!loggingMealKey);

  return (
    <Card className={className}>
      <h2>Today&apos;s meal plan</h2>
      <p className="muted">
        From WEEK MEALS sheet
        {showShortcut && (
          <>
            {' '}
            · shortcut <kbd>{shortcutModifierLabel()}3</kbd>
          </>
        )}
      </p>
      {message && !hideMessage && <p className="banner banner-ok home-meal-plan-msg">{message}</p>}
      {!mealPlan.length ? (
        <p className="muted">No meals planned for today.</p>
      ) : (
        <>
          <ul className="food-list">
            {mealPlan.map((m) => (
              <li key={m.meal} className="food-row">
                <div>
                  <strong>{m.label}</strong>
                  <span className="muted">{m.description}</span>
                </div>
                <button
                  type="button"
                  className="btn-small"
                  disabled={loggingMealKey === m.meal}
                  aria-label={`Log ${m.label}`}
                  onClick={() => onLogEntry(m)}
                >
                  {loggingMealKey === m.meal ? 'Logging…' : 'Log'}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className={logAllClassName} disabled={logAllDisabled} onClick={onLogAll}>
            {loggingMeals ? 'Logging…' : 'Log all planned meals'}
          </button>
        </>
      )}
    </Card>
  );
}
