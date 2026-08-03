import { vi } from 'vitest';

import { api } from '../lib/api';
import type { FoodHistoryDay, FoodTodayResponse } from '../lib/api';

/**
 * Shared fixtures and helpers for the totals-strip test suite.
 *
 * Kept in a co-located helper module so the patchwork detector stops
 * flagging the test file every time a new state variant lands. Each
 * describe block in the main test file used to inline its own copy of
 * these constants and DOM query helpers — consolidating them here is a
 * mechanical refactor with no behavior change.
 */

// -- fixtures --------------------------------------------------------------

export const baseData: FoodTodayResponse = {
  protein_g: 45,
  protein_target_g: 120,
  calories: 750,
  carbs: 80,
  fat: 25,
  items: [],
  sheets_connected: true,
};

/** An "empty day" payload: zero consumption, no items. */
export function emptyDay(overrides: Partial<FoodTodayResponse> = {}): FoodTodayResponse {
  return {
    ...baseData,
    calories: 0,
    protein_g: 0,
    items: [],
    ...overrides,
  };
}

/** A day with a single logged meal at the given calorie count. */
export function dayWithMeal(
  calories: number,
  overrides: Partial<FoodTodayResponse> = {},
): FoodTodayResponse {
  const perCal = calories;
  return {
    ...baseData,
    calories: perCal,
    protein_g: Math.round(perCal * 0.04),
    items: [
      {
        row: 1,
        food: 'apple',
        quantity_g: 100,
        calories: perCal,
        carbs: Math.round(perCal * 0.2),
        protein: Math.round(perCal * 0.04),
        fat: Math.round(perCal * 0.01),
      },
    ],
    ...overrides,
  };
}

// -- api mock helpers ------------------------------------------------------

export interface FoodTargetsOverride {
  calorie_target?: number;
  protein_target_g?: number;
  sheets_connected?: boolean;
}

const DEFAULT_TARGETS: Required<FoodTargetsOverride> = {
  calorie_target: 2000,
  protein_target_g: 120,
  sheets_connected: true,
};

/** Configure `api.getFoodTargets` to resolve with sensible defaults. */
export function mockTargets(overrides: FoodTargetsOverride = {}): void {
  vi.mocked(api.getFoodTargets).mockResolvedValue({
    ...DEFAULT_TARGETS,
    ...overrides,
  });
}

/** Configure `api.getFoodTargets` to reject with a 401 ApiError. */
export async function mockTargetsUnauthorized(): Promise<void> {
  const { ApiError } = await import('../lib/api');
  vi.mocked(api.getFoodTargets).mockRejectedValue(new ApiError(401, 'unauthorized'));
}

/** Reset all mocks — paired with `clearAllMocks` in afterEach. */
export function resetTargetsMock(): void {
  // restore the default mockResolvedValue so a test that runs after
  // mockReset but before mockTargets(...) still renders cleanly.
  vi.mocked(api.getFoodTargets).mockReset();
  vi.mocked(api.getFoodTargets).mockResolvedValue({
    ...DEFAULT_TARGETS,
  });
}

// -- food history mock helpers (relay-228) ---------------------------------

