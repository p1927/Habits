import { useCallback, useState } from 'react';
import { preloadAppTabChunk } from '../lib/appTabPreload';

export function useFoodQueueScroll(navigateLog: () => void) {
  const [focusToken, setFocusToken] = useState(0);

  const navigateFoodQueuePending = useCallback(() => {
    preloadAppTabChunk('log');
    navigateLog();
    setFocusToken((token) => token + 1);
  }, [navigateLog]);

  return { foodQueueFocusToken: focusToken, navigateFoodQueuePending };
}
