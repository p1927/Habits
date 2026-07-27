import { useCallback, useEffect, useState } from 'react';
import { type FoodScanResult, type FoodTodayResponse } from '../lib/api';
import { type LogTab } from '../lib/logSectionShared';
import { getTodayMealPhotos } from '../lib/mealPhotos';
import {
  captureRecipePhotoFlow,
  fetchSavedRecipe,
  logEntireSavedRecipeFlow,
  savedRecipeLoadError,
  type SavedRecipe,
} from '../lib/recipeScanFlow';
import {
  clearRecipeScanQueue,
  getRecipeScanQueue,
} from '../lib/recipeScanQueue';
import { useRecipeScanQueueEffects } from './useRecipeScanQueueEffects';
import type { LogFoodUndoRestore } from './useLogFoodScan';

interface UseLogRecipeScanOptions {
  serverOnline: boolean;
  tab: LogTab;
  setData: (summary: FoodTodayResponse) => void;
  setLoading: (loading: boolean) => void;
  logItem: (
    food: string,
    qty: number,
    onSuccess?: (summary: FoodTodayResponse) => void,
  ) => Promise<void>;
  offerUndo: (
    summary: FoodTodayResponse,
    food: string,
    qty: number,
    restore?: LogFoodUndoRestore,
  ) => void;
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
}

export function useLogRecipeScan({
  serverOnline,
  tab,
  setData,
  setLoading,
  logItem,
  offerUndo,
  setError,
  setSuccess,
}: UseLogRecipeScanOptions) {
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

  const loadSavedRecipe = useCallback(async () => {
    if (!serverOnline) return;
    setRecipeLoading(true);
    setError('');
    try {
      const { recipe: loaded, sheetsConnected } = await fetchSavedRecipe();
      setRecipe(loaded);
      setRecipeSheetsConnected(sheetsConnected);
    } catch (e) {
      setRecipe(null);
      setRecipeSheetsConnected(null);
      const msg = savedRecipeLoadError(e);
      if (msg) setError(msg);
    } finally {
      setRecipeLoading(false);
    }
  }, [serverOnline, setError]);

  const { processRecipeScanQueue } = useRecipeScanQueueEffects({
    serverOnline,
    recipeScanning,
    recipeScanResult,
    syncRecipeScanQueue,
    notifyRecipeScanQueueClearedIfEmpty,
    setRecipeScanning,
    setRecipePhoto,
    setRecipeScanResult,
    setRecipeEditName,
    setRecipeEditQty,
    setError,
    setSuccess,
  });

  useEffect(() => {
    if (tab !== 'recipes') return;
    const label = recipe?.name ?? 'Recipe';
    const match = getTodayMealPhotos().find((p) => p.label === label);
    setRecipePhoto(match?.dataUrl ?? null);
  }, [tab, recipe?.name]);

  const handleRecipePhoto = useCallback(
    async (dataUrl: string) => {
      await captureRecipePhotoFlow(dataUrl, recipe?.name, {
        serverOnline,
        syncRecipeScanQueue,
        setRecipePhoto,
        setRecipeScanResult,
        setRecipeEditName,
        setRecipeEditQty,
        setRecipeScanning,
        setError,
        setSuccess,
      });
    },
    [recipe?.name, serverOnline, syncRecipeScanQueue, setError, setSuccess],
  );

  const logRecipeScan = useCallback(
    async (name: string, qty: number) => {
      const savedScan = recipeScanResult;
      const savedName = recipeEditName;
      const savedQty = recipeEditQty;
      setRecipeScanResult(null);
      await logItem(name, qty, (summary) => {
        offerUndo(summary, name, qty, {
          recipeScan: savedScan,
          editName: savedName,
          editQty: savedQty,
        });
      });
      syncRecipeScanQueue();
      void processRecipeScanQueue();
    },
    [recipeScanResult, recipeEditName, recipeEditQty, logItem, offerUndo, syncRecipeScanQueue, processRecipeScanQueue],
  );

  const logEntireSavedRecipe = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await logEntireSavedRecipeFlow(setData, setSuccess);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Recipe log failed');
    } finally {
      setLoading(false);
    }
  }, [setData, setLoading, setError, setSuccess]);

  return {
    recipe,
    recipeSheetsConnected,
    recipeLoading,
    recipePhoto,
    recipeScanResult,
    setRecipeScanResult,
    recipeScanning,
    recipeEditOpen,
    setRecipeEditOpen,
    recipeEditName,
    setRecipeEditName,
    recipeEditQty,
    setRecipeEditQty,
    recipeScanQueue,
    recipeScanQueueSyncClearedToken,
    loadSavedRecipe,
    syncRecipeScanQueue,
    dismissRecipeScanQueue,
    handleRecipePhoto,
    logRecipeScan,
    logEntireSavedRecipe,
    processRecipeScanQueue,
  };
}
