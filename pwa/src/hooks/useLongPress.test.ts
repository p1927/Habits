import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLongPress } from './useLongPress';

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('fires onLongPress after the threshold elapses', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress }, { threshold: 600 }),
    );
    const target = document.createElement('div');
    const evt = {
      pointerType: 'touch',
      button: 0,
      clientX: 0,
      clientY: 0,
      currentTarget: target,
      nativeEvent: new Event('pointerdown'),
    } as unknown as Parameters<typeof result.current.onPointerDown>[0];
    act(() => {
      result.current.onPointerDown(evt);
    });
    expect(onLongPress).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(599);
    });
    expect(onLongPress).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('cancels the gesture when pointer moves beyond the threshold', () => {
    const onLongPress = vi.fn();
    const onCancel = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, onCancel }, { threshold: 600, movementThreshold: 10 }),
    );
    const target = document.createElement('div');
    const down = {
      pointerType: 'touch',
      button: 0,
      clientX: 0,
      clientY: 0,
      currentTarget: target,
      nativeEvent: new Event('pointerdown'),
    } as unknown as Parameters<typeof result.current.onPointerDown>[0];
    act(() => {
      result.current.onPointerDown(down);
    });
    const move = {
      pointerType: 'touch',
      button: 0,
      clientX: 30,
      clientY: 0,
      currentTarget: target,
    } as unknown as Parameters<typeof result.current.onPointerMove>[0];
    act(() => {
      result.current.onPointerMove(move);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onLongPress).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  it('cancels on pointerup', () => {
    const onLongPress = vi.fn();
    const onCancel = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, onCancel }, { threshold: 600 }),
    );
    const target = document.createElement('div');
    const evt = {
      pointerType: 'mouse',
      button: 0,
      clientX: 0,
      clientY: 0,
      currentTarget: target,
      nativeEvent: new Event('pointerdown'),
    } as unknown as Parameters<typeof result.current.onPointerDown>[0];
    act(() => {
      result.current.onPointerDown(evt);
    });
    act(() => {
      result.current.onPointerUp();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onLongPress).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  it('ignores non-primary mouse buttons', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress }, { threshold: 600 }),
    );
    const target = document.createElement('div');
    const evt = {
      pointerType: 'mouse',
      button: 2, // right click
      clientX: 0,
      clientY: 0,
      currentTarget: target,
      nativeEvent: new Event('pointerdown'),
    } as unknown as Parameters<typeof result.current.onPointerDown>[0];
    act(() => {
      result.current.onPointerDown(evt);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onLongPress).not.toHaveBeenCalled();
  });
});