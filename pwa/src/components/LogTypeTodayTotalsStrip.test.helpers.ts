import { vi } from 'vitest';

import { api } from '../lib/api';
import type { FoodTodayResponse } from '../lib/api';

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
  vi.mocked(api.getFoodTargets).mockReset();
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

/** Resolve the "Show/Hide macros" expand button (or null). */
export function getExpandButton(container: HTMLElement): HTMLButtonElement | null {
  return container.querySelector('.log-type-totals-strip__expand') as HTMLButtonElement | null;
}

/** Resolve the pending-sync badge node (or null). */
export function getPendingBadge(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-testid="log-type-totals-strip-pending-badge"]');
}

/** Resolve the macros panel (or null). */
export function getMacrosPanel(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-testid="log-type-totals-strip-macros"]');
}
