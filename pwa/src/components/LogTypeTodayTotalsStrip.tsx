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
    const remainingPart =
      hasCalorieTarget && remaining != null
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
          className="progress-fill"
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
      <p className="muted macro-line log-type-totals-strip__footer">
        {hasCalorieTarget && remaining != null
          ? `${formatKcal(remaining)} kcal remaining`
          : data?.calories != null
            ? `${formatKcal(data.calories)} kcal today`
            : '—'}
      </p>
    </Card>
  );
}