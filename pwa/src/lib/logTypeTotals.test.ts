import { describe, expect, it } from 'vitest';
import {
  buildDayOverDayComparison,
  DAY_OVER_DAY_UNAVAILABLE_TEXT,
  formatGrams,
  formatKcal,
  formatKcalDelta,
  formatProteinDelta,
  kcalProgressPct,
  kcalRemaining,
} from './logTypeTotals';
import { proteinProgressPct } from './foodSectionShared';

describe('logTypeTotals — kcal helpers', () => {
  describe('kcalProgressPct', () => {
    it('returns 0 when target is null', () => {
      expect(kcalProgressPct(500, null)).toBe(0);
    });

    it('returns 0 when target is undefined', () => {
      expect(kcalProgressPct(500, undefined)).toBe(0);
    });

    it('returns 0 when target is zero', () => {
      expect(kcalProgressPct(500, 0)).toBe(0);
    });

    it('returns 0 when target is negative', () => {
      expect(kcalProgressPct(500, -100)).toBe(0);
    });

    it('returns the consumption fraction as a percent', () => {
      expect(kcalProgressPct(500, 2000)).toBe(25);
    });

    it('returns 100 when consumption meets the target', () => {
      expect(kcalProgressPct(2000, 2000)).toBe(100);
    });

    it('clamps at 100 when consumption exceeds target', () => {
      expect(kcalProgressPct(2500, 2000)).toBe(100);
    });

    it('returns 0 when consumption is zero', () => {
      expect(kcalProgressPct(0, 2000)).toBe(0);
    });
  });

  describe('kcalRemaining', () => {
    it('returns null when target is null', () => {
      expect(kcalRemaining(500, null)).toBeNull();
    });

    it('returns null when target is undefined', () => {
      expect(kcalRemaining(500, undefined)).toBeNull();
    });

    it('returns null when target is zero', () => {
      expect(kcalRemaining(500, 0)).toBeNull();
    });

    it('returns null when target is negative', () => {
      expect(kcalRemaining(500, -50)).toBeNull();
    });

    it('returns positive delta when under target', () => {
      expect(kcalRemaining(500, 2000)).toBe(1500);
    });

    it('returns zero when consumption equals target', () => {
      expect(kcalRemaining(2000, 2000)).toBe(0);
    });

    it('returns zero (clamped) when consumption exceeds target', () => {
      expect(kcalRemaining(2500, 2000)).toBe(0);
    });
  });

  describe('formatKcal', () => {
    it('rounds to a whole number', () => {
      expect(formatKcal(1234.6)).toBe('1235');
      expect(formatKcal(1234.4)).toBe('1234');
    });

    it('formats zero', () => {
      expect(formatKcal(0)).toBe('0');
    });
  });

  describe('formatGrams', () => {
    it('formats one decimal place', () => {
      expect(formatGrams(12.345)).toBe('12.3');
      expect(formatGrams(12.55)).toBe('12.6');
    });

    it('formats zero', () => {
      expect(formatGrams(0)).toBe('0.0');
    });
  });
});

describe('foodSectionShared — proteinProgressPct', () => {
  it('returns 0 when target is null', () => {
    expect(proteinProgressPct(45, null)).toBe(0);
  });

  it('returns 0 when target is undefined', () => {
    expect(proteinProgressPct(45, undefined)).toBe(0);
  });

  it('returns 0 when target is zero', () => {
    expect(proteinProgressPct(45, 0)).toBe(0);
  });

  it('returns 0 when target is negative', () => {
    expect(proteinProgressPct(45, -10)).toBe(0);
  });

  it('returns the protein fraction as a percent', () => {
    expect(proteinProgressPct(45, 120)).toBe(37.5);
  });

  it('returns 100 when protein meets target', () => {
    expect(proteinProgressPct(120, 120)).toBe(100);
  });

  it('clamps at 100 when protein exceeds target', () => {
    expect(proteinProgressPct(150, 120)).toBe(100);
  });
});

