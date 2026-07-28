import { useCallback, useRef, useState } from 'react';
import { useLogSectionData } from './useLogSectionData';
import { useLogSectionFoodStack } from './useLogSectionFoodStack';
import { useLogStatusShellProps } from './useLogStatusShellProps';
import { useLogTabPanelsProps } from './useLogTabPanelsProps';
import { useLogTabShortcuts } from './useLogTabShortcuts';
import { useMealPlanShell } from './useMealPlanShell';
import { readStoredLogTab, storeLogTab, type LogTab } from '../lib/logSectionShared';

interface UseLogSectionOptions {
  serverOnline: boolean;
  openMealPlan?: boolean;
  onMealPlanOpened?: () => void;
  openLogHistory?: boolean;
  onLogHistoryOpened?: () => void;
  openLogRecipes?: boolean;
  onLogRecipesOpened?: () => void;
  scrollToMealPlanQueue?: number;
  scrollToFoodQueue?: number;
}

export function useLogSection({
  serverOnline,
  openMealPlan,
  onMealPlanOpened,
  openLogHistory,
  onLogHistoryOpened,
  openLogRecipes,
  onLogRecipesOpened,
  scrollToMealPlanQueue,
  scrollToFoodQueue,
}: UseLogSectionOptions) {
  const [tab, setTabState] = useState<LogTab>(() => readStoredLogTab());
  const setTab = useCallback((next: LogTab) => {
    setTabState(next);
    storeLogTab(next);
  }, []);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const onTabRecipesRef = useRef<() => void>(() => {});
  const onTabRecipes = useCallback(() => {
    onTabRecipesRef.current();
  }, []);

  const sectionData = useLogSectionData({
    serverOnline,
    tab,
    setTab,
    openMealPlan,
    onMealPlanOpened,
    openLogHistory,
    onLogHistoryOpened,
    openLogRecipes,
    onLogRecipesOpened,
    scrollToMealPlanQueue,
    scrollToFoodQueue,
    onTabRecipes,
  });

  const { showShortcutHint, dismissShortcutHint } = useLogTabShortcuts(setTab);

  const { foodLog, foodUndo, foodScan, recipeScan, typeTab } = useLogSectionFoodStack({
    serverOnline,
    tab,
    setTab,
    sectionData,
    setLoading,
    setError,
    setSuccess,
    onTabRecipesRef,
  });

  const mealPlanShell = useMealPlanShell({
    serverOnline,
    syncSource: 'log',
    setMessage: setSuccess,
    setError,
    active: tab === 'mealplan' || tab === 'type',
    watchQueueChanges: true,
    food: sectionData.data,
    onFoodUpdated: sectionData.setData,
  });

  const dismissFoodLogQueue = useCallback(() => {
    if (!window.confirm(`Discard ${foodLog.queuedCount} queued food log${foodLog.queuedCount === 1 ? '' : 's'}? They will not sync.`)) return;
    foodLog.dismissAllQueued();
    setSuccess('Offline food log queue cleared');
  }, [foodLog, setSuccess]);

  const tabPanels = useLogTabPanelsProps({
    loading,
    scrollToMealPlanQueue,
    scrollToFoodQueue,
    foodScan,
    recipeScan,
    typeTab,
    mealPlanShell,
    sectionData,
    foodLog,
    offerUndo: foodUndo.offerUndo,
  });

  const statusShell = useLogStatusShellProps({
    success,
    error,
    setSuccess,
    foodScan,
    recipeScan,
    mealPlanShell,
    foodUndo,
  });

  return {
    tab,
    setTab,
    showShortcutHint,
    dismissShortcutHint,
    queuedCount: foodLog.queuedCount,
    failedCount: foodLog.failedCount,
    queueSyncClearedToken: foodLog.queueSyncClearedToken,
    dismissFoodLogQueue,
    retryAllFailed: foodLog.retryAllFailed,
    recipeScanQueue: recipeScan.recipeScanQueue,
    recipeScanQueueSyncClearedToken: recipeScan.recipeScanQueueSyncClearedToken,
    dismissRecipeScanQueue: recipeScan.dismissRecipeScanQueue,
    tabPanels,
    statusShell,
  };
}

export type UseLogSectionResult = ReturnType<typeof useLogSection>;
