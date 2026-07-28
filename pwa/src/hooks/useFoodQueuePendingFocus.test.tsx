import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OptimisticFoodEntry } from './useOptimisticFoodLog';
import { useFoodQueuePendingFocus } from './useFoodQueuePendingFocus';

vi.mock('./usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => false,
}));

const focusSpy = vi.fn(() => true);
vi.mock('../lib/foodQueueFocus', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/foodQueueFocus')>();
  return {
    ...actual,
    focusFirstQueuedFoodRow: (...args: Parameters<typeof actual.focusFirstQueuedFoodRow>) =>
      focusSpy(...args),
  };
});

describe('useFoodQueuePendingFocus', () => {
  const queued: OptimisticFoodEntry = {
    id: 'q1',
    food: 'Banana',
    quantity_g: 100,
    status: 'queued',
  };

  beforeEach(() => {
    focusSpy.mockClear();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not focus when scroll token is absent', () => {
    renderHook(() => useFoodQueuePendingFocus([queued], undefined));
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('focuses when scroll token is set', () => {
    renderHook(({ token }) => useFoodQueuePendingFocus([queued], token), {
      initialProps: { token: 1 },
    });
    expect(focusSpy).toHaveBeenCalledTimes(1);
  });

  it('does not re-focus when token unchanged but pending updates', () => {
    const { rerender } = renderHook(
      ({ pending, token }) => useFoodQueuePendingFocus(pending, token),
      { initialProps: { pending: [queued], token: 1 } },
    );
    expect(focusSpy).toHaveBeenCalledTimes(1);

    rerender({ pending: [{ ...queued, food: 'Apple' }], token: 1 });
    expect(focusSpy).toHaveBeenCalledTimes(1);
  });

  it('focuses again when token increments', () => {
    const { rerender } = renderHook(
      ({ token }) => useFoodQueuePendingFocus([queued], token),
      { initialProps: { token: 1 } },
    );
    expect(focusSpy).toHaveBeenCalledTimes(1);

    rerender({ token: 2 });
    expect(focusSpy).toHaveBeenCalledTimes(2);
  });
});
