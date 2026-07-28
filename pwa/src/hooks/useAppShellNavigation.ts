import { useCallback, useState } from 'react';
import type { TabId } from '../lib/config';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';
import { parseInitialAppTab } from '../lib/appShellShared';
import { preloadAppTabChunk } from '../lib/appTabPreload';
import { useFoodQueueScroll } from './useFoodQueueScroll';
import { useMealPlanQueueScroll } from './useMealPlanQueueScroll';

interface UseAppShellNavigationOptions {
  setOpenLogMealPlan: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenLogHistory: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenLogType: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenLogRecipes: React.Dispatch<React.SetStateAction<boolean>>;
  setAgentPrompt: React.Dispatch<React.SetStateAction<{ token: number; text: string } | null>>;
}

export function useAppShellNavigation({
  setOpenLogMealPlan,
  setOpenLogHistory,
  setOpenLogType,
  setOpenLogRecipes,
  setAgentPrompt,
}: UseAppShellNavigationOptions) {
  const [tab, setTab] = useState<TabId>(parseInitialAppTab);

  const handleTabChange = useCallback((id: TabId) => {
    setTab(id);
    window.location.hash = id;
  }, []);

  const onBeforeLogScroll = useCallback(() => {
    setOpenLogMealPlan(true);
  }, [setOpenLogMealPlan]);

  const { scrollToken: mealPlanQueueScrollToken, scrollToMealPlanQueue } = useMealPlanQueueScroll(
    handleTabChange,
    { onBeforeLogScroll },
  );

  const navigateLogTab = useCallback(() => {
    handleTabChange('log');
  }, [handleTabChange]);

  const { foodQueueFocusToken, navigateFoodQueuePending } = useFoodQueueScroll(navigateLogTab);

  const navigateMealPlanSyncSource = useCallback(
    (source: MealPlanSyncSource) => {
      scrollToMealPlanQueue(source, { openLogPlan: source === 'log' });
    },
    [scrollToMealPlanQueue],
  );

  const navigateLogHistory = useCallback(() => {
    preloadAppTabChunk('log');
    setOpenLogHistory(true);
    handleTabChange('log');
  }, [handleTabChange, setOpenLogHistory]);

  const navigateLogType = useCallback(() => {
    preloadAppTabChunk('log');
    setOpenLogType(true);
    handleTabChange('log');
  }, [handleTabChange, setOpenLogType]);

  const navigateLogRecipes = useCallback(() => {
    preloadAppTabChunk('log');
    setOpenLogRecipes(true);
    handleTabChange('log');
  }, [handleTabChange, setOpenLogRecipes]);

  const navigateAgentPrompt = useCallback(
    (prompt: string) => {
      preloadAppTabChunk('agent');
      setAgentPrompt((prev) => ({ token: (prev?.token ?? 0) + 1, text: prompt }));
      handleTabChange('agent');
    },
    [handleTabChange, setAgentPrompt],
  );

  const navigateFutureSelf = useCallback(() => {
    preloadAppTabChunk('futureself');
    handleTabChange('futureself');
  }, [handleTabChange]);

  return {
    tab,
    setTab,
    handleTabChange,
    mealPlanQueueScrollToken,
    scrollToMealPlanQueue,
    navigateMealPlanSyncSource,
    navigateLogHistory,
    navigateLogType,
    navigateLogRecipes,
    navigateAgentPrompt,
    navigateFutureSelf,
    foodQueueFocusToken,
    navigateFoodQueuePending,
  };
}
