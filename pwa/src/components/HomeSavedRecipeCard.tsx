import { useCallback, useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { api, ApiError } from '../lib/api';
import type { SavedRecipe } from './LogRecipesTabPanel';

export interface HomeSavedRecipeCardProps {
  serverOnline: boolean;
  onFoodUpdated?: (summary: import('../lib/api').FoodTodayResponse) => void;
  onError?: (message: string) => void;
  onLogItem?: (food: string, quantityG: number) => void | Promise<void>;
  onLogEntireRecipe?: () => void | Promise<void>;
  logging?: boolean;
}

export function HomeSavedRecipeCard({
  serverOnline,
  onFoodUpdated,
  onError,
  onLogItem: onLogItemProp,
  onLogEntireRecipe: onLogEntireRecipeProp,
  logging: loggingProp,
}: HomeSavedRecipeCardProps) {
  const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
  const [sheetsConnected, setSheetsConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggingLocal, setLoggingLocal] = useState(false);
  const logging = loggingProp ?? loggingLocal;
  const [success, setSuccess] = useState('');

  const loadRecipe = useCallback(async () => {
    if (!serverOnline) return;
    setLoading(true);
    try {
      const res = await api.getSavedRecipe();
      setRecipe(res.recipe);
      setSheetsConnected(res.sheets_connected);
    } catch (e) {
      setRecipe(null);
      setSheetsConnected(null);
      if (e instanceof ApiError && e.status === 401) return;
      onError?.(e instanceof Error ? e.message : 'Failed to load saved recipe');
    } finally {
      setLoading(false);
    }
  }, [serverOnline, onError]);

  useEffect(() => {
    void loadRecipe();
  }, [loadRecipe]);

  const logItem = async (food: string, quantityG: number) => {
    if (!serverOnline || logging) return;
    if (onLogItemProp) {
      await onLogItemProp(food, quantityG);
      return;
    }
    setLoggingLocal(true);
    try {
      const res = await api.logFood(`${quantityG}g ${food}`);
      onFoodUpdated?.(res.summary);
      setSuccess(res.message);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : 'Recipe item log failed');
    } finally {
      setLoggingLocal(false);
    }
  };

  const logEntireRecipe = async () => {
    if (!serverOnline || logging) return;
    if (onLogEntireRecipeProp) {
      await onLogEntireRecipeProp();
      return;
    }
    setLoggingLocal(true);
    try {
      const res = await api.logSavedRecipe();
      onFoodUpdated?.(res.summary);
      setSuccess(res.message);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : 'Recipe log failed');
    } finally {
      setLoggingLocal(false);
    }
  };

  if (!serverOnline) return null;

  return (
    <Card className="home-saved-recipe-card home-export-card--health">
      <div className="home-export-row">
        <div>
          <p className="section-eyebrow">Recipes</p>
          <h2>Saved recipe</h2>
          <p className="muted">From Save Reciepe tab · log without opening Log</p>
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
        <p className="muted">No saved recipe found in Save Reciepe tab.</p>
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
          </div>
        </>
      )}
    </Card>
  );
}
