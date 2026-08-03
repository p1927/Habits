import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogTypeTodayTotalsStrip } from './LogTypeTodayTotalsStrip';
import type { FoodTodayResponse } from '../lib/api';

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();
  return {
    ...actual,
    api: {
      ...actual.api,
      getFoodTargets: vi
        .fn()
        .mockResolvedValue({ calorie_target: 2000, protein_target_g: 120, sheets_connected: true }),
      getFoodHistory: vi.fn().mockResolvedValue({ days: [], sheets_connected: true }),
    },
  };
});

import {
  baseData,
  emptyDay,
  getExpandButton,
  getMacrosPanel,
  getStripCard,
  resetHistoryMock,
  resetTargetsMock,
} from './LogTypeTodayTotalsStrip.test.helpers';

beforeEach(() => {
  resetTargetsMock();
  resetHistoryMock();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ch-163 split: keyboard-focus affordance (relay-227) extracted. Covers the
// Card-as-button contract: tabindex=0, role=button, aria-label names the
// totals summary + toggle affordance, aria-controls/aria-expanded linkage,
// Enter and Space keys toggle the panel, other keys do nothing, focus ring
// is a CSS concern, and the empty state does NOT promote the Card to a
// button.
describe('LogTypeTodayTotalsStrip — keyboard focus affordance (relay-227)', () => {
  // AC: Given a keyboard user focuses the interactive totals strip; When
  // focus enters the strip; Then a visible focus ring and accessible name
  // identify the totals summary and Enter/Space exposes its details.

  it('promotes the Card to a focusable button when macros are present', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    expect(card).not.toBeNull();
    // Card is keyboard-reachable: tabIndex=0 + role=button.
    expect(card!.getAttribute('tabindex')).toBe('0');
    expect(card!.getAttribute('role')).toBe('button');
    // Accessible name identifies the totals summary and announces the
    // toggle affordance so screen reader users know Enter/Space is wired.
    expect(card!.getAttribute('aria-label')).toMatch(/Today.+calorie and protein totals/);
    expect(card!.getAttribute('aria-label')).toMatch(/Press Enter to toggle macro details/);
    // Disclosure linkage so AT can map the toggle to its panel.
    expect(card!.getAttribute('aria-expanded')).toBe('false');
    expect(card!.getAttribute('aria-controls')).toBe('log-type-totals-strip-macros');
  });

  it('does NOT promote the Card to a button when no macros are present', () => {
    const partialData = { ...baseData, carbs: null, fat: null } as unknown as FoodTodayResponse;
    const { container } = render(
      <LogTypeTodayTotalsStrip data={partialData} serverOnline={false} />,
    );
    const card = container.querySelector('.log-type-totals-strip');
    expect(card?.getAttribute('role')).toBeNull();
    expect(card?.getAttribute('tabindex')).toBeNull();
    // aria-expanded / aria-controls are only meaningful alongside a button
    // role — they should not be surfaced when the strip is non-interactive.
    expect(card?.hasAttribute('aria-expanded')).toBe(false);
    expect(card?.hasAttribute('aria-controls')).toBe(false);
    // getStripCard helper agrees.
    expect(getStripCard(container)).toBeNull();
  });

  it('Enter on the focused strip opens the macro panel', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    expect(card).not.toBeNull();
    expect(getMacrosPanel(container)).toBeNull();
    fireEvent.keyDown(card!, { key: 'Enter' });
    expect(getMacrosPanel(container)).not.toBeNull();
    expect(card!.getAttribute('aria-expanded')).toBe('true');
    expect(getExpandButton(container)?.textContent).toBe('Hide macros');
  });

  it('Space on the focused strip opens the macro panel', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    expect(getMacrosPanel(container)).toBeNull();
    fireEvent.keyDown(card!, { key: ' ' });
    expect(getMacrosPanel(container)).not.toBeNull();
    expect(card!.getAttribute('aria-expanded')).toBe('true');
  });

  it('Enter again on the focused strip closes the panel (toggle behavior)', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    fireEvent.keyDown(card!, { key: 'Enter' });
    expect(getMacrosPanel(container)).not.toBeNull();
    fireEvent.keyDown(card!, { key: 'Enter' });
    expect(getMacrosPanel(container)).toBeNull();
    expect(card!.getAttribute('aria-expanded')).toBe('false');
  });

  it('other keys do not toggle the panel (only Enter and Space are wired)', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    fireEvent.keyDown(card!, { key: 'a' });
    fireEvent.keyDown(card!, { key: 'ArrowDown' });
    fireEvent.keyDown(card!, { key: 'Escape' });
    expect(getMacrosPanel(container)).toBeNull();
    expect(card!.getAttribute('aria-expanded')).toBe('false');
  });

  it('the focus ring is applied via :focus-visible CSS (no inline outline)', () => {
    // The visual focus ring is a CSS concern (--focus-ring token in
    // App.css) — assert the contract by reading the rendered class list.
    // We deliberately do NOT assert computed style in jsdom; a unit-level
    // css inspection is more brittle than useful. The build + lint run
    // already cover the stylesheet file, and a future Playwright journey
    // will screenshot the focus state for visual confirmation.
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    expect(card).not.toBeNull();
    // The Card carries the ui-card base class so the focus-visible rule
    // can target it via [role='button']:focus-visible.
    expect(card!.classList.contains('ui-card')).toBe(true);
    expect(card!.getAttribute('role')).toBe('button');
  });

  it('does not promote the Card to a button in the empty state (no details to expose)', () => {
    // relay-225 owns the empty state message. relay-227 must not surface an
    // Enter/Space toggle when there are no meals AND no macros to reveal.
    // hasMacros is forced false in the empty state (viewModel gates it).
    const { container } = render(
      <LogTypeTodayTotalsStrip data={emptyDay()} serverOnline={false} />,
    );
    expect(getStripCard(container)).toBeNull();
    // Card is still rendered (so screen reader users can read the summary)
    // but it is not interactive.
    const card = container.querySelector('.log-type-totals-strip');
    expect(card).not.toBeNull();
    expect(card!.getAttribute('role')).toBeNull();
  });
});
