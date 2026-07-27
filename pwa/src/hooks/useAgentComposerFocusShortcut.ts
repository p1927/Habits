import { useEffect } from 'react';
import { isTypingTarget } from '../lib/logSectionShared';

const COMPOSER_INPUT_ID = 'agent-chat-input';

export function useAgentComposerFocusShortcut(blocked: boolean) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (blocked) return;
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      if (e.key.toLowerCase() !== 'k') return;
      const target = e.target;
      if (
        isTypingTarget(target) &&
        (!(target instanceof HTMLElement) || target.id !== COMPOSER_INPUT_ID)
      ) {
        return;
      }
      e.preventDefault();
      const input = document.getElementById(COMPOSER_INPUT_ID);
      if (!(input instanceof HTMLInputElement)) return;
      input.focus({ preventScroll: true });
      input.select();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [blocked]);
}
