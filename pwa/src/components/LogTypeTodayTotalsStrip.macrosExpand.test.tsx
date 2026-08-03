import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
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
  getExpandButton,
  getMacrosPanel,
  getStripCard,
  getStripText,
  mockTargets,
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

// ch-163 split: macros-expand (relay-222 + relay-227) extracted. Covers the
// Card-as-disclosure-button contract: aria-expanded, aria-controls,
// aria-label affordance, panel rendering after click, collapse on second
// click, DOM order (panel between protein and footer), and the
// no-macros→non-interactive fallback.
describe('LogTypeTodayTotalsStrip — macros expansion (relay-222 + relay-227)', () => {
  // relay-227: the strip itself is the disclosure toggle (Card onClick +
  // Enter/Space). The inner button was removed in favor of a non-interactive
  // hint <p> because nesting a real <button> inside a div[role=button] is
  // invalid HTML. These tests now drive the Card (the new toggle) and read
  // the hint <p> for the visible "Show macros" / "Hide macros" label.

  it('renders the strip as a button with aria-expanded=false when macros are present', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    expect(card).not.toBeNull();
    expect(card?.getAttribute('aria-expanded')).toBe('false');
    expect(card?.getAttribute('aria-controls')).toBe('log-type-totals-strip-macros');
    // Accessible name announces the toggle affordance so screen reader users
    // know the strip is interactive.
    expect(card?.getAttribute('aria-label')).toMatch(/Press Enter to toggle macro details/);
    // The hint <p> shows the upcoming state.
    expect(getExpandButton(container)?.textContent).toBe('Show macros');
    // Panel is hidden until activated
    expect(getMacrosPanel(container)).toBeNull();
  });

  it('does not render the strip as a button when macros are null (no details to expose)', () => {
    const partialData = { ...baseData, carbs: null, fat: null } as unknown as FoodTodayResponse;
    const { container } = render(
      <LogTypeTodayTotalsStrip data={partialData} serverOnline={false} />,
    );
    expect(getStripCard(container)).toBeNull();
    expect(getExpandButton(container)).toBeNull();
    expect(getMacrosPanel(container)).toBeNull();
  });

  it('activating the strip reveals carbs and fat lines below protein', async () => {
    mockTargets();

    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={true} />,
    );

    await waitFor(() => {
      expect(getStripText(container)).toContain('750 kcal / 2000');
    });

    const card = getStripCard(container);
    expect(card).not.toBeNull();
    fireEvent.click(card!);

    const panel = getMacrosPanel(container);
    expect(panel).not.toBeNull();
    // Carbs row: 80g from baseData, formatted with one decimal place
    expect(panel?.textContent).toContain('Carbs');
    expect(panel?.textContent).toContain('80.0g');
    // Fat row: 25g from baseData
    expect(panel?.textContent).toContain('Fat');
    expect(panel?.textContent).toContain('25.0g');
    // After expansion aria-expanded flips to true and the hint shows the
    // upcoming state.
    expect(card!.getAttribute('aria-expanded')).toBe('true');
    expect(getExpandButton(container)?.textContent).toBe('Hide macros');
  });

  it('activating the strip again collapses the panel', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    fireEvent.click(card!);
    expect(getMacrosPanel(container)).not.toBeNull();
    fireEvent.click(card!);
    expect(getMacrosPanel(container)).toBeNull();
    expect(card!.getAttribute('aria-expanded')).toBe('false');
    expect(getExpandButton(container)?.textContent).toBe('Show macros');
  });

  it('expanded panel sits below the protein row and above the footer', () => {
    const { container } = render(
      <LogTypeTodayTotalsStrip data={baseData} serverOnline={false} />,
    );
    const card = getStripCard(container);
    fireEvent.click(card!);
    const strip = container.querySelector('.log-type-totals-strip') as HTMLElement;
    const children = Array.from(strip.children) as HTMLElement[];
    const proteinIdx = children.findIndex((el) =>
      el.classList.contains('log-type-totals-strip__protein'),
    );
    const panelIdx = children.findIndex((el) =>
      el.matches('[data-testid="log-type-totals-strip-macros"]'),
    );
    const footerIdx = children.findIndex((el) =>
      el.classList.contains('log-type-totals-strip__footer'),
    );
    expect(proteinIdx).toBeGreaterThanOrEqual(0);
    expect(panelIdx).toBeGreaterThan(proteinIdx);
    expect(footerIdx).toBeGreaterThan(panelIdx);
  });
});
