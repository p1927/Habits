import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SettingsGoogleCard } from './SettingsGoogleCard';

afterEach(() => cleanup());

const noop = () => undefined;
const allScopes = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar',
];

describe('SettingsGoogleCard (ui-069 OAuth scopes panel)', () => {
  it('hides scope checklist when disconnected', () => {
    render(
      <SettingsGoogleCard
        googleConnected={false}
        authUrl="https://example.com/auth"
        googleScopes={[]}
        onDisconnect={noop}
      />,
    );
    // The scope list is rendered only when connected.
    expect(screen.queryByRole('region', { name: /Granted Google permissions/i })).toBeNull();
    // Connect CTA is shown.
    expect(screen.getByRole('link', { name: /Connect Google/i })).toBeTruthy();
    // Manage link should not appear when disconnected.
    expect(screen.queryByRole('link', { name: /Manage on Google Account/i })).toBeNull();
  });

  it('shows Granted pill for every scope when fully granted', () => {
    render(
      <SettingsGoogleCard
        googleConnected
        authUrl="https://example.com/auth"
        googleScopes={allScopes}
        onDisconnect={noop}
      />,
    );
    const granted = screen.getAllByText(/^Granted$/);
    expect(granted.length).toBe(2);
    // Re-connect pill should not appear when all granted.
    expect(screen.queryByRole('link', { name: /^Re-connect Google$/i })).toBeNull();
    // Manage link should appear.
    expect(screen.getByRole('link', { name: /Manage on Google Account/i })).toBeTruthy();
  });

  it('shows Not granted + Re-connect pill when a scope is missing', () => {
    render(
      <SettingsGoogleCard
        googleConnected
        authUrl="https://example.com/auth"
        googleScopes={['https://www.googleapis.com/auth/spreadsheets']}
        onDisconnect={noop}
      />,
    );
    // Calendar row should be Not granted.
    expect(screen.getByText(/^Not granted$/)).toBeTruthy();
    // Reconnect CTA must be present (crit-077 / crit-029 AC).
    const reconnect = screen.getByRole('link', { name: /Re-connect Google/i });
    expect(reconnect.getAttribute('href')).toBe('https://example.com/auth');
    // Copy nudge explains the missing scope.
    expect(screen.getByText(/A permission is missing/i)).toBeTruthy();
  });

  it('shows Checking… pill when connected but scopes not yet loaded', () => {
    render(
      <SettingsGoogleCard
        googleConnected
        authUrl="https://example.com/auth"
        googleScopes={[]}
        onDisconnect={noop}
      />,
    );
    // Two rows; both should show Checking… rather than Not granted
    // (avoids a false negative on the first paint after OAuth return).
    const checking = screen.getAllByText(/^Checking…$/);
    expect(checking.length).toBe(2);
    // Re-connect should not appear yet — we don't know what's missing.
    expect(screen.queryByRole('link', { name: /^Re-connect Google$/i })).toBeNull();
  });

  it('Manage on Google link opens myaccount.google.com in a new tab with rel=noopener', () => {
    render(
      <SettingsGoogleCard
        googleConnected
        authUrl="https://example.com/auth"
        googleScopes={allScopes}
        onDisconnect={noop}
      />,
    );
    const link = screen.getByRole('link', { name: /Manage on Google Account/i });
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.getAttribute('href')).toBe('https://myaccount.google.com/permissions');
  });

  it('scope list region is announced via aria-live', () => {
    render(
      <SettingsGoogleCard
        googleConnected
        authUrl="https://example.com/auth"
        googleScopes={allScopes}
        onDisconnect={noop}
      />,
    );
    const region = screen.getByRole('region', { name: /Granted Google permissions/i });
    expect(region.getAttribute('aria-live')).toBe('polite');
  });
});
