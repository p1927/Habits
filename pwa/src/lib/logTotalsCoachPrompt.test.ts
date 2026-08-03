import { describe, expect, it } from 'vitest';
import { buildLogTotalsCoachPrompt } from './logTotalsCoachPrompt';
import { buildLogTypeTotalsViewModel } from './logTypeTotalsViewModel';
import { baseData, dayWithMeal, emptyDay } from '../components/LogTypeTodayTotalsStrip.test.helpers';
import type { FoodTodayResponse } from './api';

// buildViewModel — thin wrapper that runs the real viewmodel builder so
// the prompt tests stay focused on prompt-builder behavior (not on
// re-implementing the totals math). Pass-through of all the inputs we
// care about keeps the tests readable.
function buildViewModel(
  data: FoodTodayResponse | null,
  options: {
    calorieTarget?: number | null;
    proteinTarget?: number | null;
    yesterdayKcal?: number | null;
    yesterdayProtein?: number | null;
    pendingCount?: number;
  } = {},
) {
  const dataWithTargets: FoodTodayResponse | null = data
    ? {
        ...data,
        protein_target_g:
          options.proteinTarget !== undefined ? options.proteinTarget : data.protein_target_g,
      }
    : null;
  return buildLogTypeTotalsViewModel(
    dataWithTargets,
    options.calorieTarget ?? 2000,
    options.pendingCount ?? 0,
    options.yesterdayKcal ?? null,
    options.yesterdayProtein ?? null,
  );
}

describe('buildLogTotalsCoachPrompt — empty state', () => {
  it('returns the empty-state prompt without a "Today so far" summary', () => {
    const vm = buildViewModel(emptyDay());
    const prompt = buildLogTotalsCoachPrompt(vm);
    expect(prompt).toBe('I have not logged any meals yet today. Help me plan what to eat.');
    expect(prompt).not.toContain('Today so far');
  });

  it('returns the empty-state prompt when data is null', () => {
    const vm = buildViewModel(null);
    const prompt = buildLogTotalsCoachPrompt(vm);
    expect(prompt).toBe('I have not logged any meals yet today. Help me plan what to eat.');
  });
});

describe('buildLogTotalsCoachPrompt — goal-reached state', () => {
  it('includes the goal-reached framing and kcal of/target numbers', () => {
    // baseData has 750 kcal against a 2000 target — under goal.
    // Force goal-reached by setting consumed >= target via a fixture.
    const data: FoodTodayResponse = { ...baseData, calories: 2100 };
    const vm = buildViewModel(data);
    expect(vm.state).toBe('goal-reached');
    const prompt = buildLogTotalsCoachPrompt(vm);
    expect(prompt).toContain('I hit my calorie goal today.');
    expect(prompt).toContain('Suggest a light dinner');
    expect(prompt).toContain('2100 kcal of 2000 kcal');
    expect(prompt).toContain('45 g of 120 g protein');
  });
});

describe('buildLogTotalsCoachPrompt — target-unset state', () => {
  it('omits the kcal "of N kcal" denominator and uses the target-unset framing', () => {
    const vm = buildViewModel(baseData, { calorieTarget: 0 });
    expect(vm.state).toBe('target-unset');
    const prompt = buildLogTotalsCoachPrompt(vm);
    expect(prompt).toContain('no calorie target configured');
    expect(prompt).not.toMatch(/\d+\s*kcal\s*of\s*\d+\s*kcal/);
    expect(prompt).toContain('750 kcal');
    expect(prompt).toContain('45 g of 120 g protein');
  });

  it('omits the protein denominator when protein target is missing', () => {
    const data: FoodTodayResponse = { ...baseData, protein_target_g: null };
    const vm = buildViewModel(data);
    const prompt = buildLogTotalsCoachPrompt(vm);
    expect(prompt).toContain('45 g protein');
    expect(prompt).not.toMatch(/protein\s*\/\s*\d/);
  });
});

describe('buildLogTotalsCoachPrompt — tracking state', () => {
  it('includes kcal/protein/with-target numbers and the tracking framing', () => {
    const vm = buildViewModel(dayWithMeal(750));
    expect(vm.state).toBe('tracking');
    const prompt = buildLogTotalsCoachPrompt(vm);
    expect(prompt).toContain('Recommend how to balance the rest of my day');
    expect(prompt).toContain('750 kcal of 2000 kcal');
    expect(prompt).toContain('30 g of 120 g protein');
  });

  it('includes the macros line when carbs and fat are non-null', () => {
    const vm = buildViewModel(dayWithMeal(750));
    const prompt = buildLogTotalsCoachPrompt(vm);
    expect(prompt).toMatch(/Macros: \d+ g carbs, \d+ g fat\./);
  });

  it('omits the macros line when carbs or fat is null', () => {
    const data: FoodTodayResponse = { ...baseData, carbs: null, fat: null };
    const vm = buildViewModel(data);
    const prompt = buildLogTotalsCoachPrompt(vm);
    expect(prompt).not.toContain('Macros:');
  });
});

describe('buildLogTotalsCoachPrompt — day-over-day comparison', () => {
  it('includes the comparison line when yesterday totals are known', () => {
    const vm = buildViewModel(dayWithMeal(750), {
      yesterdayKcal: 500,
      yesterdayProtein: 30,
    });
    const prompt = buildLogTotalsCoachPrompt(vm);
    expect(prompt).toContain('Yesterday vs today:');
  });

  it('omits the comparison line when yesterday totals are missing', () => {
    const vm = buildViewModel(dayWithMeal(750));
    const prompt = buildLogTotalsCoachPrompt(vm);
    expect(prompt).not.toContain('Yesterday vs today');
  });
});

describe('buildLogTotalsCoachPrompt — output is plain text', () => {
  it('returns a single-paragraph string with no newlines', () => {
    const vm = buildViewModel(dayWithMeal(750));
    const prompt = buildLogTotalsCoachPrompt(vm);
    expect(prompt).not.toContain('\n');
    // Plain text, no markdown bullets
    expect(prompt).not.toMatch(/^[-*]\s/m);
  });
});
