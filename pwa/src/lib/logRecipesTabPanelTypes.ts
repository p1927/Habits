import type { FoodScanResult } from './api';
import type { SavedRecipe } from './recipeScanTypes';
import type { SwipeDirection } from '../components/ui/SwipeStack';

export type { SavedRecipe } from './recipeScanTypes';

export interface LogRecipesTabPanelProps {
  serverOnline: boolean;
  loading: boolean;
  recipeLoading: boolean;
  recipeScanning: boolean;
  recipePhoto: string | null;
  recipeScanResult: FoodScanResult | null;
  recipe: SavedRecipe | null;
  recipeSheetsConnected: boolean | null;
  onRecipePhotoCapture: (url: string) => void;
  onRecipeScanSwipe: (dir: SwipeDirection) => void;
  onRecipeEditOpen: () => void;
  onRefreshRecipe: () => void;
  onLogRecipeItem: (food: string, quantityG: number) => void;
  onLogEntireRecipe: () => void;
}

export interface LogRecipesScanCardProps {
  loading: boolean;
  recipeScanning: boolean;
  recipePhoto: string | null;
  recipeName: string | undefined;
  recipeScanResult: FoodScanResult | null;
  onRecipePhotoCapture: (url: string) => void;
  onRecipeScanSwipe: (dir: SwipeDirection) => void;
  onRecipeEditOpen: () => void;
}

export interface LogRecipesSavedCardProps {
  serverOnline: boolean;
  loading: boolean;
  recipeLoading: boolean;
  recipe: SavedRecipe | null;
  recipeSheetsConnected: boolean | null;
  onRefreshRecipe: () => void;
  onLogRecipeItem: (food: string, quantityG: number) => void;
  onLogEntireRecipe: () => void;
}
