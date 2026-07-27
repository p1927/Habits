import { api, ApiError } from './api';
import { dataUrlToFile } from './logSectionShared';
import type { SavedRecipe, SavedRecipeLoadResult } from './recipeScanTypes';

export async function fetchSavedRecipe(): Promise<SavedRecipeLoadResult> {
  const r = await api.getSavedRecipe();
  return { recipe: r.recipe, sheetsConnected: r.sheets_connected };
}

export function savedRecipeLoadError(e: unknown): string | null {
  if (e instanceof ApiError && e.status === 401) return null;
  return e instanceof Error ? e.message : 'Failed to load saved recipe';
}

export async function scanRecipeDataUrl(dataUrl: string) {
  return api.scanFood(dataUrlToFile(dataUrl, 'recipe.jpg'));
}

export async function loadSavedRecipeFlow(
  serverOnline: boolean,
  handlers: {
    setRecipeLoading: (loading: boolean) => void;
    setError: (msg: string) => void;
    setRecipe: (recipe: SavedRecipe | null) => void;
    setRecipeSheetsConnected: (connected: boolean | null) => void;
  },
): Promise<void> {
  if (!serverOnline) return;
  handlers.setRecipeLoading(true);
  handlers.setError('');
  try {
    const { recipe, sheetsConnected } = await fetchSavedRecipe();
    handlers.setRecipe(recipe);
    handlers.setRecipeSheetsConnected(sheetsConnected);
  } catch (e) {
    handlers.setRecipe(null);
    handlers.setRecipeSheetsConnected(null);
    const msg = savedRecipeLoadError(e);
    if (msg) handlers.setError(msg);
  } finally {
    handlers.setRecipeLoading(false);
  }
}

export async function logEntireSavedRecipeFlow(
  setData: (summary: import('./api').FoodTodayResponse) => void,
  setSuccess: (msg: string) => void,
): Promise<{ message: string }> {
  const res = await api.logSavedRecipe();
  setData(res.summary);
  setSuccess(res.message);
  return { message: res.message };
}
