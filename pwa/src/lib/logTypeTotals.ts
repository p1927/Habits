export function kcalProgressPct(consumed: number, target: number | null | undefined): number {
  if (!target || target <= 0) return 0;
  return Math.min(100, (consumed / target) * 100);
}

export function kcalRemaining(
  consumed: number,
  target: number | null | undefined,
): number | null {
  if (!target || target <= 0) return null;
  return Math.max(0, target - consumed);
}

export function formatKcal(value: number): string {
  return value.toFixed(0);
}

export function formatGrams(value: number): string {
  return value.toFixed(1);
}

// ---------------------------------------------------------------------------
// Day-over-day comparison (relay-228).
//
// The totals strip surfaces a one-line "vs yesterday" delta for kcal and
// protein when the previous day's totals are known. The comparison is
// intentionally read-only: it never changes the rest of the strip (the empty
// state, the progress bars, the goal-reached styling, etc. all stay
// independent of this block). The output is shaped so the viewmodel can
// append the delta to the footer announce path and the component can render
// the visual line(s) without re-deriving format or sign math.
//
// hasYesterday=false covers both "server returned no history" and "the only
// history row matches today's date" — both cases need the same unavailable
// message because in either case there is no prior day to compare against.
// ---------------------------------------------------------------------------

export interface DayOverDayComparison {
  hasYesterday: boolean;
  yesterdayKcal: number | null;
  yesterdayProtein: number | null;
  kcalDelta: number | null;
  proteinDelta: number | null;
  kcalDeltaText: string | null;
  proteinDeltaText: string | null;
  // Concise message for the case where yesterday's totals cannot be resolved
  // (no history, sheet disconnected, or the only available row is today).
  unavailableText: string;
}

/**
 * Format a kcal delta with an explicit sign and the `kcal vs yesterday`
 * suffix. Zero renders as `Same as yesterday` (delta of 0 reads as a
 * neutral comparison — the "+0 / -0" variants are noisy and reinforce the
 * "this is a delta" framing the user already gets from the context).
 */
export function formatKcalDelta(delta: number): string {
  if (delta === 0) return 'Same as yesterday';
  const abs = Math.abs(delta);
  const sign = delta > 0 ? '+' : '-';
  return `${sign}${abs.toFixed(0)} kcal vs yesterday`;
}

/**
 * Format a protein delta. Same sign conventions as kcal. One decimal place
 * matches the protein line elsewhere in the strip so the two deltas line up
 * visually.
 */
export function formatProteinDelta(delta: number): string {
  if (delta === 0) return 'Same as yesterday';
  const abs = Math.abs(delta);
  const sign = delta > 0 ? '+' : '-';
  return `${sign}${abs.toFixed(1)}g protein vs yesterday`;
}

export const DAY_OVER_DAY_UNAVAILABLE_TEXT =
  'Yesterday totals unavailable';

export function buildDayOverDayComparison(
  todayKcal: number,
  todayProtein: number,
  yesterdayKcal: number | null,
  yesterdayProtein: number | null,
): DayOverDayComparison {
  const hasYesterday = yesterdayKcal != null && yesterdayProtein != null;
  if (!hasYesterday) {
    return {
      hasYesterday: false,
      yesterdayKcal: null,
      yesterdayProtein: null,
      kcalDelta: null,
      proteinDelta: null,
      kcalDeltaText: null,
      proteinDeltaText: null,
      unavailableText: DAY_OVER_DAY_UNAVAILABLE_TEXT,
    };
  }
  // Narrowed: hasYesterday is true implies both args are numbers.
  const yKcal = yesterdayKcal as number;
  const yProtein = yesterdayProtein as number;
  // Sign-symmetric rounding. JS Math.round rounds 0.5 → 1 but -0.5 → -0
  // (banker's-lite asymmetry — see Bugbot Round 85 finding #3). A -0.5
  // kcal delta would render as "Same as yesterday" via formatKcalDelta
  // while a +0.5 kcal delta would render as "+1 kcal vs yesterday".
  // Multiply by sign, round the magnitude, restore the sign so the two
  // edges are treated symmetrically (both round away from zero, which
  // is the user-facing expectation for delta-of-a-half framing).
  const roundSymmetric = (value: number, scale: number): number => {
    const sign = value < 0 ? -1 : 1;
    return sign * Math.round(Math.abs(value) * scale) / scale;
  };
  const kcalDelta = roundSymmetric(todayKcal - yKcal, 1);
  const proteinDelta = roundSymmetric(todayProtein - yProtein, 10);
  return {
    hasYesterday: true,
    yesterdayKcal: yKcal,
    yesterdayProtein: yProtein,
    kcalDelta,
    proteinDelta,
    kcalDeltaText: formatKcalDelta(kcalDelta),
    proteinDeltaText: formatProteinDelta(proteinDelta),
    unavailableText: DAY_OVER_DAY_UNAVAILABLE_TEXT,
  };
}
