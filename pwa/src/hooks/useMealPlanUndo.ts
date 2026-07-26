import { useCallback, useState } from 'react';
import { api, type FoodTodayResponse } from '../lib/api';

export interface MealPlanUndoState {
  label: string;
  rows: number[];
}

export function useMealPlanUndo(serverOnline: boolean) {
  const [undoLog, setUndoLog] = useState<MealPlanUndoState | null>(null);
  const [undoing, setUndoing] = useState(false);

  const dismissUndo = useCallback(() => setUndoLog(null), []);

  const snapshotRows = useCallback((summary: FoodTodayResponse | null) => {
    return new Set((summary?.items ?? []).map((i) => i.row));
  }, []);

  const offerUndoFromSummary = useCallback(
    (beforeRows: Set<number>, afterSummary: FoodTodayResponse, label: string) => {
      if (!serverOnline) return false;
      const newRows = afterSummary.items
        .filter((i) => !beforeRows.has(i.row))
        .map((i) => i.row);
      if (newRows.length === 0) return false;
      setUndoLog({ label, rows: newRows });
      return true;
    },
    [serverOnline],
  );

  const handleUndo = useCallback(
    async (onUndone?: () => void) => {
      if (!undoLog || undoing) return;
      setUndoing(true);
      try {
        for (const row of [...undoLog.rows].reverse()) {
          await api.deleteFoodRow(row);
        }
        setUndoLog(null);
        onUndone?.();
      } finally {
        setUndoing(false);
      }
    },
    [undoLog, undoing],
  );

  return {
    undoLog,
    undoing,
    dismissUndo,
    snapshotRows,
    offerUndoFromSummary,
    handleUndo,
  };
}
