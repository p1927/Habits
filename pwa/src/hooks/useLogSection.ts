import { useCallback, useRef, useState } from 'react';
import { useLogFoodScan } from './useLogFoodScan';
import { useLogFoodUndo, type FoodLogUndoEntry } from './useLogFoodUndo';
import { useLogFoodUndoRestore } from './useLogFoodUndoRestore';
import { useLogRecipeScan } from './useLogRecipeScan';
import { useLogSectionData } from './useLogSectionData';
import { useLogStatusShellProps } from './useLogStatusShellProps';
import { useLogTabPanelsProps } from './useLogTabPanelsProps';
import { useLogTabShortcuts } from './useLogTabShortcuts';
import { useLogTypeTab } from './useLogTypeTab';
import { useMealPlanShell } from './useMealPlanShell';
import { useOptimisticFoodLog } from './useOptimisticFoodLog';
import { type LogTab } from '../lib/logSectionShared';

interface UseLogSectionOptions {
  serverOnline: boolean;
  openMealPlan?: boolean;
  onMealPlanOpened?: () => void;
  scrollToMealPlanQueue?: number;
}

export function useLogSection({
  serverOnline,
  openMealPlan,
  onMealPlanOpened,
  scrollToMealPlanQueue,
}: UseLogSectionOptions) {
  const [tab, setTab] = useState<LogTab>('scan');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const foodUndoRestoreRef = useRef<(entry: FoodLogUndoEntry) => void>(() => {});
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
    scrollToMealPlanQueue,
    onTabRecipes,
  });

  const { showShortcutHint, dismissShortcutHint } = useLogTabShortcuts(setTab);

  const foodLog = useOptimisticFoodLog({
    serverOnline,
    setData: sectionData.setData,
    setSuccess,
    setError,
  });

  const foodUndo = useLogFoodUndo({
    serverOnline,
    setData: sectionData.setData,
    onPendingUndo: () => setSuccess(''),
    setSuccess,
    setError,
    restoreRef: foodUndoRestoreRef,
  });

  const foodScan = useLogFoodScan({ logItem: foodLog.logItem, offerUndo: foodUndo.offerUndo, setLoading, setError });

  const recipeScan = useLogRecipeScan({
    serverOnline,
    tab,
    setData: sectionData.setData,
    setLoading,
    logItem: foodLog.logItem,
    offerUndo: foodUndo.offerUndo,
    setError,
    setSuccess,
  });

  onTabRecipesRef.current = () => void recipeScan.loadSavedRecipe();

  const typeTab = useLogTypeTab({
    serverOnline,
    logItem: foodLog.logItem,
    logMeal: foodLog.logMeal,
    logMacros: foodLog.logMacros,
    offerUndo: foodUndo.offerUndo,
    setData: sectionData.setData,
    setLoading,
    setError,
    setSuccess,
    onSwitchToTypeTab: () => setTab('type'),
  });

  useLogFoodUndoRestore({
    restoreRef: foodUndoRestoreRef,
    setScanResult: foodScan.setScanResult,
    setEditName: foodScan.setEditName,
    setEditQty: foodScan.setEditQty,
    setRecipeScanResult: recipeScan.setRecipeScanResult,
    setRecipeEditName: recipeScan.setRecipeEditName,
    setRecipeEditQty: recipeScan.setRecipeEditQty,
    setOffProduct: typeTab.setOffProduct,
    setOffQuantity: typeTab.setOffQuantity,
    setFoodName: typeTab.setFoodName,
    setTab,
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
