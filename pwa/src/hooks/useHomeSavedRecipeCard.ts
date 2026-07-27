import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type FoodTodayResponse } from '../lib/api';
import type { SavedRecipe } from '../lib/recipeScanTypes';

export interface UseHomeSavedRecipeCardOptions {
  serverOnline: boolean;
  onFoodUpdated?: (summary: FoodTodayResponse) => void;
  onError?: (message: string) => void;
  onLogItem?: (food: string, quantityG: number) => void | Promise<void>;
  onLogEntireRecipe?: () => void | Promise<void>;
  onOpenLogRecipes?: () => void;
  logging?: boolean;
}

export function useHomeSavedRecipeCard({
  serverOnline,
  onFoodUpdated,
  onError,
  onLogItem: onLogItemProp,
  onLogEntireRecipe: onLogEntireRecipeProp,
  logging: loggingProp,
}: UseHomeSavedRecipeCardOptions) {
  const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
  const [sheetsConnected, setSheetsConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggingLocal, setLoggingLocal] = useState(false);
  const logging = loggingProp ?? loggingLocal;
  const [success, setSuccess] = useState('');

  const loadRecipe = useCallback(async () => {
    if (!serverOnline) return;
    setLoading(true);
    try {
      const res = await api.getSavedRecipe();
      setRecipe(res.recipe);
      setSheetsConnected(res.sheets_connected);
    } catch (e) {
      setRecipe(null);
      setSheetsConnected(null);
      if (e instanceof ApiError && e.status === 401) return;
      onError?.(e instanceof Error ? e.message : 'Failed to load saved recipe');
    } finally {
      setLoading(false);
    }
  }, [serverOnline, onError]);

  useEffect(() => {
    void loadRecipe();
  }, [loadRecipe]);

  const logItem = useCallback(
    async (food: string, quantityG: number) => {
      if (!serverOnline || logging) return;
      if (onLogItemProp) {
        await onLogItemProp(food, quantityG);
        return;
      }
      setLoggingLocal(true);
      try {
        const res = await api.logFood(`${quantityG}g ${food}`);
        onFoodUpdated?.(res.summary);
        setSuccess(res.message);
      } catch (e) {
        onError?.(e instanceof Error ? e.message : 'Recipe item log failed');
      } finally {
        setLoggingLocal(false);
      }
    },
    [serverOnline, logging, onLogItemProp, onFoodUpdated, onError],
  );

  const logEntireRecipe = useCallback(async () => {
    if (!serverOnline || logging) return;
    if (onLogEntireRecipeProp) {
      await onLogEntireRecipeProp();
      return;
    }
    setLoggingLocal(true);
    try {
      const res = await api.logSavedRecipe();
      onFoodUpdated?.(res.summary);
      setSuccess(res.message);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : 'Recipe log failed');
    } finally {
      setLoggingLocal(false);
    }
  }, [serverOnline, logging, onLogEntireRecipeProp, onFoodUpdated, onError]);

  return {
    recipe,
    sheetsConnected,
    loading,
    logging,
    success,
    loadRecipe,
    logItem,
    logEntireRecipe,
  };
}
