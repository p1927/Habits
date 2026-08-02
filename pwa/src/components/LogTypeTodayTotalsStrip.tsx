import { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { api, ApiError, type FoodTodayResponse } from '../lib/api';
import { formatGrams, formatKcal, kcalProgressPct, kcalRemaining } from '../lib/logTypeTotals';
import { proteinProgressPct } from '../lib/foodSectionShared';

export interface LogTypeTodayTotalsStripProps {
  data: FoodTodayResponse | null;
  serverOnline: boolean;
}

export function LogTypeTodayTotalsStrip({ data, serverOnline }: LogTypeTodayTotalsStripProps) {
  const [calorieTarget, setCalorieTarget] = useState<number | null>(null);
  // Expanded panel state for the carbs/fat breakdown (relay-222).
  // Persists across renders but resets when the strip unmounts — appropriate
  // because the strip lives above the today list and is not a sticky
  // navigation surface.
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!serverOnline) {
      setCalorieTarget(null);
      return;
    }
    let cancelled = false;
    api
      .getFoodTargets()
      .then((targets) => {
        if (cancelled) return;
        setCalorieTarget(targets.calorie_target ?? null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) return;
        setCalorieTarget(null);
      });
    return () => {
      cancelled = true;
    };
  }, [serverOnline]);

  const consumed = data?.calories ?? 0;
  const protein = data?.protein_g ?? 0;
  const proteinTarget = data?.protein_target_g;
  const kcalPct = kcalProgressPct(consumed, calorieTarget);
  const proteinPct = proteinProgressPct(protein, proteinTarget);
  const remaining = kcalRemaining(consumed, calorieTarget);
  const hasCalorieTarget = calorieTarget != null && calorieTarget > 0;
  // kcalProgressPct already clamps at 100 — reuse it to detect goal reached
  // (consumed >= target when target is set). At 100% we promote the strip to a
  // "goal reached" variant: green fill and a footer that no longer talks about
  // remaining calories.
  const goalReached = hasCalorieTarget && kcalPct >= 100;

  // Backend always returns carbs + fat as non-null numbers today, but the AC
  // for relay-222 specifies the panel renders only when non-null macros are
  // present. Guard with an explicit null check so the panel stays absent if the
  // backend contract changes (or if a caller passes a partial FoodTodayResponse
  // shape in tests).
  const hasMacros = data?.carbs != null && data?.fat != null;
  const carbs = data?.carbs ?? 0;
  const fat = data?.fat ?? 0;

  // Build the spoken announcement once so screen readers get a clean summary
  // on every change. We compute it eagerly (rather than as a memo) because
  // `consumed`, `protein`, and the target-derived strings are all primitives.
  const announceText = (() => {
    const kcalPart = hasCalorieTarget
      ? `${formatKcal(consumed)} of ${formatKcal(calorieTarget)} kilocalories`
      : `${formatKcal(consumed)} kilocalories`;
    const proteinPart =
      proteinTarget != null
        ? `${formatGrams(protein)} of ${formatGrams(proteinTarget)} grams protein`
        : `${formatGrams(protein)} grams protein`;
    const remainingPart = goalReached
      ? 'Goal reached'
      : hasCalorieTarget && remaining != null
        ? `${formatKcal(remaining)} kilocalories remaining`
        : '';
    return [kcalPart, proteinPart, remainingPart].filter(Boolean).join('. ');
  })();

  return (
    <Card
      className="log-type-totals-strip home-export-card--health"
      ariaLabel="Today's calorie and protein totals"
    >
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announceText}
      </div>
      <p className="section-eyebrow">Today</p>
      <div className="progress-label">
        <span>Calories</span>
        <span>
          {formatKcal(consumed)} kcal{hasCalorieTarget ? ` / ${formatKcal(calorieTarget)}` : ''}
        </span>
      </div>
      <div className="progress-bar" aria-hidden="true">
        <div
          className={`progress-fill${goalReached ? ' progress-fill--goal-reached' : ''}`}
          style={{ width: hasCalorieTarget ? `${kcalPct}%` : '0%' }}
        />
      </div>
      <p className="progress-label log-type-totals-strip__protein">
        <span>Protein</span>
        <span>
          {formatGrams(protein)}g{proteinTarget != null ? ` / ${formatGrams(proteinTarget)}g` : ''}
        </span>
      </p>
      <div className="progress-bar progress-bar--thin" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${proteinPct}%` }} />
      </div>
      {hasMacros ? (
        <button
          type="button"
          className="log-type-totals-strip__expand"
          aria-expanded={expanded}
          aria-controls="log-type-totals-strip-macros"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Hide macros' : 'Show macros'}
        </button>
      ) : null}
      {hasMacros && expanded ? (
        <div
          id="log-type-totals-strip-macros"
          className="log-type-totals-strip__macros"
          data-testid="log-type-totals-strip-macros"
        >
          <p className="progress-label log-type-totals-strip__macro">
            <span>Carbs</span>
            <span>{formatGrams(carbs)}g</span>
          </p>
          <div className="progress-bar progress-bar--thin" aria-hidden="true">
            <div className="progress-fill" style={{ width: '0%' }} />
          </div>
          <p className="progress-label log-type-totals-strip__macro">
            <span>Fat</span>
            <span>{formatGrams(fat)}g</span>
          </p>
          <div className="progress-bar progress-bar--thin" aria-hidden="true">
            <div className="progress-fill" style={{ width: '0%' }} />
          </div>
        </div>
      ) : null}
      <p className={`muted macro-line log-type-totals-strip__footer${goalReached ? ' log-type-totals-strip__footer--goal-reached' : ''}`}>
        {goalReached
          ? 'Goal reached'
          : hasCalorieTarget && remaining != null
            ? `${formatKcal(remaining)} kcal remaining`
            : data?.calories != null
              ? `${formatKcal(data.calories)} kcal today`
              : '—'}
      </p>
    </Card>
  );
}