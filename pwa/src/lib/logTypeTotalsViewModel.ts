import type { FoodTodayResponse } from './api';
import { proteinProgressPct } from './foodSectionShared';
import { formatGrams, formatKcal, kcalProgressPct, kcalRemaining } from './logTypeTotals';

export interface LogTypeTotalsViewModel {
  consumed: number;
  protein: number;
  proteinTarget: number | null | undefined;
  calorieText: string;
  proteinText: string;
  kcalPct: number;
  proteinPct: number;
  hasCalorieTarget: boolean;
  goalReached: boolean;
  hasMacros: boolean;
  carbs: number;
  fat: number;
  announceText: string;
  footerText: string;
  // relay-223: pending sync badge text. When non-null, the component renders
  // a muted badge after the footer line. `pendingWord` is the singular/plural
  // noun ("meal" or "meals") so callers can compose the visual label without
  // re-deriving the count.
  pendingBadgeText: string | null;
}

export function buildLogTypeTotalsViewModel(
  data: FoodTodayResponse | null,
  calorieTarget: number | null,
  pendingCount: number = 0,
): LogTypeTotalsViewModel {
  const consumed = data?.calories ?? 0;
  const protein = data?.protein_g ?? 0;
  const proteinTarget = data?.protein_target_g;
  const kcalPct = kcalProgressPct(consumed, calorieTarget);
  const proteinPct = proteinProgressPct(protein, proteinTarget);
  const remaining = kcalRemaining(consumed, calorieTarget);
  const hasCalorieTarget = calorieTarget != null && calorieTarget > 0;
  const goalReached = hasCalorieTarget && kcalPct >= 100;
  const hasMacros = data?.carbs != null && data?.fat != null;

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

  const footerText = goalReached
    ? 'Goal reached'
    : hasCalorieTarget && remaining != null
      ? `${formatKcal(remaining)} kcal remaining`
      : data?.calories != null
        ? `${formatKcal(data.calories)} kcal today`
        : '—';

  const pendingWord = pendingCount === 1 ? 'meal' : 'meals';
  const pendingBadgeText = pendingCount > 0 ? `${pendingCount} ${pendingWord} pending sync` : null;
  const pendingAnnouncePart = pendingCount > 0 ? `${pendingCount} ${pendingWord} pending sync` : '';

  return {
    consumed,
    protein,
    proteinTarget,
    calorieText: `${formatKcal(consumed)} kcal${hasCalorieTarget ? ` / ${formatKcal(calorieTarget)}` : ''}`,
    proteinText: `${formatGrams(protein)}g${proteinTarget != null ? ` / ${formatGrams(proteinTarget)}g` : ''}`,
    kcalPct,
    proteinPct,
    hasCalorieTarget,
    goalReached,
    hasMacros,
    carbs: data?.carbs ?? 0,
    fat: data?.fat ?? 0,
    announceText: [kcalPart, proteinPart, remainingPart, pendingAnnouncePart].filter(Boolean).join('. '),
    footerText,
    pendingBadgeText,
  };
}
