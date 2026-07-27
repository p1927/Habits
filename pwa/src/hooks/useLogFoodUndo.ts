import { useCallback, useState, type MutableRefObject } from 'react';
import { api, type FoodScanResult, type FoodTodayResponse } from '../lib/api';
import type { OffProduct } from '../lib/openFoodFacts';
import type { LogFoodUndoRestore } from './useLogFoodScan';

export interface FoodLogUndoEntry {
  row: number;
  food: string;
  restoreScan?: FoodScanResult | null;
  restoreRecipeScan?: FoodScanResult | null;
  restoreOffProduct?: OffProduct | null;
  restoreEditName?: string;
  restoreEditQty?: string;
  restoreOffQuantity?: string;
}

interface UseLogFoodUndoOptions {
  serverOnline: boolean;
  setData: React.Dispatch<React.SetStateAction<FoodTodayResponse | null>>;
  onPendingUndo: () => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
  restoreRef: MutableRefObject<(entry: FoodLogUndoEntry) => void>;
}

export function useLogFoodUndo({
  serverOnline,
  setData,
  onPendingUndo,
  setSuccess,
  setError,
  restoreRef,
}: UseLogFoodUndoOptions) {
  const [undoLog, setUndoLog] = useState<FoodLogUndoEntry | null>(null);
  const [undoing, setUndoing] = useState(false);

  const dismissUndo = useCallback(() => setUndoLog(null), []);

  const findLoggedRow = useCallback((summary: FoodTodayResponse, food: string, qty: number) => {
    const match = [...summary.items].reverse().find(
      (i) => i.food === food && Math.abs(i.quantity_g - qty) < 0.01,
    );
    return match?.row ?? summary.items[summary.items.length - 1]?.row ?? null;
  }, []);

  const offerUndo = useCallback(
    (
      summary: FoodTodayResponse,
      food: string,
      qty: number,
      restore?: LogFoodUndoRestore,
    ) => {
      const row = findLoggedRow(summary, food, qty);
      if (row != null && serverOnline) {
        onPendingUndo();
        setUndoLog({
          row,
          food,
          restoreScan: restore?.scan,
          restoreRecipeScan: restore?.recipeScan,
          restoreOffProduct: restore?.offProduct,
          restoreEditName: restore?.editName,
          restoreEditQty: restore?.editQty,
          restoreOffQuantity: restore?.offQuantity,
        });
      }
    },
    [findLoggedRow, serverOnline, onPendingUndo],
  );

  const handleUndo = useCallback(async () => {
    if (!undoLog || undoing) return;
    setUndoing(true);
    try {
      setData(await api.deleteFoodRow(undoLog.row));
      restoreRef.current(undoLog);
      setSuccess('Log undone');
      setUndoLog(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Undo failed');
    } finally {
      setUndoing(false);
    }
  }, [undoLog, undoing, setData, restoreRef, setSuccess, setError]);

  return {
    undoLog,
    undoing,
    dismissUndo,
    offerUndo,
    handleUndo,
  };
}
