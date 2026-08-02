import type {
  RecipeScan,
  FoodLog,
  OfferUndoFn,
  RecipeScanSwipeHandler,
} from './logTabPanelsPropsBuilder';
import type { FoodTodayResponse } from '../lib/api';

export interface BuildRecipeScanPropsInput {
  recipeScan: RecipeScan;
  foodLog: FoodLog;
  offerUndo: OfferUndoFn;
  onRecipeScanSwipe: RecipeScanSwipeHandler;
}

export function buildRecipeScanProps({
  recipeScan,
  foodLog,
  offerUndo,
  onRecipeScanSwipe,
}: BuildRecipeScanPropsInput) {
  const { logItem } = foodLog;
  return {
    recipeLoading: recipeScan.recipeLoading,
    recipeScanning: recipeScan.recipeScanning,
    recipePhoto: recipeScan.recipePhoto,
    recipeScanResult: recipeScan.recipeScanResult,
    recipe: recipeScan.recipe,
    recipeSheetsConnected: recipeScan.recipeSheetsConnected,
    recipeEditName: recipeScan.recipeEditName,
    recipeEditQty: recipeScan.recipeEditQty,
    onRecipePhotoCapture: (url: string) => void recipeScan.handleRecipePhoto(url),
    onRecipeScanSwipe,
    onRecipeEditOpen: () => recipeScan.setRecipeEditOpen(true),
    onRefreshRecipe: () => void recipeScan.loadSavedRecipe(),
    onLogRecipeItem: (food: string, quantityG: number) =>
      void logItem(food, quantityG, (summary: FoodTodayResponse) => {
        offerUndo(summary, food, quantityG);
      }),
    onLogEntireRecipe: () => void recipeScan.logEntireSavedRecipe(),
  };
}
