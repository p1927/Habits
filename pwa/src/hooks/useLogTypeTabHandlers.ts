import { useCallback } from 'react';
import {
  deleteFoodRowWithConfirm,
  executeBarcodeLookup,
  executeOffProductLog,
} from '../lib/logTypeTabActions';
import type { UseLogTypeTabOptions } from '../lib/logTypeTabTypes';
import type { LogTypeTabFormState } from './useLogTypeTabFormState';

export function useLogTypeTabHandlers(options: UseLogTypeTabOptions, form: LogTypeTabFormState) {
  const {
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
  } = options;

  const {
    description,
    mealType,
    foodName,
    quantity,
    offProduct,
    offQuantity,
    setDescription,
    setFoodName,
    setSearchResults,
    setOffProduct,
  } = form;

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
    [description, mealType, logMeal, setDescription, setSuccess],
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
    [quantity, foodName, logItem, offerUndo, setFoodName, setSearchResults],
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
  }, [offProduct, offQuantity, logMacros, offerUndo, setLoading, setError, setFoodName, setOffProduct, setSearchResults]);

  const handleBarcode = useCallback(
    async (code: string) => {
      await executeBarcodeLookup(
        code,
        serverOnline,
        {
          setFoodName,
          setSearchResults,
          setOffProduct,
          setOffQuantity: form.setOffQuantity,
          setSuccess,
          setError,
          setLoading,
        },
        onSwitchToTypeTab,
      );
    },
    [serverOnline, onSwitchToTypeTab, setLoading, setError, setSuccess, setFoodName, setOffProduct, setSearchResults, form.setOffQuantity],
  );

  const handleDelete = useCallback(
    async (row: number) => {
      await deleteFoodRowWithConfirm(row, setData, setLoading, setError);
    },
    [setData, setLoading, setError],
  );

  const selectSearchResult = useCallback(
    (name: string) => {
      setFoodName(name);
      setSearchResults([]);
    },
    [setFoodName, setSearchResults],
  );

  return {
    handleVoiceLog,
    handleManualLog,
    handleLogOffProduct,
    handleBarcode,
    handleDelete,
    selectSearchResult,
  };
}
