import { useCallback, useMemo } from 'react';
import type { LogTabPanelsProps } from '../components/LogTabPanels';
import type { SwipeDirection } from '../components/ui/SwipeStack';
import type { useLogFoodScan } from './useLogFoodScan';
import type { useLogRecipeScan } from './useLogRecipeScan';
import type { useLogTypeTab } from './useLogTypeTab';
import type { useMealPlanShell } from './useMealPlanShell';
import type { useLogSectionData } from './useLogSectionData';
import type { FoodTodayResponse } from '../lib/api';
import type { LogFoodUndoRestore } from './useLogFoodScan';

import type { useOptimisticFoodLog } from './useOptimisticFoodLog';

type FoodScan = ReturnType<typeof useLogFoodScan>;
type RecipeScan = ReturnType<typeof useLogRecipeScan>;
type TypeTab = ReturnType<typeof useLogTypeTab>;
type MealPlan = ReturnType<typeof useMealPlanShell>;
type SectionData = ReturnType<typeof useLogSectionData>;
type FoodLog = Pick<
  ReturnType<typeof useOptimisticFoodLog>,
  'pending' | 'logItem' | 'retry' | 'dismiss'
>;

type OfferUndoFn = (
  summary: FoodTodayResponse,
  food: string,
  qty: number,
  restore?: LogFoodUndoRestore,
) => void;

interface UseLogTabPanelsPropsOptions {
  loading: boolean;
  scrollToMealPlanQueue?: number;
  foodScan: FoodScan;
  recipeScan: RecipeScan;
  typeTab: TypeTab;
  mealPlanShell: MealPlan;
  sectionData: SectionData;
  foodLog: FoodLog;
  offerUndo: OfferUndoFn;
}

export function useLogTabPanelsProps({
  loading,
  scrollToMealPlanQueue,
  foodScan,
  recipeScan,
  typeTab,
  mealPlanShell,
  sectionData,
  foodLog,
  offerUndo,
}: UseLogTabPanelsPropsOptions) {
  const { pending, logItem, retry, dismiss } = foodLog;
  const { data, mealPlan, history } = sectionData;

  const onRecipeScanSwipe = useCallback(
    (dir: SwipeDirection) => {
      if (dir === 'right') {
        void recipeScan.logRecipeScan(
          recipeScan.recipeEditName,
          Number.parseFloat(recipeScan.recipeEditQty) || recipeScan.recipeScanResult!.suggested_grams,
        );
      } else if (dir === 'up' || dir === 'left') {
        recipeScan.setRecipeScanResult(null);
        recipeScan.syncRecipeScanQueue();
        void recipeScan.processRecipeScanQueue();
      }
    },
    [recipeScan],
  );

  return useMemo<Omit<LogTabPanelsProps, 'tab' | 'serverOnline'>>(
    () => ({
      loading,
      scrollToMealPlanQueue,
      scanPreviewUrl: foodScan.scanPreviewUrl,
      scanResult: foodScan.scanResult,
      scanHistory: foodScan.scanHistory,
      editName: foodScan.editName,
      editQty: foodScan.editQty,
      onCapture: (url) => void foodScan.handleCapture(url),
      onClearScan: foodScan.clearScanFlow,
      onRestoreScan: foodScan.restoreScanFromHistory,
      onClearScanHistory: foodScan.handleClearScanHistory,
      onEditOpen: () => foodScan.setEditOpen(true),
      onLogScan: (name, qty) => void foodScan.logScan(name, qty),
      offProduct: typeTab.offProduct,
      offQuantity: typeTab.offQuantity,
      description: typeTab.description,
      mealType: typeTab.mealType,
      foodName: typeTab.foodName,
      quantity: typeTab.quantity,
      searchResults: typeTab.searchResults,
      pending,
      data,
      mealPlan,
      loggingMealKey: mealPlanShell.loggingMealKey,
      loggingMeals: mealPlanShell.loggingMeals,
      onLogMealPlanEntry: mealPlanShell.logMealPlanEntry,
      onBarcodeScan: (code) => void typeTab.handleBarcode(code),
      onOffQuantityChange: typeTab.setOffQuantity,
      onLogOffProduct: () => void typeTab.handleLogOffProduct(),
      onVoiceLog: typeTab.handleVoiceLog,
      onDescriptionChange: typeTab.setDescription,
      onMealTypeChange: typeTab.setMealType,
      onManualLog: typeTab.handleManualLog,
      onFoodNameChange: typeTab.setFoodName,
      onSelectSearchResult: typeTab.selectSearchResult,
      onQuantityChange: typeTab.setQuantity,
      onRetryPending: retry,
      onDismissPending: dismiss,
      onDeleteItem: (row) => void typeTab.handleDelete(row),
      recipeLoading: recipeScan.recipeLoading,
      recipeScanning: recipeScan.recipeScanning,
      recipePhoto: recipeScan.recipePhoto,
      recipeScanResult: recipeScan.recipeScanResult,
      recipe: recipeScan.recipe,
      recipeSheetsConnected: recipeScan.recipeSheetsConnected,
      recipeEditName: recipeScan.recipeEditName,
      recipeEditQty: recipeScan.recipeEditQty,
      onRecipePhotoCapture: (url) => void recipeScan.handleRecipePhoto(url),
      onRecipeScanSwipe,
      onRecipeEditOpen: () => recipeScan.setRecipeEditOpen(true),
      onRefreshRecipe: () => void recipeScan.loadSavedRecipe(),
      onLogRecipeItem: (food, quantityG) =>
        void logItem(food, quantityG, (summary) => {
          offerUndo(summary, food, quantityG);
        }),
      onLogEntireRecipe: () => void recipeScan.logEntireSavedRecipe(),
      mealPlanQueue: mealPlanShell.mealPlanQueue,
      syncingMealPlanQueue: mealPlanShell.syncingMealPlanQueue,
      mealPlanSyncProgress: mealPlanShell.mealPlanSyncProgress,
      failedMealPlanIds: mealPlanShell.failedMealPlanIds,
      retryingMealPlanId: mealPlanShell.retryingMealPlanId,
      onSyncAll: () => void mealPlanShell.flushMealPlanQueue(),
      onRetryFailed: () => void mealPlanShell.retryFailedMealPlanQueue(),
      onRetry: (item) => void mealPlanShell.retryMealPlanItem(item),
      onDismissItem: mealPlanShell.dismissMealPlanItem,
      onClearAll: mealPlanShell.clearMealPlanQueue,
      onLogAll: mealPlanShell.logAllMealPlan,
      historyDays: history?.days ?? [],
    }),
    [
      loading,
      scrollToMealPlanQueue,
      foodScan,
      typeTab,
      pending,
      data,
      mealPlan,
      mealPlanShell,
      retry,
      dismiss,
      recipeScan,
      onRecipeScanSwipe,
      logItem,
      offerUndo,
      history?.days,
    ],
  );
}
