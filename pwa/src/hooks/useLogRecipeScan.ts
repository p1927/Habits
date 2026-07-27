import type { UseLogRecipeScanOptions } from '../lib/logRecipeScanTypes';
import { useLogRecipeScanActions } from './useLogRecipeScanActions';
import { useRecipeScanQueueEffects } from './useRecipeScanQueueEffects';
import { useRecipeScanState } from './useRecipeScanState';
import { useRecipeScanTabPhoto } from './useRecipeScanTabPhoto';

export type { UseLogRecipeScanOptions } from '../lib/logRecipeScanTypes';

export function useLogRecipeScan(options: UseLogRecipeScanOptions) {
  const { serverOnline, tab, setError, setSuccess } = options;
  const state = useRecipeScanState(setSuccess);

  const { processRecipeScanQueue } = useRecipeScanQueueEffects({
    serverOnline,
    recipeScanning: state.recipeScanning,
    recipeScanResult: state.recipeScanResult,
    syncRecipeScanQueue: state.syncRecipeScanQueue,
    notifyRecipeScanQueueClearedIfEmpty: state.notifyRecipeScanQueueClearedIfEmpty,
    setRecipeScanning: state.setRecipeScanning,
    setRecipePhoto: state.setRecipePhoto,
    setRecipeScanResult: state.setRecipeScanResult,
    setRecipeEditName: state.setRecipeEditName,
    setRecipeEditQty: state.setRecipeEditQty,
    setError,
    setSuccess,
  });

  useRecipeScanTabPhoto(tab, state.recipe?.name, state.setRecipePhoto);

  const actions = useLogRecipeScanActions(options, state, processRecipeScanQueue);

  return {
    recipe: state.recipe,
    recipeSheetsConnected: state.recipeSheetsConnected,
    recipeLoading: state.recipeLoading,
    recipePhoto: state.recipePhoto,
    recipeScanResult: state.recipeScanResult,
    setRecipeScanResult: state.setRecipeScanResult,
    recipeScanning: state.recipeScanning,
    recipeEditOpen: state.recipeEditOpen,
    setRecipeEditOpen: state.setRecipeEditOpen,
    recipeEditName: state.recipeEditName,
    setRecipeEditName: state.setRecipeEditName,
    recipeEditQty: state.recipeEditQty,
    setRecipeEditQty: state.setRecipeEditQty,
    recipeScanQueue: state.recipeScanQueue,
    recipeScanQueueSyncClearedToken: state.recipeScanQueueSyncClearedToken,
    syncRecipeScanQueue: state.syncRecipeScanQueue,
    dismissRecipeScanQueue: state.dismissRecipeScanQueue,
    processRecipeScanQueue,
    ...actions,
  };
}
