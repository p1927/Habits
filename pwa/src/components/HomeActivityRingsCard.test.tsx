import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeActivityRingsCard } from './HomeActivityRingsCard';

const baseProps = {
  loading: false,
  serverOnline: true,
  sharing: false,
  protein: 0,
  proteinTarget: 120,
  calories: 0,
  calTarget: 2000,
  habitsPct: 0,
  burn: 0,
  onShare: vi.fn(),
};

describe('HomeActivityRingsCard', () => {
  it('offers the first-meal CTA when no food has been logged', () => {
    const onOpenLogScan = vi.fn();
    const { unmount } = render(<HomeActivityRingsCard {...baseProps} onOpenLogScan={onOpenLogScan} />);

    fireEvent.click(screen.getByRole('button', { name: 'Log your first meal' }));

    expect(onOpenLogScan).toHaveBeenCalledOnce();
    unmount();
  });

  it('hides the first-meal CTA after food has been logged', () => {
    render(<HomeActivityRingsCard {...baseProps} protein={12} calories={320} onOpenLogScan={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Log your first meal' })).toBeNull();
  });
});
