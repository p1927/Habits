import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AgentChatComposer } from '../AgentChatComposer';

function getStatusChips(container: HTMLElement): Element | null {
  return container.querySelector('.agent-tool-status');
}

describe('AgentChatComposer status chips lifecycle (crit-002)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders status chips inside the composer dock while loading=true', () => {
    const { container } = render(
      <AgentChatComposer
        serverOnline={true}
        loading={true}
        scanning={false}
        input=""
        attachImage={null}
        activeTools={['log_food']}
        toolStatusLabels={[]}
        onInputChange={() => {}}
        onSubmit={() => {}}
        onClearAttach={() => {}}
        onOpenCamera={() => {}}
        onOpenVoice={() => {}}
        onOpenTools={() => {}}
      />,
    );
    const status = getStatusChips(container);
    expect(status).not.toBeNull();
    expect(status?.getAttribute('aria-live')).toBe('polite');
    expect(status?.getAttribute('aria-busy')).toBe('true');
    expect(status?.getAttribute('aria-label')).toBe('Coach activity');
    expect(status?.textContent).toMatch(/Logging food…/);
  });

  it('removes status chips from the composer dock when loading transitions to false', async () => {
    const { container, rerender } = render(
      <AgentChatComposer
        serverOnline={true}
        loading={true}
        scanning={false}
        input=""
        attachImage={null}
        activeTools={['log_food']}
        toolStatusLabels={[]}
        onInputChange={() => {}}
        onSubmit={() => {}}
        onClearAttach={() => {}}
        onOpenCamera={() => {}}
        onOpenVoice={() => {}}
        onOpenTools={() => {}}
      />,
    );
    expect(getStatusChips(container)).not.toBeNull();

    await act(async () => {
      rerender(
        <AgentChatComposer
          serverOnline={true}
          loading={false}
          scanning={false}
          input=""
          attachImage={null}
          activeTools={[]}
          toolStatusLabels={[]}
          onInputChange={() => {}}
          onSubmit={() => {}}
          onClearAttach={() => {}}
          onOpenCamera={() => {}}
          onOpenVoice={() => {}}
          onOpenTools={() => {}}
        />,
      );
    });

    await waitFor(() => {
      expect(getStatusChips(container)).toBeNull();
    });
  });

  it('does not render chips when loading=false even if toolStatusLabels queued', () => {
    const { container } = render(
      <AgentChatComposer
        serverOnline={true}
        loading={false}
        scanning={false}
        input=""
        attachImage={null}
        activeTools={[]}
        toolStatusLabels={['Logging food…']}
        onInputChange={() => {}}
        onSubmit={() => {}}
        onClearAttach={() => {}}
        onOpenCamera={() => {}}
        onOpenVoice={() => {}}
        onOpenTools={() => {}}
      />,
    );
    expect(getStatusChips(container)).toBeNull();
  });

  it('falls back to a Working chip when loading=true with no active tools or labels', () => {
    const { container } = render(
      <AgentChatComposer
        serverOnline={true}
        loading={true}
        scanning={false}
        input=""
        attachImage={null}
        activeTools={[]}
        toolStatusLabels={[]}
        onInputChange={() => {}}
        onSubmit={() => {}}
        onClearAttach={() => {}}
        onOpenCamera={() => {}}
        onOpenVoice={() => {}}
        onOpenTools={() => {}}
      />,
    );
    const status = getStatusChips(container);
    expect(status).not.toBeNull();
    expect(status?.getAttribute('aria-busy')).toBe('true');
    expect(status?.textContent).toMatch(/Working…/);
  });

  it('mirrors the live state across active tools transitioning to a different tool', () => {
    const { container, rerender } = render(
      <AgentChatComposer
        serverOnline={true}
        loading={true}
        scanning={false}
        input=""
        attachImage={null}
        activeTools={['log_food']}
        toolStatusLabels={[]}
        onInputChange={() => {}}
        onSubmit={() => {}}
        onClearAttach={() => {}}
        onOpenCamera={() => {}}
        onOpenVoice={() => {}}
        onOpenTools={() => {}}
      />,
    );
    expect(container.querySelector('.agent-tool-status')?.textContent).toMatch(/Logging food…/);

    act(() => {
      rerender(
        <AgentChatComposer
          serverOnline={true}
          loading={true}
          scanning={false}
          input=""
          attachImage={null}
          activeTools={['list_calendar_events']}
          toolStatusLabels={[]}
          onInputChange={() => {}}
          onSubmit={() => {}}
          onClearAttach={() => {}}
          onOpenCamera={() => {}}
          onOpenVoice={() => {}}
          onOpenTools={() => {}}
        />,
      );
    });
    const status = container.querySelector('.agent-tool-status');
    expect(status?.textContent).toMatch(/Checking calendar…/);
    expect(status?.textContent).not.toMatch(/Logging food…/);
  });
});
