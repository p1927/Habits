import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { useCardsBulkShortcut } from './useCardsBulkShortcut';

afterEach(() => cleanup());

interface HarnessProps {
  blocked?: boolean;
  onSelectionChange?: (mode: boolean) => void;
}

function Harness({ blocked = false, onSelectionChange }: HarnessProps) {
  const [selectionMode, setSelectionMode] = useState(false);
  useCardsBulkShortcut(selectionMode, (next) => {
    setSelectionMode(next);
    onSelectionChange?.(next);
  }, blocked);
  return <div data-testid="harness" data-mode={selectionMode ? 'on' : 'off'} />;
}

describe('useCardsBulkShortcut', () => {
  it('Cmd+Shift+A enters selection mode', () => {
    const onChange = vi.fn();
    render(<Harness onSelectionChange={onChange} />);
    act(() => {
      fireEvent.keyDown(window, { key: 'A', metaKey: true, shiftKey: true });
    });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('Ctrl+Shift+A enters selection mode (non-Mac)', () => {
    const onChange = vi.fn();
    render(<Harness onSelectionChange={onChange} />);
    act(() => {
      fireEvent.keyDown(window, { key: 'A', ctrlKey: true, shiftKey: true });
    });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('Cmd+Shift+a (lowercase) also enters selection mode', () => {
    const onChange = vi.fn();
    render(<Harness onSelectionChange={onChange} />);
    act(() => {
      fireEvent.keyDown(window, { key: 'a', metaKey: true, shiftKey: true });
    });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('Cmd+A without Shift is ignored (avoids Cmd+A text-select collision)', () => {
    const onChange = vi.fn();
    render(<Harness onSelectionChange={onChange} />);
    act(() => {
      fireEvent.keyDown(window, { key: 'A', metaKey: true });
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Cmd+Alt+Shift+A is ignored (Alt gate)', () => {
    const onChange = vi.fn();
    render(<Harness onSelectionChange={onChange} />);
    act(() => {
      fireEvent.keyDown(window, { key: 'A', metaKey: true, shiftKey: true, altKey: true });
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Esc exits selection mode when active', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Harness onSelectionChange={onChange} />);
    act(() => {
      fireEvent.keyDown(window, { key: 'A', metaKey: true, shiftKey: true });
    });
    expect(onChange).toHaveBeenLastCalledWith(true);
    // Re-render so the hook sees selectionMode=true and arms Esc exit.
    rerender(<Harness onSelectionChange={onChange} />);
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('Esc outside selection mode is a no-op (does not toggle)', () => {
    const onChange = vi.fn();
    render(<Harness onSelectionChange={onChange} />);
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('blocked=true (e.g. FAB sheet open) suppresses both shortcuts', () => {
    const onChange = vi.fn();
    render(<Harness blocked onSelectionChange={onChange} />);
    act(() => {
      fireEvent.keyDown(window, { key: 'A', metaKey: true, shiftKey: true });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('typing target (input) suppresses Cmd+Shift+A', () => {
    const onChange = vi.fn();
    render(
      <>
        <input data-testid="search" />
        <Harness onSelectionChange={onChange} />
      </>,
    );
    const input = document.querySelector('input');
    if (!input) throw new Error('input missing');
    act(() => {
      fireEvent.keyDown(input, { key: 'A', metaKey: true, shiftKey: true });
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
