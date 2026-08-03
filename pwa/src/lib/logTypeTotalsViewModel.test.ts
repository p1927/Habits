import { describe, expect, it } from 'vitest';
import type { FoodTodayResponse } from './api';
import {
  buildLogTypeTotalsViewModel,
  classifyTotalsState,
  type TotalsState,
} from './logTypeTotalsViewModel';

const data: FoodTodayResponse = {
  protein_g: 45,
  protein_target_g: 120,
  calories: 750,
  carbs: 80,
  fat: 25,
  items: [],
  sheets_connected: true,
};

describe('buildLogTypeTotalsViewModel', () => {
  it('centralizes under-target display, announcement, and macro state', () => {
    // ch-patchwork-log-totals: state classifier added to the view model. Use
    // toMatchObject (not toEqual) so the test doesn't have to enumerate every
    // future field — the per-state classifier describe block pins state
    // explicitly below.
    expect(buildLogTypeTotalsViewModel(data, 2000)).toMatchObject({
      consumed: 750,
      protein: 45,
      proteinTarget: 120,
      calorieText: '750 kcal / 2000',
      proteinText: '45.0g / 120.0g',
      kcalPct: 37.5,
      proteinPct: 37.5,
      hasCalorieTarget: true,
      goalReached: false,
      hasMacros: true,
      carbs: 80,
      fat: 25,
      announceText:
        '750 of 2000 kilocalories. 45.0 of 120.0 grams protein. 1250 kilocalories remaining',
      footerText: '1250 kcal remaining',
      pendingBadgeText: null,
      hasNoMealsLogged: false,
      setupHint: null,
      state: 'tracking',
    });
  });

  it('centralizes null-data defaults without exposing macro controls', () => {
    expect(buildLogTypeTotalsViewModel(null, null)).toMatchObject({
      consumed: 0,
      protein: 0,
      hasCalorieTarget: false,
      goalReached: false,
      hasMacros: false,
      announceText: '0 kilocalories. 0.0 grams protein. No meals logged yet',
      footerText: 'No meals logged yet',
      pendingBadgeText: null,
      hasNoMealsLogged: true,
      setupHint: null,
    });
  });

  it('centralizes the over-target goal state', () => {
    expect(buildLogTypeTotalsViewModel({ ...data, calories: 2500 }, 2000)).toMatchObject({
      kcalPct: 100,
      goalReached: true,
      announceText:
        '2500 of 2000 kilocalories. 45.0 of 120.0 grams protein. Goal reached',
      footerText: 'Goal reached',
      pendingBadgeText: null,
      hasNoMealsLogged: false,
      setupHint: null,
    });
  });

  it('emits a pending sync badge text when pendingCount is positive', () => {
    expect(buildLogTypeTotalsViewModel(data, 2000, 3)).toMatchObject({
      pendingBadgeText: '3 meals pending sync',
      announceText:
        '750 of 2000 kilocalories. 45.0 of 120.0 grams protein. 1250 kilocalories remaining. 3 meals pending sync',
    });
  });

  it('uses singular noun when a single pending entry is queued', () => {
    expect(buildLogTypeTotalsViewModel(data, 2000, 1)).toMatchObject({
      pendingBadgeText: '1 meal pending sync',
      announceText:
        '750 of 2000 kilocalories. 45.0 of 120.0 grams protein. 1250 kilocalories remaining. 1 meal pending sync',
    });
  });

  it('keeps pendingBadgeText null when pendingCount is zero', () => {
    expect(buildLogTypeTotalsViewModel(data, 2000, 0)).toMatchObject({
      pendingBadgeText: null,
    });
  });

  // relay-225: empty-state fallback — calories=0 AND items.length=0
  // (or null data). The footer says "No meals logged yet" instead of "0 kcal
  // today"/"—", progress is dropped from the announce path, and macros are
  // not surfaced even if the backend coincidentally returns them.
  it('enters the empty state when items array is empty and calories are zero', () => {
    const emptyDay: FoodTodayResponse = {
      ...data,
      calories: 0,
      protein_g: 0,
      carbs: 80,
      fat: 25,
      items: [],
    };
    expect(buildLogTypeTotalsViewModel(emptyDay, 2000)).toMatchObject({
      consumed: 0,
      protein: 0,
      hasCalorieTarget: true,
      goalReached: false,
      hasMacros: false, // overridden in empty state
      announceText:
        '0 of 2000 kilocalories. 0.0 of 120.0 grams protein. No meals logged yet',
      footerText: 'No meals logged yet',
      pendingBadgeText: null,
      hasNoMealsLogged: true,
    });
  });

  it('leaves the empty state once a single meal item is logged', () => {
    const withMeal: FoodTodayResponse = {
      ...data,
      calories: 120,
      protein_g: 5,
      items: [
        { row: 1, food: 'apple', quantity_g: 100, calories: 120, carbs: 25, protein: 5, fat: 1 },
      ],
    };
    expect(buildLogTypeTotalsViewModel(withMeal, 2000)).toMatchObject({
      hasNoMealsLogged: false,
      hasMacros: true,
      footerText: '1880 kcal remaining',
      announceText:
        '120 of 2000 kilocalories. 5.0 of 120.0 grams protein. 1880 kilocalories remaining',
    });
  });

  // relay-226: when meals have been logged but no calorie target is
  // configured, the view model exposes hasNoCalorieTarget=true and a
  // setupHint the component renders below the footer. Footer stays on
  // "X kcal today" (no "remaining" claim). Empty-state path keeps setupHint
  // null because relay-225's "No meals logged yet" is the right message
  // when there is nothing to plot.
  it('emits a setup hint when meals are logged but no calorie target is set', () => {
    expect(
      buildLogTypeTotalsViewModel(
        { ...data, calories: 0, protein_g: 0, items: [] },
        null,
      ),
    ).toMatchObject({
      hasNoMealsLogged: true,
      hasCalorieTarget: false,
      setupHint: null, // empty state owns the message
    });

    const withMealNoTarget = {
      ...data,
      calories: 750,
      protein_g: 45,
      items: [
        { row: 1, food: 'oatmeal', quantity_g: 80, calories: 380, carbs: 60, protein: 12, fat: 6 },
        { row: 2, food: 'berries', quantity_g: 100, calories: 60, carbs: 14, protein: 1, fat: 0 },
        { row: 3, food: 'yogurt', quantity_g: 200, calories: 310, carbs: 6, protein: 32, fat: 19 },
      ],
    } as FoodTodayResponse;
    expect(buildLogTypeTotalsViewModel(withMealNoTarget, null)).toMatchObject({
      hasNoMealsLogged: false,
      hasCalorieTarget: false,
      goalReached: false,
      setupHint: 'Set a daily calorie target in Settings to track progress.',
      footerText: '750 kcal today',
      announceText: '750 kilocalories. 45.0 of 120.0 grams protein',
    });
  });

  it('suppresses the setup hint when a target is set (no nagging once tracking is on)', () => {
    expect(buildLogTypeTotalsViewModel(data, 2000)).toMatchObject({
      hasCalorieTarget: true,
      setupHint: null,
    });
  });

  it('treats calorieTarget=0 as no target for setup-hint purposes', () => {
    const withMeal = {
      ...data,
      items: [
        { row: 1, food: 'apple', quantity_g: 100, calories: 120, carbs: 25, protein: 5, fat: 1 },
      ],
    } as FoodTodayResponse;
    expect(buildLogTypeTotalsViewModel(withMeal, 0)).toMatchObject({
      hasCalorieTarget: false,
      setupHint: 'Set a daily calorie target in Settings to track progress.',
      footerText: '750 kcal today',
    });
  });
});

