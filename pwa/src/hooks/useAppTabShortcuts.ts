import { useCallback, useEffect, useState } from 'react';
import type { TabId } from '../lib/config';
import { APP_TABS, APP_TAB_SHORTCUT_HINT_KEY } from '../lib/appShellShared';
import { isTypingTarget } from '../lib/logSectionShared';

function shouldHandleAppTabShortcut(activeTab: TabId, keyNum: number): boolean {
  if (keyNum < 1 || keyNum > APP_TABS.length) return false;
  if (activeTab === 'log') return false;
  if (activeTab === 'day' && keyNum <= 2) return false;
  if (activeTab === 'cards' && keyNum <= 4) return false;
  return true;
}

/** Whether ⌘/Ctrl+N should be advertised on a main tab button (matches keydown handler). */
export function isAppTabShortcutAvailable(activeTab: TabId, tabIndex: number): boolean {
  return shouldHandleAppTabShortcut(activeTab, tabIndex + 1);
}

export function useAppTabShortcuts(
  activeTab: TabId,
  onTabChange: (id: TabId) => void,
  preloadTab: (id: TabId) => void,
) {
  const [showShortcutHint, setShowShortcutHint] = useState(
    () => localStorage.getItem(APP_TAB_SHORTCUT_HINT_KEY) !== '1',
  );

  const dismissShortcutHint = useCallback(() => {
    localStorage.setItem(APP_TAB_SHORTCUT_HINT_KEY, '1');
    setShowShortcutHint(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      const num = Number.parseInt(e.key, 10);
      if (!shouldHandleAppTabShortcut(activeTab, num)) return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      const nextTab = APP_TABS[num - 1].id;
      preloadTab(nextTab);
      onTabChange(nextTab);
      dismissShortcutHint();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, onTabChange, preloadTab, dismissShortcutHint]);

  return { showShortcutHint, dismissShortcutHint };
}
