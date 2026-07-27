import type { FoodTodayResponse } from './api';
import type { LogFoodUndoRestore } from '../hooks/useLogFoodScan';

export interface UseLogTypeTabOptions {
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
