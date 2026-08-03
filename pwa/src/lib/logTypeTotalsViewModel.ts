import type { FoodTodayResponse } from './api';
import { proteinProgressPct } from './foodSectionShared';
import { formatGrams, formatKcal, kcalProgressPct, kcalRemaining } from './logTypeTotals';

// TotalsState — single classification for the LogTypeTodayTotalsStrip.
//
// ch-patchwork-log-totals: the previous buildLogTypeTotalsViewModel mixed
// every relay-N display state (empty / goal-reached / target-unset / tracking)
// into four independent flag combinations, so each new state needed to be
// threaded through `remainingPart`, `footerText`, `setupHint`, and `hasMacros`
// independently. classifyTotalsState() funnels those into one value, and the
// text builders dispatch on it. Future states add one enum value + one branch
// instead of three-or-four scattered conditionals.
//
// The state machine, in priority order:
//   1. empty           — zero meals logged today, regardless of target
//   2. goal-reached    — meals logged, target set, kcal >= 100%
//   3. target-unset    — meals logged, no calorie target configured
//   4. tracking        — meals logged, target set, under 100%
export type TotalsState = 'empty' | 'goal-reached' | 'target-unset' | 'tracking';

export function classifyTotalsState(
  data: FoodTodayResponse | null,
  calorieTarget: number | null,
  hasGoalReached: boolean,
): TotalsState {
  const itemsCount = data?.items?.length ?? 0;
  const consumed = data?.calories ?? 0;
  // relay-225: empty state. Zero meals logged today = no items array entries
  // (or no payload) and zero (or absent) calories. We also treat a null data
  // payload as "no meals logged" so the user always sees the same explicit
  // message on first paint, never a bare em-dash.
  const hasNoMealsLogged = itemsCount === 0 && consumed === 0;
  if (hasNoMealsLogged) return 'empty';
  if (hasGoalReached) return 'goal-reached';
  const hasCalorieTarget = calorieTarget != null && calorieTarget > 0;
  if (!hasCalorieTarget) return 'target-unset';
  return 'tracking';
}

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
  // relay-226: target-unset state. When non-null, the strip has no calorie
  // target configured but the user has logged at least one meal today. The
  // progress bars are suppressed (a 0% bar reads as "you have progress to
  // make" even when there's no target to make progress toward), the footer
  // carries "<consumed> kcal today" copy without a "remaining" claim, and a
  // concise `setupHint` explains how to set a target. Suppressed in the
  // empty state (relay-225 owns that message) and when the user has logged
  // zero meals — we don't want to nag before they've even started.
  setupHint: string | null;
  // ch-patchwork-log-totals: state classifier. Exposed so callers and tests
  // can branch on a single value instead of recomputing the flag combination.
  // Defaults are not allowed — every code path sets this explicitly.
  state: TotalsState;
}

const SETUP_HINT_TEXT = 'Set a daily calorie target in Settings to track progress.';

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
  const itemsCount = data?.items?.length ?? 0;
  const hasNoMealsLogged = itemsCount === 0 && consumed === 0;

  const state = classifyTotalsState(data, calorieTarget, goalReached);

  const kcalPart = hasCalorieTarget
    ? `${formatKcal(consumed)} of ${formatKcal(calorieTarget)} kilocalories`
    : `${formatKcal(consumed)} kilocalories`;
  const proteinPart =
    proteinTarget != null
      ? `${formatGrams(protein)} of ${formatGrams(proteinTarget)} grams protein`
      : `${formatGrams(protein)} grams protein`;

  // ch-patchwork-log-totals: dispatch on the classified state. Each state
  // owns one announce suffix, one footer line, and its own setup-hint /
  // hasMacros semantics. The "tracking" state (the only state that can
  // claim a "remaining" value) is the only branch that reads `remaining`.
  const remainingPart =
    state === 'empty'
      ? 'No meals logged yet'
      : state === 'goal-reached'
        ? 'Goal reached'
        : state === 'tracking' && remaining != null
          ? `${formatKcal(remaining)} kilocalories remaining`
          : '';

  const footerText =
    state === 'empty'
      ? 'No meals logged yet'
      : state === 'goal-reached'
        ? 'Goal reached'
        : state === 'tracking' && remaining != null
          ? `${formatKcal(remaining)} kcal remaining`
          : data?.calories != null
            ? `${formatKcal(data.calories)} kcal today`
            : '—';

  // relay-226: setup hint. Only when the user has logged at least one meal
  // today AND there is no calorie target configured. The empty state
  // (relay-225's "No meals logged yet") is the right message when there is
  // nothing to plot; nudging the user to configure a target before they
  // have any data is noise.
  const setupHint = state === 'target-unset' ? SETUP_HINT_TEXT : null;

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
    setupHint,
    state,
  };
}
