import { useCallback, useState } from 'react';
import { type FoodTodayResponse } from '../lib/api';
import {
  deleteFoodRowWithConfirm,
  executeBarcodeLookup,
  executeOffProductLog,
} from '../lib/logTypeTabActions';
import { type OffProduct } from '../lib/openFoodFacts';
import { useDebouncedFoodSearch } from './useDebouncedFoodSearch';
import type { LogFoodUndoRestore } from './useLogFoodScan';

interface UseLogTypeTabOptions {
  serverOnline: boolean;
  logItem: (
    food: string,
    qty: number,
    onSuccess?: (summary: FoodTodayResponse) => void,
  ) => Promise<void>;
  logMeal: (description: string, mealType: string) => Promise<void>;
  logMacros: (
    food: string,
    qty: number,
    macros: { calories: number; carbs: number; protein: number; fat: number },
    onSuccess?: (summary: FoodTodayResponse) => void,
  ) => Promise<void>;
  offerUndo: (
    summary: FoodTodayResponse,
    food: string,
    qty: number,
    restore?: LogFoodUndoRestore,
  ) => void;
  setData: React.Dispatch<React.SetStateAction<FoodTodayResponse | null>>;
  setLoading: (loading: boolean) => void;
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
  onSwitchToTypeTab: () => void;
}

export function useLogTypeTab({
  serverOnline,
  logItem,
  logMeal,
  logMacros,
  offerUndo,
  setData,
  setLoading,
  setError,
  setSuccess,
  onSwitchToTypeTab,
}: UseLogTypeTabOptions) {
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState('other');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [offProduct, setOffProduct] = useState<OffProduct | null>(null);
  const [offQuantity, setOffQuantity] = useState('100');
  const { searchResults, setSearchResults } = useDebouncedFoodSearch(foodName);

  const handleVoiceLog = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!description.trim()) return;
      setSuccess('');
      const desc = description.trim();
      const meal = mealType;
      setDescription('');
      await logMeal(desc, meal);
    },
    [description, mealType, logMeal, setSuccess],
  );

  const handleManualLog = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const qty = Number.parseFloat(quantity);
      if (!foodName.trim() || !qty) return;
      const name = foodName.trim();
      setFoodName('');
      setSearchResults([]);
      await logItem(name, qty, (summary) => {
        offerUndo(summary, name, qty);
      });
    },
    [quantity, foodName, logItem, offerUndo, setSearchResults],
  );

  const handleLogOffProduct = useCallback(async () => {
    if (!offProduct) return;
    await executeOffProductLog(offProduct, offQuantity, {
      logMacros,
      offerUndo,
      setOffProduct,
      setFoodName,
      setSearchResults,
      setLoading,
      setError,
    });
  }, [offProduct, offQuantity, logMacros, offerUndo, setLoading, setError, setSearchResults]);

  const handleBarcode = useCallback(
    async (code: string) => {
      await executeBarcodeLookup(
        code,
        serverOnline,
        {
          setFoodName,
          setSearchResults,
          setOffProduct,
          setOffQuantity,
          setSuccess,
          setError,
          setLoading,
        },
        onSwitchToTypeTab,
      );
    },
    [serverOnline, onSwitchToTypeTab, setLoading, setError, setSuccess, setSearchResults],
  );

  const handleDelete = useCallback(
    async (row: number) => {
      await deleteFoodRowWithConfirm(row, setData, setLoading, setError);
    },
    [setData, setLoading, setError],
  );

  const selectSearchResult = useCallback((name: string) => {
    setFoodName(name);
    setSearchResults([]);
  }, [setSearchResults]);

  return {
    description,
    setDescription,
    mealType,
    setMealType,
    foodName,
    setFoodName,
    quantity,
    setQuantity,
    searchResults,
    offProduct,
    setOffProduct,
    offQuantity,
    setOffQuantity,
    handleVoiceLog,
    handleManualLog,
    handleLogOffProduct,
    handleBarcode,
    handleDelete,
    selectSearchResult,
  };
}
