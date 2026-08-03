import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CardsFilterBar } from './CardsFilterBar';

afterEach(() => cleanup());

const baseProps = {
  search: '',
  filter: 'all' as const,
  onSearchChange: vi.fn(),
  onFilterChange: vi.fn(),
  showShortcutHint: false,
  onDismissShortcutHint: vi.fn(),
  selectionMode: false,
  hasCards: true,
  onEnterSelection: vi.fn(),
  showBulkHint: false,
  onDismissBulkHint: vi.fn(),
};

describe('CardsFilterBar — ui-070 bulk-select discoverability', () => {
  it('renders Select chip when hasCards=true and not in selection mode', () => {
    render(<CardsFilterBar {...baseProps} />);
    const chip = screen.getByTestId('cards-select-chip');
    expect(chip).toBeTruthy();
    expect(chip.getAttribute('aria-label')).toBe('Select cards');
    // aria-keyshortcuts uses platform-dependent modifier — accept either ⌘ or Ctrl+.
    const shortcut = chip.getAttribute('aria-keyshortcuts') ?? '';
    expect(shortcut.includes('Shift+A')).toBe(true);
  });

  it('hides Select chip when in selection mode', () => {
    render(<CardsFilterBar {...baseProps} selectionMode />);
    expect(screen.queryByTestId('cards-select-chip')).toBeNull();
  });

  it('hides Select chip when there are no cards', () => {
    render(<CardsFilterBar {...baseProps} hasCards={false} />);
    expect(screen.queryByTestId('cards-select-chip')).toBeNull();
  });

  it('invokes onEnterSelection when Select chip is clicked', () => {
    const onEnter = vi.fn();
    render(<CardsFilterBar {...baseProps} onEnterSelection={onEnter} />);
    fireEvent.click(screen.getByTestId('cards-select-chip'));
    expect(onEnter).toHaveBeenCalled();
  });

  it('renders first-visit bulk hint when showBulkHint=true and not in selection mode', () => {
    render(<CardsFilterBar {...baseProps} showBulkHint />);
    expect(screen.getByText(/long-press a card/i)).toBeTruthy();
  });

  it('hides bulk hint when in selection mode', () => {
    render(<CardsFilterBar {...baseProps} showBulkHint selectionMode />);
    expect(screen.queryByText(/long-press a card/i)).toBeNull();
  });

  it('hides bulk hint when there are no cards', () => {
    render(<CardsFilterBar {...baseProps} showBulkHint hasCards={false} />);
    expect(screen.queryByText(/long-press a card/i)).toBeNull();
  });

  it('invokes onDismissBulkHint when Got it is tapped on the bulk hint', () => {
    const onDismiss = vi.fn();
    render(<CardsFilterBar {...baseProps} showBulkHint onDismissBulkHint={onDismiss} />);
    // Multiple "Got it" buttons may render (filter hint also has one). Pick the
    // one that lives inside the bulk hint by querying the hint text node first.
    const hint = screen.getByText(/long-press a card/i);
    const gotIt = hint.parentElement?.querySelector('button.link-btn');
    expect(gotIt).toBeTruthy();
    fireEvent.click(gotIt as HTMLElement);
    expect(onDismiss).toHaveBeenCalled();
  });

  it('still exposes the filter shortcut hint independently of bulk hint', () => {
    render(<CardsFilterBar {...baseProps} showShortcutHint />);
    expect(screen.getByText(/switch filters/i)).toBeTruthy();
    expect(screen.queryByText(/long-press a card/i)).toBeNull();
  });
});
