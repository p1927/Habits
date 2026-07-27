import { useCallback, useEffect, useState } from 'react';
import { SETTINGS_SHORTCUT_HINT_KEY } from '../lib/appShellShared';
import { isTypingTarget } from '../lib/logSectionShared';

export function useSettingsOpenShortcut(onOpenSettings: () => void) {
  const [showShortcutHint, setShowShortcutHint] = useState(
    () => localStorage.getItem(SETTINGS_SHORTCUT_HINT_KEY) !== '1',
  );

  const dismissShortcutHint = useCallback(() => {
    localStorage.setItem(SETTINGS_SHORTCUT_HINT_KEY, '1');
    setShowShortcutHint(false);
  }, []);

  const openSettings = useCallback(() => {
    onOpenSettings();
    dismissShortcutHint();
  }, [onOpenSettings, dismissShortcutHint]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      if (e.key !== ',') return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      openSettings();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openSettings]);

  return { showShortcutHint, dismissShortcutHint, openSettings };
}
