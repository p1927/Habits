import type { FoodTodayResponse } from '../lib/api';
import type { LogTabPanelsProps } from './logTabPanelsProps';
import type { LogFoodUndoRestore } from '../hooks/useLogFoodScan';
import type { useLogFoodScan } from '../hooks/useLogFoodScan';
import type { useLogRecipeScan } from '../hooks/useLogRecipeScan';
import type { useLogTypeTab } from '../hooks/useLogTypeTab';
import type { useMealPlanShell } from '../hooks/useMealPlanShell';
import type { useLogSectionData } from '../hooks/useLogSectionData';
import type { useOptimisticFoodLog } from '../hooks/useOptimisticFoodLog';
import type { SwipeDirection } from '../components/ui/SwipeStack';

export type FoodScan = ReturnType<typeof useLogFoodScan>;
export type RecipeScan = ReturnType<typeof useLogRecipeScan>;
export type TypeTab = ReturnType<typeof useLogTypeTab>;
export type MealPlan = ReturnType<typeof useMealPlanShell>;
export type SectionData = ReturnType<typeof useLogSectionData>;
export type FoodLog = Pick<
  ReturnType<typeof useOptimisticFoodLog>,
  'pending' | 'logItem' | 'retry' | 'dismiss'
>;

export type OfferUndoFn = (
  summary: FoodTodayResponse,
  food: string,
  qty: number,
  restore?: LogFoodUndoRestore,
) => void;

export type RecipeScanSwipeHandler = (dir: SwipeDirection) => void;

export interface BuildLogTabPanelsPropsInput {
  loading: boolean;
  scrollToMealPlanQueue?: number;
  scrollToFoodQueue?: number;
  foodScan: FoodScan;
  recipeScan: RecipeScan;
  typeTab: TypeTab;
  mealPlanShell: MealPlan;
  sectionData: SectionData;
  foodLog: FoodLog;
  offerUndo: OfferUndoFn;
}

export interface AssembledLogTabPanelsPropsInput extends BuildLogTabPanelsPropsInput {
  onRecipeScanSwipe: RecipeScanSwipeHandler;
}

export function buildLogTabPanelsProps({
  loading,
  scrollToMealPlanQueue,
  scrollToFoodQueue,
  foodScan,
  recipeScan,
  typeTab,
  mealPlanShell,
  sectionData,
  foodLog,
  offerUndo,
  onRecipeScanSwipe,
}: AssembledLogTabPanelsPropsInput): Omit<LogTabPanelsProps, 'tab' | 'serverOnline'> {
  const { pending, logItem, retry, dismiss } = foodLog;
  const { data, mealPlan, history } = sectionData;

  return {
    loading,
    scrollToMealPlanQueue,
    scrollToFoodQueue,
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
  };
}
