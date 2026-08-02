import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CardsBulkActionBar } from './CardsBulkActionBar';

afterEach(() => cleanup());

describe('CardsBulkActionBar', () => {
  it('renders Selected N cards when items are selected', () => {
    render(
      <CardsBulkActionBar
        selectedCount={3}
        visibleCount={10}
        onCancel={vi.fn()}
        onDeleteSelected={vi.fn()}
        onChangeTypeClick={vi.fn()}
      />,
    );
    expect(screen.getByText(/Selected 3 cards/)).toBeTruthy();
  });

  it('renders Select cards when nothing selected', () => {
    render(
      <CardsBulkActionBar
        selectedCount={0}
        visibleCount={10}
        onCancel={vi.fn()}
        onDeleteSelected={vi.fn()}
        onChangeTypeClick={vi.fn()}
      />,
    );
    expect(screen.getByText('Select cards')).toBeTruthy();
  });

  it('disables Delete + Change type when nothing selected', () => {
    render(
      <CardsBulkActionBar
        selectedCount={0}
        visibleCount={10}
        onCancel={vi.fn()}
        onDeleteSelected={vi.fn()}
        onChangeTypeClick={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /Delete/ }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: /Change type/ }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Cancel' }).hasAttribute('disabled')).toBe(false);
  });

  it('invokes callbacks on click', () => {
    const onCancel = vi.fn();
    const onDelete = vi.fn();
    const onChange = vi.fn();
    render(
      <CardsBulkActionBar
        selectedCount={2}
        visibleCount={10}
        onCancel={onCancel}
        onDeleteSelected={onDelete}
        onChangeTypeClick={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: /Delete/ }));
    fireEvent.click(screen.getByRole('button', { name: /Change type/ }));
    expect(onCancel).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalled();
  });

  it('exposes toolbar landmark + aria-live count for AT', () => {
    const { container } = render(
      <CardsBulkActionBar
        selectedCount={1}
        visibleCount={4}
        onCancel={vi.fn()}
        onDeleteSelected={vi.fn()}
        onChangeTypeClick={vi.fn()}
      />,
    );
    expect(container.querySelector('[role="toolbar"]')).not.toBeNull();
    const status = container.querySelector('[role="status"]');
    expect(status).not.toBeNull();
    expect(status?.getAttribute('aria-live')).toBe('polite');
  });
});