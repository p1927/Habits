import { useCallback, useState } from 'react';
import type { TabId } from '../lib/config';

export function useMealPlanQueueScroll(
  navigate: (tab: TabId) => void,
  options?: { onBeforeLogScroll?: () => void },
) {
  const [scrollToken, setScrollToken] = useState(0);

  const scrollToMealPlanQueue = useCallback(
    (target: TabId, opts?: { openLogPlan?: boolean }) => {
      if (opts?.openLogPlan) options?.onBeforeLogScroll?.();
      navigate(target);
      setScrollToken((token) => token + 1);
    },
    [navigate, options?.onBeforeLogScroll],
  );

  return { scrollToken, scrollToMealPlanQueue };
}
