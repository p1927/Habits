import { useEffect } from 'react';
import type { LogTab } from '../lib/logSectionShared';
import { getTodayMealPhotos } from '../lib/mealPhotos';
import type { RecipeScanState } from './useRecipeScanState';

export function useRecipeScanTabPhoto(tab: LogTab, recipeName: string | undefined, setRecipePhoto: RecipeScanState['setRecipePhoto']) {
  useEffect(() => {
    if (tab !== 'recipes') return;
    const label = recipeName ?? 'Recipe';
    const match = getTodayMealPhotos().find((p) => p.label === label);
    setRecipePhoto(match?.dataUrl ?? null);
  }, [tab, recipeName, setRecipePhoto]);
}
