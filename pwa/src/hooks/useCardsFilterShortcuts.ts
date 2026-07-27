import { useCallback, useEffect, useState } from 'react';
import { CARDS_FILTERS, CARDS_SHORTCUT_HINT_KEY, type CardsFilter } from '../lib/cardsSectionShared';
import { isTypingTarget } from '../lib/logSectionShared';

export function useCardsFilterShortcuts(
  setFilter: (filter: CardsFilter) => void,
  blocked: boolean,
) {
  const [showShortcutHint, setShowShortcutHint] = useState(
    () => localStorage.getItem(CARDS_SHORTCUT_HINT_KEY) !== '1',
  );

  const dismissShortcutHint = useCallback(() => {
    localStorage.setItem(CARDS_SHORTCUT_HINT_KEY, '1');
    setShowShortcutHint(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (blocked) return;
      if (!(e.metaKey || e.ctrlKey)) return;
      const num = Number.parseInt(e.key, 10);
      if (num < 1 || num > CARDS_FILTERS.length) return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      setFilter(CARDS_FILTERS[num - 1]);
      dismissShortcutHint();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setFilter, dismissShortcutHint, blocked]);

  return { showShortcutHint, dismissShortcutHint };
}
