import { useCallback, useEffect, useState } from 'react';
import type { TabId } from '../lib/config';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';
import { parseInitialAppTab } from '../lib/appShellShared';
import { preloadAppTabChunk } from '../lib/appTabPreload';
import { bindNotificationNavigation } from '../lib/notificationNavigation';
import { useMealNotifications } from './useMealNotifications';
import { useMealPlanQueueCount } from './useMealPlanQueueCount';
import { useMealPlanQueueScroll } from './useMealPlanQueueScroll';
import { useMealPlanQueueRemoteSync } from '../lib/mealPlanQueueRemoteSyncStore';
import { mealPlanQueueSourceLabel } from '../lib/mealPlanQueue';
import { useServerStatus } from './useServerStatus';

export function useAppShell() {
  const [tab, setTab] = useState<TabId>(parseInitialAppTab);
  const [oauthSuccess, setOauthSuccess] = useState(false);
  const [openLogMealPlan, setOpenLogMealPlan] = useState(false);
  const [openLogHistory, setOpenLogHistory] = useState(false);
  const [openLogRecipes, setOpenLogRecipes] = useState(false);
  const [agentPrompt, setAgentPrompt] = useState<{ token: number; text: string } | null>(null);
  const { status, googleConnected, refresh } = useServerStatus();
  const serverOnline = status === 'online' || status === 'online-unauthorized';
  useMealNotifications(serverOnline);
  const { count: mealPlanQueueCount, failedCount: mealPlanFailedCount, badgePulse: mealPlanBadgePulse } =
    useMealPlanQueueCount();
  const mealPlanRemoteSync = useMealPlanQueueRemoteSync('external');
  const mealPlanSyncSourceHint =
    mealPlanRemoteSync?.syncing
      ? ` — syncing on ${mealPlanQueueSourceLabel(mealPlanRemoteSync.source)}`
      : '';

  const handleTabChange = useCallback((id: TabId) => {
    setTab(id);
    window.location.hash = id;
  }, []);

  const { scrollToken: mealPlanQueueScrollToken, scrollToMealPlanQueue } = useMealPlanQueueScroll(
    handleTabChange,
    { onBeforeLogScroll: () => setOpenLogMealPlan(true) },
  );

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
  }, [handleTabChange]);

  const navigateLogRecipes = useCallback(() => {
    preloadAppTabChunk('log');
    setOpenLogRecipes(true);
    handleTabChange('log');
  }, [handleTabChange]);

  const navigateAgentPrompt = useCallback(
    (prompt: string) => {
      preloadAppTabChunk('agent');
      setAgentPrompt((prev) => ({ token: (prev?.token ?? 0) + 1, text: prompt }));
      handleTabChange('agent');
    },
    [handleTabChange],
  );

  useEffect(() => {
    return bindNotificationNavigation(handleTabChange);
  }, [handleTabChange]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google') === 'connected') {
      setTab('settings');
      setOauthSuccess(true);
      void refresh();
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash || '#settings'}`);
    }
  }, [refresh]);

  useEffect(() => {
    const id = window.requestIdleCallback?.(() => {
      preloadAppTabChunk('log');
      preloadAppTabChunk('day');
    }) ?? window.setTimeout(() => {
      preloadAppTabChunk('log');
      preloadAppTabChunk('day');
    }, 1200);
    return () => {
      if (typeof id === 'number' && window.cancelIdleCallback) {
        window.cancelIdleCallback(id);
      } else {
        window.clearTimeout(id);
      }
    };
  }, []);

  return {
    tab,
    status,
    serverOnline,
    googleConnected,
    oauthSuccess,
    setOauthSuccess,
    openLogMealPlan,
    setOpenLogMealPlan,
    openLogHistory,
    setOpenLogHistory,
    openLogRecipes,
    setOpenLogRecipes,
    mealPlanQueueScrollToken,
    scrollToMealPlanQueue,
    navigateMealPlanSyncSource,
    navigateLogHistory,
    navigateLogRecipes,
    navigateAgentPrompt,
    agentPrompt,
    handleTabChange,
    refresh,
    mealPlanQueueCount,
    mealPlanFailedCount,
    mealPlanBadgePulse,
    mealPlanSyncSourceHint,
    preloadTab: preloadAppTabChunk,
  };
}

export type AppShellState = ReturnType<typeof useAppShell>;
