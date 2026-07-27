import type { TabId } from './config';

export const APP_TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '◉' },
  { id: 'log', label: 'Log', icon: '⌖' },
  { id: 'day', label: 'Day', icon: '⌁' },
  { id: 'cards', label: 'Cards', icon: '✎' },
  { id: 'agent', label: 'Coach', icon: '✦' },
];

export const APP_STATUS_LABELS: Record<string, string> = {
  online: 'Server connected',
  'online-unauthorized': 'Server connected, authorization required',
  offline: 'Server offline',
  checking: 'Checking server connection',
  'no-config': 'API URL not configured',
};

const VALID_TABS: TabId[] = ['home', 'log', 'day', 'cards', 'agent', 'settings', 'futureself'];

export function parseInitialAppTab(): TabId {
  const hash = window.location.hash.replace('#', '');
  if (VALID_TABS.includes(hash as TabId)) return hash as TabId;
  return 'home';
}