// ch-patchwork-log-totals: classifyTotalsState() collapses the four relay-N
// display states into one discriminated value. Tests pin the priority order
// (empty > goal-reached > target-unset > tracking) and the inputs each state
// expects. The state field on the view model is also asserted for the same
// cases so a future contributor who accidentally re-derives the state inside
// buildLogTypeTotalsViewModel gets caught here.
describe('classifyTotalsState', () => {
  const meal: FoodTodayResponse = {
    protein_g: 45,
    protein_target_g: 120,
    calories: 750,
    carbs: 80,
    fat: 25,
    items: [
      { row: 1, food: 'oatmeal', quantity_g: 80, calories: 380, carbs: 60, protein: 12, fat: 6 },
    ],
    sheets_connected: true,
  };

  const cases: Array<{
    label: string;
    data: FoodTodayResponse | null;
    calorieTarget: number | null;
    hasGoalReached: boolean;
    expected: TotalsState;
  }> = [
    { label: 'empty (null data)', data: null, calorieTarget: 2000, hasGoalReached: false, expected: 'empty' },
    { label: 'empty (zero calories + no items)', data: { ...meal, calories: 0, protein_g: 0, items: [] }, calorieTarget: 2000, hasGoalReached: false, expected: 'empty' },
    { label: 'goal-reached (over target)', data: { ...meal, calories: 2500 }, calorieTarget: 2000, hasGoalReached: true, expected: 'goal-reached' },
    { label: 'target-unset (no target, meals logged)', data: meal, calorieTarget: null, hasGoalReached: false, expected: 'target-unset' },
    { label: 'target-unset (target=0, meals logged)', data: meal, calorieTarget: 0, hasGoalReached: false, expected: 'target-unset' },
    { label: 'tracking (target set, under 100%)', data: meal, calorieTarget: 2000, hasGoalReached: false, expected: 'tracking' },
    // priority: empty beats goal-reached. hasGoalReached is true but
    // there are no meals to claim progress against.
    { label: 'priority: empty beats goal-reached', data: null, calorieTarget: 2000, hasGoalReached: true, expected: 'empty' },
  ];

  it.each(cases)('$label → $expected', ({ data, calorieTarget, hasGoalReached, expected }) => {
    expect(classifyTotalsState(data, calorieTarget, hasGoalReached)).toBe(expected);
  });
});

