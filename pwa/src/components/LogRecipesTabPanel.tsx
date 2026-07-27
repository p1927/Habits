import { CameraCapture } from './CameraCapture';
import { SwipeFoodCard } from './SwipeFoodCard';
import { Card } from './ui/Card';
import type { FoodScanResult } from '../lib/api';
import type { SwipeDirection } from './ui/SwipeStack';

export type SavedRecipe = {
  name: string;
  items: { food: string; quantity_g: number; calories: number; protein: number }[];
  totals: { calories: number; protein: number } | null;
};

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
    <>
      <Card>
        <h2>Recipe photo</h2>
        <p className="muted">
          Photograph your prepared meal — AI identifies it for logging and saves to Home gallery
        </p>
        {recipePhoto && (
          <img
            src={recipePhoto}
            alt={recipe?.name ? `Photo of ${recipe.name}` : 'Recipe photo'}
            className="recipe-photo-preview"
          />
        )}
        {!recipeScanResult && (
          <CameraCapture
            facingMode="environment"
            placeholder="Photograph your prepared recipe"
            onCapture={onRecipePhotoCapture}
            disabled={loading || recipeScanning}
          />
        )}
        {recipeScanning && (
          <p className="muted" role="status" aria-live="polite">
            Identifying recipe…
          </p>
        )}
      </Card>

      {recipeScanResult && (
        <SwipeFoodCard scan={recipeScanResult} onAction={onRecipeScanSwipe} onEdit={onRecipeEditOpen} />
      )}

      <Card>
        <div className="home-export-row">
          <div>
            <h2>Saved recipe</h2>
            <p className="muted">From Save Reciepe tab in Nutrition sheet</p>
          </div>
          <button
            type="button"
            className="btn-small"
            disabled={!serverOnline || recipeLoading}
            aria-label="Refresh saved recipe from sheet"
            onClick={onRefreshRecipe}
          >
            {recipeLoading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        {!serverOnline ? (
          <p className="muted">Connect to server to browse Save Reciepe sheet.</p>
        ) : recipeSheetsConnected === false ? (
          <p className="muted">Google Sheets not connected — link in Settings.</p>
        ) : !recipe ? (
          <p className="muted">No saved recipe found in Save Reciepe tab.</p>
        ) : (
          <>
            <h3>{recipe.name}</h3>
            <ul className="food-list">
              {recipe.items.map((item) => (
                <li key={item.food} className="food-row">
                  <div>
                    <strong>{item.food}</strong>
                    <span className="muted">
                      {item.quantity_g}g · {item.protein.toFixed(1)}g protein · {item.calories.toFixed(0)} kcal
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-small"
                    disabled={!serverOnline || loading}
                    aria-label={`Log ${item.food}`}
                    onClick={() => onLogRecipeItem(item.food, item.quantity_g)}
                  >
                    Log
                  </button>
                </li>
              ))}
            </ul>
            {recipe.totals && (
              <p className="muted">
                Total: {recipe.totals.calories.toFixed(0)} kcal · {recipe.totals.protein.toFixed(1)}g protein
              </p>
            )}
            <button type="button" disabled={!serverOnline || loading} onClick={onLogEntireRecipe}>
              Log entire recipe today
            </button>
          </>
        )}
      </Card>
    </>
  );
}
