import { type MutableRefObject } from 'react';
import type { FoodScanResult } from '../lib/api';
import type { OffProduct } from '../lib/openFoodFacts';
import { type LogTab } from '../lib/logSectionShared';
import type { FoodLogUndoEntry } from './useLogFoodUndo';

interface UseLogFoodUndoRestoreOptions {
  restoreRef: MutableRefObject<(entry: FoodLogUndoEntry) => void>;
  setScanResult: (result: FoodScanResult | null) => void;
  setEditName: (name: string) => void;
  setEditQty: (qty: string) => void;
  setRecipeScanResult: (result: FoodScanResult | null) => void;
  setRecipeEditName: (name: string) => void;
  setRecipeEditQty: (qty: string) => void;
  setOffProduct: (product: OffProduct | null) => void;
  setOffQuantity: (qty: string) => void;
  setFoodName: (name: string) => void;
  setTab: (tab: LogTab) => void;
}

export function useLogFoodUndoRestore({
  restoreRef,
  setScanResult,
  setEditName,
  setEditQty,
  setRecipeScanResult,
  setRecipeEditName,
  setRecipeEditQty,
  setOffProduct,
  setOffQuantity,
  setFoodName,
  setTab,
}: UseLogFoodUndoRestoreOptions) {
  restoreRef.current = (entry) => {
    if (entry.restoreScan) {
      setScanResult(entry.restoreScan);
      setEditName(
        entry.restoreEditName
          ?? entry.restoreScan.matched_name
          ?? entry.restoreScan.detected_name,
      );
      setEditQty(entry.restoreEditQty ?? String(entry.restoreScan.suggested_grams));
    } else if (entry.restoreRecipeScan) {
      setRecipeScanResult(entry.restoreRecipeScan);
      setRecipeEditName(
        entry.restoreEditName
          ?? entry.restoreRecipeScan.matched_name
          ?? entry.restoreRecipeScan.detected_name,
      );
      setRecipeEditQty(entry.restoreEditQty ?? String(entry.restoreRecipeScan.suggested_grams));
    } else if (entry.restoreOffProduct) {
      setOffProduct(entry.restoreOffProduct);
      setOffQuantity(entry.restoreOffQuantity ?? String(entry.restoreOffProduct.quantityG));
      setFoodName(entry.restoreOffProduct.name);
      setTab('scan');
    }
  };
}
