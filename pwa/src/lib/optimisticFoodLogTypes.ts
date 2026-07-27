export interface OptimisticFoodEntry {
  id: string;
  food: string;
  quantity_g: number;
  status: 'pending' | 'failed' | 'queued';
  source?: 'macros' | 'saved_recipe';
  meal_type?: string;
  created_at?: string;
}

export interface ExecuteOptimisticFoodLogOptions {
  serverOnline: boolean;
  id: string;
  pendingEntry: OptimisticFoodEntry;
  enqueue: (reuseId?: string) => import('./foodQueue').QueuedFoodLog;
  submit: () => Promise<{ summary: import('./api').FoodTodayResponse; message: string }>;
  setData: (data: import('./api').FoodTodayResponse | null) => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
  setPending: React.Dispatch<React.SetStateAction<OptimisticFoodEntry[]>>;
  onSuccess?: (summary: import('./api').FoodTodayResponse) => void;
  onOfflineComplete?: () => void;
  autoRetryMs?: number;
}

export const OPTIMISTIC_FOOD_LOG_AUTO_RETRY_MS = 1500;
