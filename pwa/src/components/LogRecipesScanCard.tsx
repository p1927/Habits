import { CameraCapture } from './CameraCapture';
import { SwipeFoodCard } from './SwipeFoodCard';
import type { LogRecipesScanCardProps } from '../lib/logRecipesTabPanelTypes';

export function LogRecipesScanCard({
  loading,
  recipeScanning,
  recipePhoto,
  recipeName,
  recipeScanResult,
  onRecipePhotoCapture,
  onRecipeScanSwipe,
  onRecipeEditOpen,
}: LogRecipesScanCardProps) {
  return (
    <>
      <article className="recipes-card recipes-scan-card">
        <p className="section-eyebrow">Scan</p>
        <h2>Recipe photo</h2>
        <p className="muted settings-card-note">
          Photograph your prepared meal — AI identifies it for logging and saves to Home gallery
        </p>
        {recipePhoto && (
          <img
            src={recipePhoto}
            alt={recipeName ? `Photo of ${recipeName}` : 'Recipe photo'}
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
    </>
  );
}
