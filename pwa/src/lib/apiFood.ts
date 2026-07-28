import { get, request } from './apiClient';
import type {
  FoodHistoryDay,
  FoodScanResult,
  FoodSearchResult,
  FoodTodayResponse,
} from './apiTypes';

export const foodApi = {
  getFoodToday: () => get<FoodTodayResponse>('/api/food/today'),
  getFoodHistory: (days = 7) =>
    get<{ days: FoodHistoryDay[]; sheets_connected: boolean }>(
      `/api/food/history?days=${days}`,
    ),
  getFoodTargets: () =>
    get<{ calorie_target: number; protein_target_g: number | null; sheets_connected: boolean }>(
      '/api/food/targets',
    ),
  scanFood: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return request<FoodScanResult>('/api/food/scan', { method: 'POST', body: fd });
  },
  getSavedRecipe: () =>
    get<{
      recipe: {
        name: string;
        items: { food: string; quantity_g: number; calories: number; protein: number }[];
        totals: { calories: number; protein: number } | null;
      } | null;
      sheets_connected: boolean;
    }>('/api/food/recipes'),
  logSavedRecipe: () =>
    request<{ message: string; summary: FoodTodayResponse; errors?: string[] }>(
      '/api/food/recipes/log',
      { method: 'POST' },
    ),
  getMealPlanToday: () =>
    get<{
      date: string;
      weekday: string;
      meals: { meal: string; label: string; description: string }[];
      sheets_connected: boolean;
    }>('/api/food/meal-plan/today'),
  logMealPlanToday: () =>
    request<{ message: string; summary: FoodTodayResponse; errors?: string[] }>(
      '/api/food/meal-plan/log-today',
      { method: 'POST' },
    ),
  logMealPlanItem: (meal: string) =>
    request<{ message: string; summary: FoodTodayResponse; label?: string; errors?: string[] }>(
      '/api/food/meal-plan/log',
      { method: 'POST', body: JSON.stringify({ meal }) },
    ),
  logFood: (description: string, meal_type = 'other') =>
    request<{ message: string; errors?: string[]; summary: FoodTodayResponse }>(
      '/api/food/log',
      { method: 'POST', body: JSON.stringify({ description, meal_type }) },
    ),
  logFoodItem: (food: string, quantity_g: number) =>
    request<{ message: string; summary: FoodTodayResponse }>('/api/food/item', {
      method: 'POST',
      body: JSON.stringify({ food, quantity_g }),
    }),
  logFoodMacros: (payload: {
    food: string;
    quantity_g: number;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  }) =>
    request<{ message: string; summary: FoodTodayResponse }>('/api/food/item/macros', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateFoodRow: (row: number, food?: string, quantity_g?: number) =>
    request<FoodTodayResponse>(`/api/food/log/${row}`, {
      method: 'PUT',
      body: JSON.stringify({ food, quantity_g }),
    }),
  deleteFoodRow: (row: number) =>
    request<FoodTodayResponse>(`/api/food/log/${row}`, { method: 'DELETE' }),
  searchFood: (q: string) =>
    get<{ results: FoodSearchResult[] }>(
      `/api/food/search?q=${encodeURIComponent(q)}`,
    ),
};
