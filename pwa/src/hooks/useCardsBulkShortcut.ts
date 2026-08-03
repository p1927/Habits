import { useEffect } from 'react';
import { isTypingTarget } from '../lib/logSectionShared';

/**
 * Keyboard shortcuts for the Cards bulk-select affordance (ui-070 / crit-079):
 *
 * - ⌘/Ctrl + Shift + A — enter selection mode (idempotent — safe to re-fire while in mode).
 * - Escape — exit selection mode when active.
 *
 * Mirrors `useCardsFilterShortcuts` patterns but is intentionally chord-based
 * (Cmd+Shift+A) so the same chord does not collide with `useAppTabShortcuts`
 * (Cmd+1..N) or `useCardsFilterShortcuts` (Cmd+1..4).
 */
export function useCardsBulkShortcut(
  selectionMode: boolean,
  setSelectionMode: (next: boolean) => void,
  blocked: boolean,
) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (blocked) return;
      if (isTypingTarget(e.target)) return;

      // Escape — exit selection mode (no-op outside Cards selection mode).
      if (e.key === 'Escape' && selectionMode) {
        e.preventDefault();
        setSelectionMode(false);
        return;
      }

      // Cmd/Ctrl + Shift + A — enter selection mode.
      const mod = e.metaKey || e.ctrlKey;
      if (!mod || !e.shiftKey || e.altKey) return;
      if (typeof e.key === 'string' && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (!selectionMode) setSelectionMode(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectionMode, setSelectionMode, blocked]);
}