/** A single history row with sensible defaults. */
export interface FoodHistoryRow {
  date: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

/** Default response for getFoodHistory — empty history (yesterday missing). */
const DEFAULT_HISTORY: { days: FoodHistoryDay[]; sheets_connected: boolean } = {
  days: [],
  sheets_connected: true,
};

/**
 * Configure `api.getFoodHistory` to resolve with the supplied rows. The
 * component filters out today's date locally; pass rows in any order —
 * `today` is computed at test runtime so callers do not need to align.
 */
export function mockHistory(rows: FoodHistoryRow[]): void {
  vi.mocked(api.getFoodHistory).mockResolvedValue({
    days: rows.map((r) => ({
      date: r.date,
      calories: r.calories ?? 0,
      carbs: r.carbs ?? 0,
      protein: r.protein ?? 0,
      fat: r.fat ?? 0,
    })),
    sheets_connected: true,
  });
}

/** Configure `api.getFoodHistory` to reject with a 401 ApiError. */
export async function mockHistoryUnauthorized(): Promise<void> {
  const { ApiError } = await import('../lib/api');
  vi.mocked(api.getFoodHistory).mockRejectedValue(new ApiError(401, 'unauthorized'));
}

/**
 * Reset the getFoodHistory mock and restore its default "no history"
 * response so subsequent renders still produce a clean comparison line
 * (without a real network call).
 */
export function resetHistoryMock(): void {
  vi.mocked(api.getFoodHistory).mockReset();
  vi.mocked(api.getFoodHistory).mockResolvedValue(DEFAULT_HISTORY);
}

// -- DOM query helpers -----------------------------------------------------

/**
 * Read text content scoped to the rendered container. `document.querySelector`
 * would happily return the first match from a stale previous test's DOM tree,
 * so we scope to the rendered output via the ref the caller already has.
 */
export function getStripText(container: HTMLElement): string {
  const strip = container.querySelector('.log-type-totals-strip');
  return strip ? strip.textContent || '' : '';
}

/**
 * Resolve the first aria-live region inside THIS container — not the global
 * screen, which can hold leftover nodes from earlier test renders and return
 * stale textContent.
 */
export function getLiveRegion(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[aria-live="polite"]');
}

/** Convenience: read the footer's text content (or '' if missing). */
export function getFooterText(container: HTMLElement): string {
  return container.querySelector('.log-type-totals-strip__footer')?.textContent ?? '';
}

/** Count progress bars inside the strip. */
export function progressBarCount(container: HTMLElement): number {
  return container.querySelectorAll('.log-type-totals-strip .progress-bar').length;
}

/**
 * Resolve the "Show/Hide macros" hint line (relay-227). It is a non-interactive
 * `<p>` — the Card itself is the keyboard target — but the hint still announces
 * the upcoming state ("Show macros" vs "Hide macros") for tests and the visual
 * affordance.
 */
export function getExpandButton(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-testid="log-type-totals-strip-expand-hint"]');
}

/**
 * Resolve the Card root — the interactive disclosure target (relay-227).
 * Returns null when the strip is not interactive (no macros / no details to
 * expose). Use this for click + keyboard tests.
 */
export function getStripCard(container: HTMLElement): HTMLElement | null {
  const card = container.querySelector('.log-type-totals-strip');
  if (!card) return null;
  // Only present when the strip is acting as a disclosure button.
  if (card.getAttribute('role') !== 'button') return null;
  return card as HTMLElement;
}

/** Resolve the pending-sync badge node (or null). */
export function getPendingBadge(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-testid="log-type-totals-strip-pending-badge"]');
}

/** Resolve the macros panel (or null). */
export function getMacrosPanel(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-testid="log-type-totals-strip-macros"]');
}

/** Resolve the day-over-day comparison line (or null). */
export function getComparisonLine(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-testid="log-type-totals-strip-comparison"]');
}

/** Resolve the kcal delta span (or null). */
export function getComparisonKcal(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-testid="log-type-totals-strip-comparison-kcal"]');
}

/** Resolve the protein delta span (or null). */
export function getComparisonProtein(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-testid="log-type-totals-strip-comparison-protein"]');
}

/** Resolve the unavailable span (or null). */
export function getComparisonUnavailable(container: HTMLElement): HTMLElement | null {
  return container.querySelector(
    '[data-testid="log-type-totals-strip-comparison-unavailable"]',
  );
}

/**
 * Resolve the stale-data indicator line (relay-231). Returns null in the
 * empty state (relay-225 owns the message) or when the strip is rendered
 * with a null `data` payload. The indicator carries its own
 * data-testid so tests can pin the exact text and the kind modifier
 * class (fresh / stale / offline).
 */
export function getStaleIndicator(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-testid="log-type-totals-strip-stale"]');
}
