import { useEffect, useState } from 'react';
import { preloadAppTabChunk } from '../lib/appTabPreload';
import { bindNotificationNavigation } from '../lib/notificationNavigation';
import { mealPlanQueueSourceLabel } from '../lib/mealPlanQueue';
import { useMealPlanQueueRemoteSync } from '../lib/mealPlanQueueRemoteSyncStore';
import { useAppShellNavigation } from './useAppShellNavigation';
import { useMealNotifications } from './useMealNotifications';
import { useMealPlanQueueCount } from './useMealPlanQueueCount';
import { useServerStatus } from './useServerStatus';

export function useAppShell() {
  const [oauthSuccess, setOauthSuccess] = useState(false);
  const [openLogMealPlan, setOpenLogMealPlan] = useState(false);
  const [openLogHistory, setOpenLogHistory] = useState(false);
  const [openLogRecipes, setOpenLogRecipes] = useState(false);
  const [agentPrompt, setAgentPrompt] = useState<{ token: number; text: string } | null>(null);

  const {
    tab,
    setTab,
    handleTabChange,
    mealPlanQueueScrollToken,
    scrollToMealPlanQueue,
    navigateMealPlanSyncSource,
    navigateLogHistory,
    navigateLogRecipes,
    navigateAgentPrompt,
    navigateFutureSelf,
  } = useAppShellNavigation({
    setOpenLogMealPlan,
    setOpenLogHistory,
    setOpenLogRecipes,
    setAgentPrompt,
  });

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
  }, [refresh, setTab]);

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
    navigateFutureSelf,
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
