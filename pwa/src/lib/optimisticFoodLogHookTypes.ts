import type { FoodTodayResponse } from './api';

export interface UseOptimisticFoodLogOptions {
  serverOnline: boolean;
  setData: (data: FoodTodayResponse | null) => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}

export type OptimisticFoodLogContext = UseOptimisticFoodLogOptions & {
  setPending: React.Dispatch<React.SetStateAction<import('./optimisticFoodLog').OptimisticFoodEntry[]>>;
};
