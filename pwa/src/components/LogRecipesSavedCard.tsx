import type { LogRecipesSavedCardProps } from '../lib/logRecipesTabPanelTypes';

export function LogRecipesSavedCard({
  serverOnline,
  loading,
  recipeLoading,
  recipe,
  recipeSheetsConnected,
  onRefreshRecipe,
  onLogRecipeItem,
  onLogEntireRecipe,
}: LogRecipesSavedCardProps) {
  return (
    <article className="recipes-card recipes-saved-card">
      <div className="recipes-saved-header">
        <div>
          <p className="section-eyebrow">Sheet</p>
          <h2>Saved recipe</h2>
          <p className="muted settings-card-note">From Save Recipe tab in Nutrition sheet</p>
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
        <p className="muted settings-card-note">Connect to server to browse Save Recipe sheet.</p>
      ) : recipeSheetsConnected === false ? (
        <p className="muted settings-card-note">Google Sheets not connected — link in Settings.</p>
      ) : !recipe ? (
        <p className="muted settings-card-note">No saved recipe found in Save Recipe tab.</p>
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
  );
}
