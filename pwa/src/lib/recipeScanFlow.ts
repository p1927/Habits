import { api, type FoodScanResult } from './api';
import { dataUrlToFile } from './logSectionShared';

export type SavedRecipe = {
  name: string;
  items: { food: string; quantity_g: number; calories: number; protein: number }[];
  totals: { calories: number; protein: number } | null;
};

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
