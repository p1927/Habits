import { Card } from './ui/Card';
import { useHomeSavedRecipeCard, type UseHomeSavedRecipeCardOptions } from '../hooks/useHomeSavedRecipeCard';

export interface HomeSavedRecipeCardProps extends UseHomeSavedRecipeCardOptions {
  onOpenLogRecipes?: () => void;
}

export function HomeSavedRecipeCard(props: HomeSavedRecipeCardProps) {
  const { serverOnline, onOpenLogRecipes } = props;
  const {
    recipe,
    sheetsConnected,
    loading,
    logging,
    success,
    loadRecipe,
    logItem,
    logEntireRecipe,
  } = useHomeSavedRecipeCard(props);

  if (!serverOnline) return null;

  return (
    <Card className="home-saved-recipe-card home-export-card--health">
      <div className="home-export-row">
        <div>
          <p className="section-eyebrow">Recipes</p>
          <h2>Saved recipe</h2>
          <p className="muted">From Save Recipe tab · log without opening Log</p>
        </div>
        <button
          type="button"
          className="btn-pill btn-pill-outline"
          disabled={loading || logging}
          aria-label="Refresh saved recipe from sheet"
          onClick={() => void loadRecipe()}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>
      {success && <p className="banner banner-ok banner-revolut home-recipe-msg">{success}</p>}
      {sheetsConnected === false ? (
        <p className="muted">Google Sheets not connected — link in Settings.</p>
      ) : !recipe ? (
        <p className="muted">No saved recipe found in Save Recipe tab.</p>
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
                  disabled={logging}
                  aria-label={`Log ${item.food}`}
                  onClick={() => void logItem(item.food, item.quantity_g)}
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
              disabled={logging}
              onClick={() => void logEntireRecipe()}
            >
              {logging ? 'Logging…' : 'Log entire recipe today'}
            </button>
            {onOpenLogRecipes && (
              <button
                type="button"
                className="btn-pill btn-pill-outline"
                disabled={logging}
                aria-label="Open full saved recipe in Log Recipes tab"
                onClick={onOpenLogRecipes}
              >
                See full recipe
              </button>
            )}
          </div>
          {onOpenLogRecipes && (
            <p className="home-trend-card-hint muted">Opens Log → Recipes with sheet data loaded</p>
          )}
        </>
      )}
    </Card>
  );
}
