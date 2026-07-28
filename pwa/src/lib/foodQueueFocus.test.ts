import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OptimisticFoodEntry } from '../hooks/useOptimisticFoodLog';
import {
  focusFirstQueuedFoodRow,
  foodQueuePendingAriaLabel,
  foodQueuePendingItemId,
} from './foodQueueFocus';

describe('foodQueueFocus helpers', () => {
  it('foodQueuePendingItemId prefixes entry id', () => {
    expect(foodQueuePendingItemId('abc')).toBe('food-queue-pending-abc');
  });

  it('foodQueuePendingAriaLabel formats pending label', () => {
    expect(foodQueuePendingAriaLabel('Oats')).toBe('Pending: Oats');
  });

  describe('focusFirstQueuedFoodRow', () => {
    const queued: OptimisticFoodEntry = {
      id: 'q1',
      food: 'Banana',
      quantity_g: 100,
      status: 'queued',
    };

    beforeEach(() => {
      document.body.innerHTML = '<li id="food-queue-pending-q1" tabindex="-1"></li>';
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('returns false when no queued entries', () => {
      expect(focusFirstQueuedFoodRow([], false)).toBe(false);
    });

    it('returns false when row element missing', () => {
      document.body.innerHTML = '';
      expect(focusFirstQueuedFoodRow([queued], false)).toBe(false);
    });

    it('scrolls and focuses first queued row', () => {
      const row = document.getElementById('food-queue-pending-q1')!;
      const scrollIntoView = vi.fn();
      const focus = vi.fn();
      row.scrollIntoView = scrollIntoView;
      row.focus = focus;

      expect(focusFirstQueuedFoodRow([queued], false)).toBe(true);
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' });
      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    });

    it('uses auto scroll when reduced motion', () => {
      const row = document.getElementById('food-queue-pending-q1')!;
      row.scrollIntoView = vi.fn();
      row.focus = vi.fn();

      focusFirstQueuedFoodRow([queued], true);
      expect(row.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'auto' });
    });
  });
});
