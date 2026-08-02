import { describe, expect, it } from 'vitest';
import {
  formatGrams,
  formatKcal,
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
