import { describe, expect, it } from 'vitest';
import type { FoodTodayResponse } from './api';
import { buildLogTypeTotalsViewModel } from './logTypeTotalsViewModel';

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
    expect(buildLogTypeTotalsViewModel(data, 2000)).toEqual({
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
});
