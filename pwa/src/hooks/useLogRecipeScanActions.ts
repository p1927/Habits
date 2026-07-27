import { useCallback } from 'react';
import {
  captureRecipePhotoFlow,
  loadSavedRecipeFlow,
  logEntireSavedRecipeFlow,
  logRecipeScanFlow,
} from '../lib/recipeScanFlow';
import type { UseLogRecipeScanOptions } from '../lib/logRecipeScanTypes';
import type { useRecipeScanState } from './useRecipeScanState';

type RecipeScanState = ReturnType<typeof useRecipeScanState>;

export function useLogRecipeScanActions(
  {
    serverOnline,
    setData,
    setLoading,
    logItem,
    offerUndo,
    setError,
    setSuccess,
  }: UseLogRecipeScanOptions,
  state: RecipeScanState,
  processRecipeScanQueue: () => Promise<void>,
) {
  const loadSavedRecipe = useCallback(async () => {
    await loadSavedRecipeFlow(serverOnline, {
      setRecipeLoading: state.setRecipeLoading,
      setError,
      setRecipe: state.setRecipe,
      setRecipeSheetsConnected: state.setRecipeSheetsConnected,
    });
  }, [serverOnline, setError, state.setRecipeLoading, state.setRecipe, state.setRecipeSheetsConnected]);

  const handleRecipePhoto = useCallback(
    async (dataUrl: string) => {
      await captureRecipePhotoFlow(dataUrl, state.recipe?.name, {
        serverOnline,
        syncRecipeScanQueue: state.syncRecipeScanQueue,
        setRecipePhoto: state.setRecipePhoto,
        setRecipeScanResult: state.setRecipeScanResult,
        setRecipeEditName: state.setRecipeEditName,
        setRecipeEditQty: state.setRecipeEditQty,
        setRecipeScanning: state.setRecipeScanning,
        setError,
        setSuccess,
      });
    },
    [state, serverOnline, setError, setSuccess],
  );

  const logRecipeScan = useCallback(
    async (name: string, qty: number) => {
      await logRecipeScanFlow(name, qty, {
        recipeScanResult: state.recipeScanResult,
        recipeEditName: state.recipeEditName,
        recipeEditQty: state.recipeEditQty,
        setRecipeScanResult: state.setRecipeScanResult,
        logItem,
        offerUndo,
        syncRecipeScanQueue: state.syncRecipeScanQueue,
        processRecipeScanQueue,
      });
    },
    [state, logItem, offerUndo, processRecipeScanQueue],
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
    loadSavedRecipe,
    handleRecipePhoto,
    logRecipeScan,
    logEntireSavedRecipe,
  };
}
