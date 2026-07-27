import { LogRecipesSavedCard } from './LogRecipesSavedCard';
import { LogRecipesScanCard } from './LogRecipesScanCard';
import type { LogRecipesTabPanelProps } from '../lib/logRecipesTabPanelTypes';

export type { SavedRecipe, LogRecipesTabPanelProps } from '../lib/logRecipesTabPanelTypes';

export function LogRecipesTabPanel({
  serverOnline,
  loading,
  recipeLoading,
  recipeScanning,
  recipePhoto,
  recipeScanResult,
  recipe,
  recipeSheetsConnected,
  onRecipePhotoCapture,
  onRecipeScanSwipe,
  onRecipeEditOpen,
  onRefreshRecipe,
  onLogRecipeItem,
  onLogEntireRecipe,
}: LogRecipesTabPanelProps) {
  return (
    <div className="recipes-tab">
      <LogRecipesScanCard
        loading={loading}
        recipeScanning={recipeScanning}
        recipePhoto={recipePhoto}
        recipeName={recipe?.name}
        recipeScanResult={recipeScanResult}
        onRecipePhotoCapture={onRecipePhotoCapture}
        onRecipeScanSwipe={onRecipeScanSwipe}
        onRecipeEditOpen={onRecipeEditOpen}
      />
      <LogRecipesSavedCard
        serverOnline={serverOnline}
        loading={loading}
        recipeLoading={recipeLoading}
        recipe={recipe}
        recipeSheetsConnected={recipeSheetsConnected}
        onRefreshRecipe={onRefreshRecipe}
        onLogRecipeItem={onLogRecipeItem}
        onLogEntireRecipe={onLogEntireRecipe}
      />
    </div>
  );
}
