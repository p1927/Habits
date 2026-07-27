import { useCallback, useEffect } from 'react';
import type { FoodScanResult } from '../lib/api';
import { isOfflineError } from '../lib/foodQueue';
import { applyRecipeScanResult, scanRecipeDataUrl } from '../lib/recipeScanFlow';
import { getMealPhotoById } from '../lib/mealPhotos';
import {
  getRecipeScanQueue,
  removeRecipeScanQueueItem,
} from '../lib/recipeScanQueue';

interface UseRecipeScanQueueEffectsOptions {
  serverOnline: boolean;
  recipeScanning: boolean;
  recipeScanResult: FoodScanResult | null;
  syncRecipeScanQueue: () => void;
  notifyRecipeScanQueueClearedIfEmpty: () => void;
  setRecipeScanning: (scanning: boolean) => void;
  setRecipePhoto: (url: string) => void;
  setRecipeScanResult: (result: FoodScanResult | null) => void;
  setRecipeEditName: (name: string) => void;
  setRecipeEditQty: (qty: string) => void;
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
}

export function useRecipeScanQueueEffects({
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
}: UseRecipeScanQueueEffectsOptions) {
  const processRecipeScanQueue = useCallback(async () => {
    if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
    if (recipeScanning || recipeScanResult) return;

    const queue = getRecipeScanQueue();
    if (!queue.length) return;

    const item = queue[0];
    const photo = getMealPhotoById(item.photoId);
    if (!photo) {
      removeRecipeScanQueueItem(item.id);
      syncRecipeScanQueue();
      notifyRecipeScanQueueClearedIfEmpty();
      void processRecipeScanQueue();
      return;
    }

    setRecipeScanning(true);
    setError('');
    try {
      const result = await scanRecipeDataUrl(photo.dataUrl);
      removeRecipeScanQueueItem(item.id);
      syncRecipeScanQueue();
      notifyRecipeScanQueueClearedIfEmpty();
      applyRecipeScanResult(result, photo.dataUrl, {
        setRecipePhoto,
        setRecipeScanResult,
        setRecipeEditName,
        setRecipeEditQty,
        setSuccess,
      }, true);
    } catch (e) {
      if (isOfflineError(e)) return;
      setError(e instanceof Error ? e.message : 'Queued recipe scan failed');
    } finally {
      setRecipeScanning(false);
    }
  }, [
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
  ]);

  useEffect(() => {
    void processRecipeScanQueue();
  }, [processRecipeScanQueue]);

  useEffect(() => {
    const onOnline = () => {
      syncRecipeScanQueue();
      void processRecipeScanQueue();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [processRecipeScanQueue, syncRecipeScanQueue]);

  return { processRecipeScanQueue };
}
