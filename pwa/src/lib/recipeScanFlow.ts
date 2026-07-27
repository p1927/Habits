import { api, ApiError, type FoodScanResult, type FoodTodayResponse } from './api';
import { dataUrlToFile } from './logSectionShared';
import { isOfflineError } from './foodQueue';
import { addMealPhoto } from './mealPhotos';
import { enqueueRecipeScan } from './recipeScanQueue';

export type SavedRecipe = {
  name: string;
  items: { food: string; quantity_g: number; calories: number; protein: number }[];
  totals: { calories: number; protein: number } | null;
};

export type SavedRecipeLoadResult = {
  recipe: SavedRecipe | null;
  sheetsConnected: boolean | null;
};

export async function fetchSavedRecipe(): Promise<SavedRecipeLoadResult> {
  const r = await api.getSavedRecipe();
  return { recipe: r.recipe, sheetsConnected: r.sheets_connected };
}

export function savedRecipeLoadError(e: unknown): string | null {
  if (e instanceof ApiError && e.status === 401) return null;
  return e instanceof Error ? e.message : 'Failed to load saved recipe';
}

export async function scanRecipeDataUrl(dataUrl: string): Promise<FoodScanResult> {
  return api.scanFood(dataUrlToFile(dataUrl, 'recipe.jpg'));
}

export function recipeScanIdentifiedMessage(name: string, fromQueue = false): string {
  const label = name;
  return fromQueue
    ? `Identified ${label} from queued recipe photo — swipe to log`
    : `Identified ${label} — swipe to log or use saved recipe below`;
}

export function applyRecipeScanResult(
  result: FoodScanResult,
  dataUrl: string,
  handlers: {
    setRecipePhoto: (url: string) => void;
    setRecipeScanResult: (result: FoodScanResult | null) => void;
    setRecipeEditName: (name: string) => void;
    setRecipeEditQty: (qty: string) => void;
    setSuccess: (msg: string) => void;
  },
  fromQueue = false,
) {
  const name = result.matched_name ?? result.detected_name;
  handlers.setRecipePhoto(dataUrl);
  handlers.setRecipeScanResult(result);
  handlers.setRecipeEditName(name);
  handlers.setRecipeEditQty(String(result.suggested_grams));
  handlers.setSuccess(recipeScanIdentifiedMessage(name, fromQueue));
}

export async function captureRecipePhotoFlow(
  dataUrl: string,
  recipeName: string | undefined,
  ctx: {
    serverOnline: boolean;
    syncRecipeScanQueue: () => void;
    setRecipePhoto: (url: string | null) => void;
    setRecipeScanResult: (result: FoodScanResult | null) => void;
    setRecipeEditName: (name: string) => void;
    setRecipeEditQty: (qty: string) => void;
    setRecipeScanning: (scanning: boolean) => void;
    setError: (msg: string) => void;
    setSuccess: (msg: string) => void;
  },
): Promise<void> {
  const label = recipeName ?? 'Recipe';
  const photo = addMealPhoto(dataUrl, label);
  ctx.setRecipePhoto(dataUrl);
  ctx.setRecipeScanResult(null);
  ctx.setError('');

  if (!ctx.serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    enqueueRecipeScan(photo.id, label);
    ctx.syncRecipeScanQueue();
    ctx.setSuccess('Recipe photo saved — scan queued for when online');
    return;
  }

  ctx.setRecipeScanning(true);
  try {
    const result = await scanRecipeDataUrl(dataUrl);
    applyRecipeScanResult(result, dataUrl, ctx);
  } catch (e) {
    if (isOfflineError(e)) {
      enqueueRecipeScan(photo.id, label);
      ctx.syncRecipeScanQueue();
      ctx.setSuccess('Recipe photo saved — scan queued for when online');
      return;
    }
    ctx.setSuccess('Recipe photo saved — visible on Home');
    ctx.setError(e instanceof Error ? e.message : 'Recipe scan failed');
  } finally {
    ctx.setRecipeScanning(false);
  }
}

export async function logEntireSavedRecipeFlow(
  setData: (summary: FoodTodayResponse) => void,
  setSuccess: (msg: string) => void,
): Promise<{ message: string }> {
  const res = await api.logSavedRecipe();
  setData(res.summary);
  setSuccess(res.message);
  return { message: res.message };
}
