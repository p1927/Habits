import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CardsCreateSheet } from './CardsCreateSheet';

afterEach(() => cleanup());

const noop = () => undefined;
const baseProps = {
  open: true,
  serverOnline: true,
  newType: 'notes' as const,
  newTitle: '',
  newBody: '',
  onClose: noop,
  onTypeChange: noop,
  onTitleChange: noop,
  onBodyChange: noop,
  onSubmit: vi.fn(),
};

describe('CardsCreateSheet (ui-068 body-first capture)', () => {
  it('Save is disabled when body is empty', () => {
    render(<CardsCreateSheet {...baseProps} />);
    const save = screen.getByRole('button', { name: /Save/i });
    expect(save.hasAttribute('disabled')).toBe(true);
  });

  it('Save is enabled when body is non-empty even if title is blank', () => {
    render(<CardsCreateSheet {...baseProps} newBody="Just a thought without title" />);
    const save = screen.getByRole('button', { name: /Save/i });
    expect(save.hasAttribute('disabled')).toBe(false);
  });

  it('Save remains disabled when only whitespace body', () => {
    render(<CardsCreateSheet {...baseProps} newBody={"   \n  \t  "} />);
    const save = screen.getByRole('button', { name: /Save/i }) as HTMLButtonElement;
    expect(save.hasAttribute('disabled')).toBe(true);
  });

  it('title input is no longer marked required (HTML required attribute)', () => {
    render(<CardsCreateSheet {...baseProps} />);
    const titleInput = screen.getByLabelText(/Title/i) as HTMLInputElement;
    expect(titleInput.hasAttribute('required')).toBe(false);
  });

  it('title placeholder shows live preview derived from body when title blank', () => {
    render(<CardsCreateSheet {...baseProps} newBody="A note worth remembering" />);
    const titleInput = screen.getByLabelText(/Title/i) as HTMLInputElement;
    expect(titleInput.placeholder).toBe('Title: A note worth remembering');
  });

  it('explicit title wins — placeholder shows explicit title when provided', () => {
    render(
      <CardsCreateSheet {...baseProps} newTitle="My explicit title" newBody="body line" />,
    );
    const titleInput = screen.getByLabelText(/Title/i) as HTMLInputElement;
    expect(titleInput.placeholder).toBe('Title: My explicit title');
  });

  it('body textarea autofocuses when sheet opens', async () => {
    render(<CardsCreateSheet {...baseProps} newBody="auto focus me" />);
    await waitFor(() => {
      const ta = screen.getByPlaceholderText(/Type a thought/i) as HTMLTextAreaElement;
      expect(document.activeElement).toBe(ta);
    });
  });

  it('body textarea has required attribute (HTML required)', () => {
    render(<CardsCreateSheet {...baseProps} />);
    const body = screen.getByPlaceholderText(/Type a thought/i) as HTMLTextAreaElement;
    expect(body.hasAttribute('required')).toBe(true);
  });
});
