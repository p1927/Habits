import { useRef, type MutableRefObject } from 'react';
import { useLogFoodScan } from './useLogFoodScan';
import { useLogFoodUndo, type FoodLogUndoEntry } from './useLogFoodUndo';
import { useLogFoodUndoRestore } from './useLogFoodUndoRestore';
import { useLogRecipeScan } from './useLogRecipeScan';
import { useLogTypeTab } from './useLogTypeTab';
import { useOptimisticFoodLog } from './useOptimisticFoodLog';
import type { useLogSectionData } from './useLogSectionData';
import type { LogTab } from '../lib/logSectionShared';

type SectionData = ReturnType<typeof useLogSectionData>;

interface UseLogSectionFoodStackOptions {
  serverOnline: boolean;
  tab: LogTab;
  setTab: (tab: LogTab) => void;
  sectionData: SectionData;
  setLoading: (loading: boolean) => void;
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
  onTabRecipesRef: MutableRefObject<() => void>;
}

export function useLogSectionFoodStack({
  serverOnline,
  tab,
  setTab,
  sectionData,
  setLoading,
  setError,
  setSuccess,
  onTabRecipesRef,
}: UseLogSectionFoodStackOptions) {
  const foodUndoRestoreRef = useRef<(entry: FoodLogUndoEntry) => void>(() => {});

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

  const foodScan = useLogFoodScan({
    logItem: foodLog.logItem,
    offerUndo: foodUndo.offerUndo,
    setLoading,
    setError,
  });

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

  return { foodLog, foodUndo, foodScan, recipeScan, typeTab };
}

export type LogSectionFoodStack = ReturnType<typeof useLogSectionFoodStack>;
