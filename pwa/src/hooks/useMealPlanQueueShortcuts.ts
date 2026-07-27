import { useEffect } from 'react';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export function useMealPlanQueueShortcuts(opts: {
  enabled: boolean;
  serverOnline: boolean;
  syncing: boolean;
  retrying: boolean;
  onSyncAll: () => void;
}) {
  const { enabled, serverOnline, syncing, retrying, onSyncAll } = opts;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (e.key !== 's' && e.key !== 'S') return;
      if (!serverOnline || syncing || retrying) return;
      e.preventDefault();
      onSyncAll();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, serverOnline, syncing, retrying, onSyncAll]);
}
