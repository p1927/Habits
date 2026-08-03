import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AgentComposerStatusChips } from './statusChips';

function findByText(container: HTMLElement, text: string): Element | null {
  return Array.from(container.querySelectorAll('*')).find((el) => el.textContent === text) ?? null;
}

describe('AgentComposerStatusChips', () => {
  it('renders nothing when not loading and no tools', () => {
    const { container } = render(
      <AgentComposerStatusChips loading={false} activeTools={[]} toolStatusLabels={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('falls back to "Working…" chip when loading with no active tools', () => {
    const { container } = render(
      <AgentComposerStatusChips loading={true} activeTools={[]} toolStatusLabels={[]} />,
    );
    const status = container.querySelector('.agent-tool-status');
    expect(status?.getAttribute('aria-live')).toBe('polite');
    expect(status?.getAttribute('aria-busy')).toBe('true');
    expect(status?.getAttribute('aria-label')).toBe('Coach activity');
    expect(findByText(container, 'Working…')).not.toBeNull();
  });

  it('maps active tool names to human-readable labels', () => {
    const { container } = render(
      <AgentComposerStatusChips
        loading={true}
        activeTools={['log_food', 'list_calendar_events', 'update_habit']}
        toolStatusLabels={[]}
      />,
    );
    expect(findByText(container, 'Logging food…')).not.toBeNull();
    expect(findByText(container, 'Checking calendar…')).not.toBeNull();
    expect(findByText(container, 'Updating habits…')).not.toBeNull();
  });

  it('deduplicates chips with the same label', () => {
    const { container } = render(
      <AgentComposerStatusChips
        loading={true}
        activeTools={['log_food', 'log_food_item', 'search_food']}
        toolStatusLabels={[]}
      />,
    );
    expect(container.querySelectorAll('.agent-tool-status__chip')).toHaveLength(2);
    expect(findByText(container, 'Logging food…')).not.toBeNull();
    expect(findByText(container, 'Checking food log…')).not.toBeNull();
  });

  it('does not render aria-busy=true when loading is false but labels are passed', () => {
    const { container } = render(
      <AgentComposerStatusChips
        loading={false}
        activeTools={[]}
        toolStatusLabels={['Custom label…']}
      />,
    );
    const status = container.querySelector('.agent-tool-status');
    expect(status?.getAttribute('aria-busy')).toBe('false');
    expect(findByText(container, 'Custom label…')).not.toBeNull();
  });

  it('marks chips as active while loading for visual cue', () => {
    const { container } = render(
      <AgentComposerStatusChips
        loading={true}
        activeTools={['log_food']}
        toolStatusLabels={[]}
      />,
    );
    const chip = container.querySelector('.agent-tool-status__chip');
    expect(chip?.classList.contains('agent-tool-status__chip--active')).toBe(true);
  });

  it('does not mark chips as active when not loading (even if labels are passed)', () => {
    const { container } = render(
      <AgentComposerStatusChips
        loading={false}
        activeTools={[]}
        toolStatusLabels={['Stale label…']}
      />,
    );
    const chip = container.querySelector('.agent-tool-status__chip');
    expect(chip?.classList.contains('agent-tool-status__chip--active')).toBe(false);
  });

  it('includes a hidden dot indicator on each chip', () => {
    const { container } = render(
      <AgentComposerStatusChips
        loading={true}
        activeTools={['log_food']}
        toolStatusLabels={[]}
      />,
    );
    const dot = container.querySelector('.agent-tool-status__dot');
    expect(dot).not.toBeNull();
    expect(dot?.getAttribute('aria-hidden')).toBe('true');
  });
});
