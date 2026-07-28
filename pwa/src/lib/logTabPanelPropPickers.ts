import type { LogMealPlanTabShell } from '../components/LogMealPlanTabShell';
import type { LogRecipesTabPanelProps } from '../components/LogRecipesTabPanel';
import type { LogScanTabPanelProps } from '../components/LogScanTabPanel';
import type { LogTypeTabPanelProps } from '../components/LogTypeTabPanel';
import type { LogTabPanelsProps } from './logTabPanelsProps';
import type { ComponentProps } from 'react';

type LogMealPlanTabShellProps = ComponentProps<typeof LogMealPlanTabShell>;

export function pickLogScanTabPanelProps(p: LogTabPanelsProps): LogScanTabPanelProps {
  return {
    serverOnline: p.serverOnline,
    loading: p.loading,
    scanPreviewUrl: p.scanPreviewUrl,
    scanResult: p.scanResult,
    scanHistory: p.scanHistory,
    editName: p.editName,
    editQty: p.editQty,
    onCapture: p.onCapture,
    onClearScan: p.onClearScan,
    onRestoreScan: p.onRestoreScan,
    onClearScanHistory: p.onClearScanHistory,
    onEditOpen: p.onEditOpen,
    onLogScan: p.onLogScan,
  };
}

export function pickLogTypeTabPanelProps(p: LogTabPanelsProps): LogTypeTabPanelProps {
  return {
    serverOnline: p.serverOnline,
    loading: p.loading,
    offProduct: p.offProduct,
    offQuantity: p.offQuantity,
    description: p.description,
    mealType: p.mealType,
    foodName: p.foodName,
    quantity: p.quantity,
    searchResults: p.searchResults,
    pending: p.pending,
    data: p.data,
    mealPlan: p.mealPlan,
    loggingMealKey: p.loggingMealKey,
    onLogMealPlanEntry: p.onLogMealPlanEntry,
    onBarcodeScan: p.onBarcodeScan,
    onOffQuantityChange: p.onOffQuantityChange,
    onLogOffProduct: p.onLogOffProduct,
    onVoiceLog: p.onVoiceLog,
    onDescriptionChange: p.onDescriptionChange,
    onMealTypeChange: p.onMealTypeChange,
    onManualLog: p.onManualLog,
    onFoodNameChange: p.onFoodNameChange,
    onSelectSearchResult: p.onSelectSearchResult,
    onQuantityChange: p.onQuantityChange,
    onRetryPending: p.onRetryPending,
    onDismissPending: p.onDismissPending,
    onDeleteItem: p.onDeleteItem,
    scrollToFoodQueue: p.scrollToFoodQueue,
  };
}

export function pickLogRecipesTabPanelProps(p: LogTabPanelsProps): LogRecipesTabPanelProps {
  return {
    serverOnline: p.serverOnline,
    loading: p.loading,
    recipeLoading: p.recipeLoading,
    recipeScanning: p.recipeScanning,
    recipePhoto: p.recipePhoto,
    recipeScanResult: p.recipeScanResult,
    recipe: p.recipe,
    recipeSheetsConnected: p.recipeSheetsConnected,
    onRecipePhotoCapture: p.onRecipePhotoCapture,
    onRecipeScanSwipe: p.onRecipeScanSwipe,
    onRecipeEditOpen: p.onRecipeEditOpen,
    onRefreshRecipe: p.onRefreshRecipe,
    onLogRecipeItem: p.onLogRecipeItem,
    onLogEntireRecipe: p.onLogEntireRecipe,
  };
}

export function pickLogMealPlanTabShellProps(p: LogTabPanelsProps): LogMealPlanTabShellProps {
  return {
    mealPlan: p.mealPlan,
    serverOnline: p.serverOnline,
    mealPlanQueue: p.mealPlanQueue,
    syncingMealPlanQueue: p.syncingMealPlanQueue,
    mealPlanSyncProgress: p.mealPlanSyncProgress,
    failedMealPlanIds: p.failedMealPlanIds,
    retryingMealPlanId: p.retryingMealPlanId,
    scrollToMealPlanQueue: p.scrollToMealPlanQueue,
    loggingMealKey: p.loggingMealKey,
    loggingMeals: p.loggingMeals,
    onSyncAll: p.onSyncAll,
    onRetryFailed: p.onRetryFailed,
    onRetry: p.onRetry,
    onDismissItem: p.onDismissItem,
    onClearAll: p.onClearAll,
    onLogEntry: p.onLogMealPlanEntry,
    onLogAll: p.onLogAll,
  };
}
