import type { FoodTodayResponse } from '../lib/api';
import { proteinProgressPct } from '../lib/foodSectionShared';

interface FoodProteinProgressCardProps {
  data: FoodTodayResponse | null;
}

export function FoodProteinProgressCard({ data }: FoodProteinProgressCardProps) {
  const protein = data?.protein_g ?? 0;
  const target = data?.protein_target_g;
  const pct = proteinProgressPct(protein, target);

  return (
    <div className="progress-card card">
      <div className="progress-label">
        <span>Protein today</span>
        <span>
          {protein.toFixed(1)}g{target != null ? ` / ${target}g` : ''}
        </span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="muted macro-line">
        {data
          ? `${data.calories.toFixed(0)} kcal · ${data.carbs.toFixed(1)}g carbs · ${data.fat.toFixed(1)}g fat`
          : '—'}
      </p>
    </div>
  );
}
