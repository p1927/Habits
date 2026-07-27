import type { FoodTodayResponse } from './api';
import type { LogTab } from './logSectionShared';
import type { LogFoodUndoRestore } from '../hooks/useLogFoodScan';

export interface UseLogRecipeScanOptions {
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
