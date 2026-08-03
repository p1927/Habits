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

// ---------------------------------------------------------------------------
// Stale-data indicator (relay-231).
//
// The totals strip is rendered from the latest `FoodTodayResponse` snapshot.
// In normal operation the snapshot is current and the user does not need a
// timestamp — but when the network is delayed, the user is offline, or the
// payload is older than a few seconds, the existing totals can read as
// "current" even though they were captured minutes ago. The strip therefore
// surfaces a single muted line that names the freshness in plain language:
//
//   - "Just updated"          — within the freshness window (default 60s)
//   - "Updated <n>s ago"      — older than the freshness window while online
//   - "Showing offline totals" — server unreachable, keeping last known data
//   - null                    — no data (the empty state owns the message)
//
// The indicator is computed purely from `freshnessMs` (the elapsed time
// between the data being received and "now") and `serverOnline`. The
// component owns the timer (setInterval ticks every ~15s to recompute the
// relative time) so the helper itself stays a pure function and tests can
// drive it with a fixed `freshnessMs` value.
// ---------------------------------------------------------------------------

export type StaleIndicatorKind = 'fresh' | 'stale' | 'offline';

export interface StaleIndicator {
  kind: StaleIndicatorKind;
  text: string;
}

/** Freshness window: data this fresh reads as "Just updated". */
export const STALE_INDICATOR_FRESH_MS = 60_000;

/** Tunable for tests — the rounding bucket for the relative time display. */
export function formatRelativeUpdatedAt(freshnessMs: number): string {
  if (freshnessMs < 5_000) return 'Just updated';
  if (freshnessMs < 60_000) {
    const seconds = Math.floor(freshnessMs / 1000);
    return `Updated ${seconds}s ago`;
  }
  const minutes = Math.floor(freshnessMs / 60_000);
  return `Updated ${minutes}m ago`;
}

/**
 * Build the stale-data indicator for the totals strip.
 *
 *   - dataIsStale=false: caller has no data (empty state owns the message),
 *     so the indicator is suppressed entirely (null).
 *   - serverOnline=false with data present: "Showing offline totals" so the
 *     user knows the numbers on screen are a snapshot from before the
 *     disconnect — they should not be read as the live current state.
 *   - serverOnline=true with data present: the relative freshness string.
 *
 * Kept pure (no Date.now()) so the unit tests can pin both branches
 * deterministically.
 */
export function buildStaleIndicator(
  dataIsStale: boolean,
  serverOnline: boolean,
  freshnessMs: number,
): StaleIndicator | null {
  if (!dataIsStale) return null;
  if (!serverOnline) {
    return { kind: 'offline', text: 'Showing offline totals' };
  }
  return {
    kind: freshnessMs < STALE_INDICATOR_FRESH_MS ? 'fresh' : 'stale',
    text: formatRelativeUpdatedAt(freshnessMs),
  };
}
