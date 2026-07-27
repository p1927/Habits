import { useCallback, useEffect, useState } from 'react';
import { DAY_SCHEDULE_VIEWS, DAY_SHORTCUT_HINT_KEY, type DayScheduleView } from '../lib/daySectionShared';
import { isTypingTarget } from '../lib/logSectionShared';

export function useDayScheduleShortcuts(setView: (view: DayScheduleView) => void) {
  const [showShortcutHint, setShowShortcutHint] = useState(
    () => localStorage.getItem(DAY_SHORTCUT_HINT_KEY) !== '1',
  );

  const dismissShortcutHint = useCallback(() => {
    localStorage.setItem(DAY_SHORTCUT_HINT_KEY, '1');
    setShowShortcutHint(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const num = Number.parseInt(e.key, 10);
      if (num < 1 || num > DAY_SCHEDULE_VIEWS.length) return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      setView(DAY_SCHEDULE_VIEWS[num - 1]);
      dismissShortcutHint();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setView, dismissShortcutHint]);

  return { showShortcutHint, dismissShortcutHint };
}
