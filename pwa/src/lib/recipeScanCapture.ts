import type { FoodScanResult } from './api';
import { isOfflineError } from './foodQueue';
import { addMealPhoto } from './mealPhotos';
import { enqueueRecipeScan } from './recipeScanQueue';
import { scanRecipeDataUrl } from './recipeScanApi';
import type { RecipePhotoCaptureContext, RecipeScanResultHandlers } from './recipeScanTypes';

export function recipeScanIdentifiedMessage(name: string, fromQueue = false): string {
  return fromQueue
    ? `Identified ${name} from queued recipe photo — swipe to log`
    : `Identified ${name} — swipe to log or use saved recipe below`;
}

export function applyRecipeScanResult(
  result: FoodScanResult,
  dataUrl: string,
  handlers: RecipeScanResultHandlers,
  fromQueue = false,
) {
  const name = result.matched_name ?? result.detected_name;
  handlers.setRecipePhoto(dataUrl);
  handlers.setRecipeScanResult(result);
  handlers.setRecipeEditName(name);
  handlers.setRecipeEditQty(String(result.suggested_grams));
  handlers.setSuccess(recipeScanIdentifiedMessage(name, fromQueue));
}

function queueRecipePhotoScan(
  photoId: string,
  label: string,
  ctx: Pick<RecipePhotoCaptureContext, 'syncRecipeScanQueue' | 'setSuccess'>,
) {
  enqueueRecipeScan(photoId, label);
  ctx.syncRecipeScanQueue();
  ctx.setSuccess('Recipe photo saved — scan queued for when online');
}

export async function captureRecipePhotoFlow(
  dataUrl: string,
  recipeName: string | undefined,
  ctx: RecipePhotoCaptureContext,
): Promise<void> {
  const label = recipeName ?? 'Recipe';
  const photo = addMealPhoto(dataUrl, label);
  ctx.setRecipePhoto(dataUrl);
  ctx.setRecipeScanResult(null);
  ctx.setError('');

  if (!ctx.serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    queueRecipePhotoScan(photo.id, label, ctx);
    return;
  }

  ctx.setRecipeScanning(true);
  try {
    const result = await scanRecipeDataUrl(dataUrl);
    applyRecipeScanResult(result, dataUrl, ctx);
  } catch (e) {
    if (isOfflineError(e)) {
      queueRecipePhotoScan(photo.id, label, ctx);
      return;
    }
    ctx.setSuccess('Recipe photo saved — visible on Home');
    ctx.setError(e instanceof Error ? e.message : 'Recipe scan failed');
  } finally {
    ctx.setRecipeScanning(false);
  }
}
