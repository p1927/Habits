import { useCallback, useEffect, useState } from 'react';
import { isTypingTarget, LOG_SHORTCUT_HINT_KEY, LOG_TABS, type LogTab } from '../lib/logSectionShared';

export function useLogTabShortcuts(setTab: (tab: LogTab) => void) {
  const [showShortcutHint, setShowShortcutHint] = useState(
    () => localStorage.getItem(LOG_SHORTCUT_HINT_KEY) !== '1',
  );

  const dismissShortcutHint = useCallback(() => {
    localStorage.setItem(LOG_SHORTCUT_HINT_KEY, '1');
    setShowShortcutHint(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const num = Number.parseInt(e.key, 10);
      if (num < 1 || num > LOG_TABS.length) return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      setTab(LOG_TABS[num - 1]);
      dismissShortcutHint();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setTab, dismissShortcutHint]);

  return { showShortcutHint, dismissShortcutHint };
}