describe('buildLogTypeTotalsViewModel exposes state classifier', () => {
  it('reports "tracking" when meals logged and target set under 100%', () => {
    expect(buildLogTypeTotalsViewModel(data, 2000).state).toBe('tracking');
  });

  it('reports "empty" for null data', () => {
    expect(buildLogTypeTotalsViewModel(null, null).state).toBe('empty');
  });

  it('reports "goal-reached" when calories exceed target', () => {
    expect(buildLogTypeTotalsViewModel({ ...data, calories: 2500 }, 2000).state).toBe('goal-reached');
  });

  it('reports "target-unset" when meals logged but no target configured', () => {
    const withMeal = {
      ...data,
      items: [
        { row: 1, food: 'oatmeal', quantity_g: 80, calories: 380, carbs: 60, protein: 12, fat: 6 },
      ],
    } as FoodTodayResponse;
    expect(buildLogTypeTotalsViewModel(withMeal, null).state).toBe('target-unset');
  });
});

// relay-228: day-over-day comparison wired into the viewmodel. The
// viewmodel always populates `comparison`; the component decides whether
// to render it (suppressed in the empty state). The math is identical to
// the helpers, so this block focuses on the integration: announce path
// includes deltas when present, does not pollute announce when yesterday
// is missing.
describe('buildLogTypeTotalsViewModel — day-over-day comparison (relay-228)', () => {
  it('populates comparison.hasYesterday=false by default (no args)', () => {
    const vm = buildLogTypeTotalsViewModel(data, 2000);
    expect(vm.comparison.hasYesterday).toBe(false);
    expect(vm.comparison.kcalDeltaText).toBeNull();
    expect(vm.comparison.proteinDeltaText).toBeNull();
    expect(vm.comparison.unavailableText).toBe('Yesterday totals unavailable');
  });

  it('emits kcal + protein deltas when yesterday values are provided', () => {
    const vm = buildLogTypeTotalsViewModel(data, 2000, 0, 600, 50);
    // today = 750 kcal / 45g protein ; yesterday = 600 kcal / 50g protein
    expect(vm.comparison.hasYesterday).toBe(true);
    expect(vm.comparison.kcalDelta).toBe(150);
    expect(vm.comparison.proteinDelta).toBe(-5);
    expect(vm.comparison.kcalDeltaText).toBe('+150 kcal vs yesterday');
    expect(vm.comparison.proteinDeltaText).toBe('-5.0g protein vs yesterday');
  });

  it('keeps the announce path quiet when yesterday is missing', () => {
    const vm = buildLogTypeTotalsViewModel(data, 2000);
    expect(vm.announceText).not.toContain('vs yesterday');
    expect(vm.announceText).not.toContain('unavailable');
  });

  it('appends deltas to the announce path when yesterday is known', () => {
    const vm = buildLogTypeTotalsViewModel(data, 2000, 0, 500, 30);
    expect(vm.announceText).toContain('+250 kcal vs yesterday');
    expect(vm.announceText).toContain('+15.0g protein vs yesterday');
  });

  it('does not invent deltas when both yesterday values are null', () => {
    const vm = buildLogTypeTotalsViewModel(data, 2000, 0, null, null);
    expect(vm.comparison.hasYesterday).toBe(false);
    expect(vm.announceText).not.toContain('vs yesterday');
  });

  it('still surfaces comparison when goal-reached (delta is meaningful vs goal-reached frame)', () => {
    // goal-reached is the right primary message; the delta adds context
    // for users who want to know how much they went over vs yesterday.
    const vm = buildLogTypeTotalsViewModel(
      { ...data, calories: 2500 },
      2000,
      0,
      1800,
      40,
    );
    expect(vm.state).toBe('goal-reached');
    expect(vm.comparison.hasYesterday).toBe(true);
    expect(vm.comparison.kcalDelta).toBe(700);
  });

  it('comparison data is independent of empty state (component decides to hide)', () => {
    // The empty state should NOT fabricate a delta from yesterday's zero
    // kcal: today=0, yesterday=0 → delta=0 → "Same as yesterday". The
    // helper still produces that (hasYesterday=true); the component
    // suppresses the line because hasNoMealsLogged=true. The viewmodel
    // leaves the data exposed so tests can pin this contract.
    const emptyToday: FoodTodayResponse = {
      ...data,
      calories: 0,
      protein_g: 0,
      items: [],
    };
    const vm = buildLogTypeTotalsViewModel(emptyToday, 2000, 0, 0, 0);
    expect(vm.state).toBe('empty');
    expect(vm.hasNoMealsLogged).toBe(true);
    expect(vm.comparison.hasYesterday).toBe(true);
    expect(vm.comparison.kcalDelta).toBe(0);
    expect(vm.comparison.kcalDeltaText).toBe('Same as yesterday');
  });
});

