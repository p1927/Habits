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
    });
  });

  it('centralizes null-data defaults without exposing macro controls', () => {
    expect(buildLogTypeTotalsViewModel(null, null)).toMatchObject({
      consumed: 0,
      protein: 0,
      hasCalorieTarget: false,
      goalReached: false,
      hasMacros: false,
      announceText: '0 kilocalories. 0.0 grams protein',
      footerText: '—',
      pendingBadgeText: null,
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
});
