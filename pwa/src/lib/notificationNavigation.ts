import type { TabId } from './config';

export const NAVIGATE_MESSAGE = 'habits-navigate';

const VALID_TABS: TabId[] = ['home', 'log', 'day', 'cards', 'agent', 'settings'];

export function tabFromNotificationUrl(url: string): TabId {
  const hash = url.includes('#') ? url.split('#').pop() ?? '' : '';
  if (VALID_TABS.includes(hash as TabId)) return hash as TabId;
  return 'log';
}

export function openLogFromNotification() {
  window.focus();
  window.location.hash = 'log';
}

export function bindNotificationNavigation(onNavigate: (tab: TabId) => void): () => void {
  if (!('serviceWorker' in navigator)) return () => {};

  const handler = (event: MessageEvent) => {
    if (event.data?.type !== NAVIGATE_MESSAGE) return;
    onNavigate(tabFromNotificationUrl(String(event.data.url ?? '#log')));
  };

  navigator.serviceWorker.addEventListener('message', handler);
  return () => navigator.serviceWorker.removeEventListener('message', handler);
}