// relay-228: day-over-day comparison helpers. The math is pure and
// exhaustive — both happy paths (positive / negative deltas) and the
// unavailable state (one or both yesterday values missing).
describe('logTypeTotals — day-over-day comparison (relay-228)', () => {
  describe('formatKcalDelta', () => {
    it('renders a positive delta with a leading + and kcal vs yesterday suffix', () => {
      expect(formatKcalDelta(250)).toBe('+250 kcal vs yesterday');
    });

    it('renders a negative delta with a leading - (no minus-vs-plus confusion)', () => {
      expect(formatKcalDelta(-180)).toBe('-180 kcal vs yesterday');
    });

    it('renders zero as "Same as yesterday" (avoid noisy "+0 / -0")', () => {
      expect(formatKcalDelta(0)).toBe('Same as yesterday');
    });

    it('rounds fractional deltas to whole kcal', () => {
      expect(formatKcalDelta(123.6)).toBe('+124 kcal vs yesterday');
      expect(formatKcalDelta(123.4)).toBe('+123 kcal vs yesterday');
    });
  });

  describe('formatProteinDelta', () => {
    it('renders a positive delta with one decimal place and a gram suffix', () => {
      expect(formatProteinDelta(12.5)).toBe('+12.5g protein vs yesterday');
    });

    it('renders a negative delta with one decimal place', () => {
      expect(formatProteinDelta(-8.4)).toBe('-8.4g protein vs yesterday');
    });

    it('renders zero as "Same as yesterday"', () => {
      expect(formatProteinDelta(0)).toBe('Same as yesterday');
    });
  });

  describe('buildDayOverDayComparison', () => {
    it('reports hasYesterday=false when both yesterday values are null', () => {
      const result = buildDayOverDayComparison(750, 45, null, null);
      expect(result.hasYesterday).toBe(false);
      expect(result.kcalDeltaText).toBeNull();
      expect(result.proteinDeltaText).toBeNull();
      expect(result.unavailableText).toBe(DAY_OVER_DAY_UNAVAILABLE_TEXT);
    });

    it('reports hasYesterday=false when only kcal is provided (defensive: pair is required)', () => {
      // Passing a half-pair should never happen in production but the
      // helper must not fabricate a one-sided delta. Treat as unavailable.
      const result = buildDayOverDayComparison(750, 45, 500, null);
      expect(result.hasYesterday).toBe(false);
      expect(result.kcalDelta).toBeNull();
      expect(result.proteinDelta).toBeNull();
    });

    it('computes a positive kcal delta and a negative protein delta', () => {
      const result = buildDayOverDayComparison(900, 40, 600, 50);
      expect(result.hasYesterday).toBe(true);
      expect(result.yesterdayKcal).toBe(600);
      expect(result.yesterdayProtein).toBe(50);
      expect(result.kcalDelta).toBe(300);
      expect(result.proteinDelta).toBe(-10);
      expect(result.kcalDeltaText).toBe('+300 kcal vs yesterday');
      expect(result.proteinDeltaText).toBe('-10.0g protein vs yesterday');
    });

    it('computes a zero delta as "Same as yesterday" on both lines', () => {
      const result = buildDayOverDayComparison(700, 30, 700, 30);
      expect(result.kcalDelta).toBe(0);
      expect(result.proteinDelta).toBe(0);
      expect(result.kcalDeltaText).toBe('Same as yesterday');
      expect(result.proteinDeltaText).toBe('Same as yesterday');
    });

    it('rounds fractional kcal deltas to integers', () => {
      // 900.7 - 600 = 300.7 → 301
      const result = buildDayOverDayComparison(900.7, 45, 600, 30);
      expect(result.kcalDelta).toBe(301);
      expect(result.kcalDeltaText).toBe('+301 kcal vs yesterday');
    });

    it('rounds protein deltas to one decimal place', () => {
      // Stable boundary that doesn't depend on IEEE 754 representation:
      // 45.1 - 30 = 15.1 → 15.1 (rounds to one decimal, sign-symmetric).
      const result = buildDayOverDayComparison(900, 45.1, 600, 30);
      expect(result.proteinDelta).toBe(15.1);
      expect(result.proteinDeltaText).toBe('+15.1g protein vs yesterday');
    });

    it('Bugbot Round 85 #3: rounds half-units away from zero on the negative side', () => {
      // Math.round(-0.5) === 0 (not -1) in JS, which previously caused
      // -0.5 kcal to render as "Same as yesterday" while +0.5 rendered
      // as "+1 kcal vs yesterday". Sign-symmetric rounding must round
      // -0.5 → -1 kcal (away from zero) and +0.5 → +1 kcal, so the two
      // edges produce the same magnitude in opposite directions.
      // We pin the integer-kcal half case directly (no IEEE 754 drama):
      // today=799, yesterday=800 → delta=-1.
      expect(buildDayOverDayComparison(799, 50, 800, 50)).toMatchObject({
        kcalDelta: -1,
        kcalDeltaText: '-1 kcal vs yesterday',
      });
      expect(buildDayOverDayComparison(801, 50, 800, 50)).toMatchObject({
        kcalDelta: 1,
        kcalDeltaText: '+1 kcal vs yesterday',
      });
      // Protein side: integer-gram boundaries stay exact.
      expect(buildDayOverDayComparison(800, 49, 800, 50)).toMatchObject({
        proteinDelta: -1,
        proteinDeltaText: '-1.0g protein vs yesterday',
      });
    });

    it('reports unavailableText in both branches (so the component has one source of truth)', () => {
      const available = buildDayOverDayComparison(800, 40, 600, 30);
      const unavailable = buildDayOverDayComparison(800, 40, null, null);
      expect(available.unavailableText).toBe(DAY_OVER_DAY_UNAVAILABLE_TEXT);
      expect(unavailable.unavailableText).toBe(DAY_OVER_DAY_UNAVAILABLE_TEXT);
    });
  });
});
