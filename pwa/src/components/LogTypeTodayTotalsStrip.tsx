import { Card } from './ui/Card';
import type { FoodTodayResponse } from '../lib/api';
import {
  formatGrams,
  formatKcal,
  kcalProgressPct,
  kcalRemaining,
} from '../lib/logTypeTotals';
import { proteinProgressPct } from '../lib/foodSectionShared';

export interface LogTypeTodayTotalsStripProps {
  data: FoodTodayResponse | null;
  calorieTarget: number | null;
}

export function LogTypeTodayTotalsStrip({ data, calorieTarget }: LogTypeTodayTotalsStripProps) {
  const consumed = data?.calories ?? 0;
  const protein = data?.protein_g ?? 0;
  const proteinTarget = data?.protein_target_g;
  const kcalPct = kcalProgressPct(consumed, calorieTarget);
  const proteinPct = proteinProgressPct(protein, proteinTarget);
  const remaining = kcalRemaining(consumed, calorieTarget);
  const hasCalorieTarget = calorieTarget != null && calorieTarget > 0;

  return (
    <Card
      className="log-type-totals-strip progress-card home-export-card--health"
      ariaLabel="Today's calorie and protein totals"
    >
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
      <p className="progress-label log-type-totals-strip__protein" aria-live="polite">
        <span>Protein</span>
        <span>
          {formatGrams(protein)}g{proteinTarget != null ? ` / ${formatGrams(proteinTarget)}g` : ''}
        </span>
      </p>
      <div
        className="progress-bar progress-bar--thin"
        aria-hidden="true"
      >
        <div className="progress-fill" style={{ width: `${proteinPct}%` }} />
      </div>
      <p className="muted macro-line log-type-totals-strip__footer">
        {hasCalorieTarget && remaining != null ? (
          <>
            {formatKcal(remaining)} kcal remaining
            {data?.protein_g != null && data.protein_target_g != null ? (
              <span aria-hidden="true"> · </span>
            ) : null}
            {data?.protein_g != null && data.protein_target_g != null
              ? `${formatGrams(protein)}g protein today`
              : null}
          </>
        ) : data?.calories != null ? (
          `${formatKcal(data.calories)} kcal today`
        ) : (
          '—'
        )}
      </p>
    </Card>
  );
}
