import { useCallback, useState } from 'react';
import type { FoodScanResult } from '../lib/api';
import type { SavedRecipe } from '../lib/recipeScanFlow';
import {
  clearRecipeScanQueue,
  getRecipeScanQueue,
} from '../lib/recipeScanQueue';

export function useRecipeScanState(setSuccess: (msg: string) => void) {
  const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
  const [recipeSheetsConnected, setRecipeSheetsConnected] = useState<boolean | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipePhoto, setRecipePhoto] = useState<string | null>(null);
  const [recipeScanResult, setRecipeScanResult] = useState<FoodScanResult | null>(null);
  const [recipeScanning, setRecipeScanning] = useState(false);
  const [recipeEditOpen, setRecipeEditOpen] = useState(false);
  const [recipeEditName, setRecipeEditName] = useState('');
  const [recipeEditQty, setRecipeEditQty] = useState('100');
  const [recipeScanQueue, setRecipeScanQueue] = useState(() => getRecipeScanQueue());
  const [recipeScanQueueSyncClearedToken, setRecipeScanQueueSyncClearedToken] = useState(0);

  const syncRecipeScanQueue = useCallback(() => {
    setRecipeScanQueue(getRecipeScanQueue());
  }, []);

  const notifyRecipeScanQueueClearedIfEmpty = useCallback(() => {
    if (getRecipeScanQueue().length === 0) {
      setRecipeScanQueueSyncClearedToken((token) => token + 1);
    }
  }, []);

  const dismissRecipeScanQueue = useCallback(() => {
    clearRecipeScanQueue();
    syncRecipeScanQueue();
    setSuccess('Recipe scan queue cleared');
  }, [syncRecipeScanQueue, setSuccess]);

  return {
    recipe,
    setRecipe,
    recipeSheetsConnected,
    setRecipeSheetsConnected,
    recipeLoading,
    setRecipeLoading,
    recipePhoto,
    setRecipePhoto,
    recipeScanResult,
    setRecipeScanResult,
    recipeScanning,
    setRecipeScanning,
    recipeEditOpen,
    setRecipeEditOpen,
    recipeEditName,
    setRecipeEditName,
    recipeEditQty,
    setRecipeEditQty,
    recipeScanQueue,
    recipeScanQueueSyncClearedToken,
    syncRecipeScanQueue,
    notifyRecipeScanQueueClearedIfEmpty,
    dismissRecipeScanQueue,
  };
}

export type RecipeScanState = ReturnType<typeof useRecipeScanState>;
