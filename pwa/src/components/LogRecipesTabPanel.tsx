import { CameraCapture } from './CameraCapture';
import { SwipeFoodCard } from './SwipeFoodCard';
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
    <div className="recipes-tab">
      <article className="recipes-card recipes-scan-card">
        <p className="section-eyebrow">Scan</p>
        <h2>Recipe photo</h2>
        <p className="muted settings-card-note">
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
      </article>

      {recipeScanResult && (
        <SwipeFoodCard
          scan={recipeScanResult}
          imageUrl={recipePhoto}
          onAction={onRecipeScanSwipe}
          onEdit={onRecipeEditOpen}
        />
      )}

      <article className="recipes-card recipes-saved-card">
        <div className="recipes-saved-header">
          <div>
            <p className="section-eyebrow">Sheet</p>
            <h2>Saved recipe</h2>
            <p className="muted settings-card-note">From Save Reciepe tab in Nutrition sheet</p>
          </div>
          <button
            type="button"
            className="btn-pill btn-pill-outline"
            disabled={!serverOnline || recipeLoading}
            aria-label="Refresh saved recipe from sheet"
            onClick={onRefreshRecipe}
          >
            {recipeLoading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        {!serverOnline ? (
          <p className="muted settings-card-note">Connect to server to browse Save Reciepe sheet.</p>
        ) : recipeSheetsConnected === false ? (
          <p className="muted settings-card-note">Google Sheets not connected — link in Settings.</p>
        ) : !recipe ? (
          <p className="muted settings-card-note">No saved recipe found in Save Reciepe tab.</p>
        ) : (
          <>
            <h3 className="recipes-saved-name">{recipe.name}</h3>
            <ul className="recipes-item-list">
              {recipe.items.map((item) => (
                <li key={item.food} className="settings-row settings-row--input recipes-item-row">
                  <div className="recipes-item-copy">
                    <strong>{item.food}</strong>
                    <span className="muted">
                      {item.quantity_g}g · {item.protein.toFixed(1)}g protein · {item.calories.toFixed(0)} kcal
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-pill"
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
              <p className="recipes-totals muted">
                Total: {recipe.totals.calories.toFixed(0)} kcal · {recipe.totals.protein.toFixed(1)}g protein
              </p>
            )}
            <div className="settings-actions">
              <button
                type="button"
                className="btn-pill"
                disabled={!serverOnline || loading}
                onClick={onLogEntireRecipe}
              >
                Log entire recipe today
              </button>
            </div>
          </>
        )}
      </article>
    </div>
  );
}
