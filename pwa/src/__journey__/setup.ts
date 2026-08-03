/**
 * Shared test setup for journey tests (and any other test that needs jsdom
 * parity). Loaded by vitest.config.ts → test.setupFiles.
 *
 * Polyfills we always need:
 *   - window.matchMedia: the project relies on it for prefers-reduced-motion
 *     detection (usePrefersReducedMotion, useDayScheduleGrid). jsdom
 *     does not implement it by default.
 */
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  // Lightweight matchMedia polyfill. Tests can override the default
  // result per case via (window.matchMedia as any).__setReduced.
  let forcedReduced: boolean | null = null;
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => {
      const isReduced = query.includes('reduce');
      const matches =
        forcedReduced === null ? false : forcedReduced === isReduced;
      const listeners: Array<(e: MediaQueryListEvent) => void> = [];
      const mql: MediaQueryList = {
        matches,
        media: query,
        onchange: null,
        addEventListener: (_t: string, l: (e: MediaQueryListEvent) => void) =>
          listeners.push(l),
        removeEventListener: (_t: string, l: (e: MediaQueryListEvent) => void) =>
          listeners.splice(listeners.indexOf(l), 1),
        addListener: (l: (e: MediaQueryListEvent) => void) => listeners.push(l),
        removeListener: (l: (e: MediaQueryListEvent) => void) =>
          listeners.splice(listeners.indexOf(l), 1),
        dispatchEvent: () => true,
      } as MediaQueryList;
      return mql;
    },
  });
  // Test helper (cast so TS ignores): window.matchMedia.__setReduced(true)
  (window.matchMedia as unknown as { __setReduced: (v: boolean | null) => void }).__setReduced = (
    v: boolean | null,
  ) => {
    forcedReduced = v;
  };
}
