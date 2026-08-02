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
  // relay-225: empty-state fallback. When true, the strip shows zeroed values
  // plus a "No meals logged yet" message and deliberately avoids framing
  // kcal/protein as progress toward a target (no progress bars, no
  // "remaining"/"Goal reached" copy, no Show macros toggle).
  hasNoMealsLogged: boolean;
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
  // relay-225: empty state. Zero meals logged today = no items array entries
  // (or no payload) and zero (or absent) calories. We also treat a null data
  // payload as "no meals logged" so the user always sees the same explicit
  // message on first paint, never a bare em-dash.
  const itemsCount = data?.items?.length ?? 0;
  const hasNoMealsLogged = itemsCount === 0 && consumed === 0;

  const kcalPart = hasCalorieTarget
    ? `${formatKcal(consumed)} of ${formatKcal(calorieTarget)} kilocalories`
    : `${formatKcal(consumed)} kilocalories`;
  const proteinPart =
    proteinTarget != null
      ? `${formatGrams(protein)} of ${formatGrams(proteinTarget)} grams protein`
      : `${formatGrams(protein)} grams protein`;
  // relay-225: in the empty state the strip should not claim anything about
  // progress (no "Goal reached"/"kcal remaining"). The macro breakdown button
  // is also suppressed via `hasMacros` overriding below — but we additionally
  // force the announce path to end with the explicit message.
  const remainingPart = hasNoMealsLogged
    ? 'No meals logged yet'
    : goalReached
      ? 'Goal reached'
      : hasCalorieTarget && remaining != null
        ? `${formatKcal(remaining)} kilocalories remaining`
        : '';

  const footerText = hasNoMealsLogged
    ? 'No meals logged yet'
    : goalReached
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
    // relay-225: even if the backend coincidentally returned macros on an
    // empty day, do not surface the Show macros toggle in the empty state —
    // the strip is not asking the user to drill down into zero grams.
    hasMacros: hasMacros && !hasNoMealsLogged,
    carbs: data?.carbs ?? 0,
    fat: data?.fat ?? 0,
    announceText: [kcalPart, proteinPart, remainingPart, pendingAnnouncePart].filter(Boolean).join('. '),
    footerText,
    pendingBadgeText,
    hasNoMealsLogged,
  };
}