describe('buildLogTypeTotalsViewModel — relay-231 stale-indicator field', () => {
  const dataWithMeal: FoodTodayResponse = {
    protein_g: 45,
    protein_target_g: 120,
    calories: 750,
    carbs: 80,
    fat: 25,
    items: [
      { row: 1, food: 'apple', quantity_g: 100, calories: 750, carbs: 80, protein: 45, fat: 25 },
    ],
    sheets_connected: true,
  };

  it('exposes a fresh indicator immediately after data arrives', () => {
    expect(buildLogTypeTotalsViewModel(dataWithMeal, 2000, 0, null, null, 0, true).staleIndicator).toEqual({
      kind: 'fresh',
      text: 'Just updated',
    });
  });

  it('exposes a stale indicator after the freshness window elapses', () => {
    expect(buildLogTypeTotalsViewModel(dataWithMeal, 2000, 0, null, null, 90_000, true).staleIndicator).toEqual({
      kind: 'stale',
      text: 'Updated 1m ago',
    });
  });

  it('exposes an offline indicator when the server is unreachable but data is still on screen', () => {
    expect(buildLogTypeTotalsViewModel(dataWithMeal, 2000, 0, null, null, 0, false).staleIndicator).toEqual({
      kind: 'offline',
      text: 'Showing offline totals',
    });
  });

  it('suppresses the indicator in the empty state (relay-225 owns the message)', () => {
    const emptyData: FoodTodayResponse = {
      ...dataWithMeal,
      calories: 0,
      protein_g: 0,
      items: [],
    };
    // Even when the freshness window would normally show "Just updated",
    // the empty state must not add a stale line — relay-225's
    // "No meals logged yet" is the only message the user should see.
    expect(buildLogTypeTotalsViewModel(emptyData, 2000, 0, null, null, 0, true).staleIndicator).toBeNull();
  });
});
