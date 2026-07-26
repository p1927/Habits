import { getBearer, getConfig } from './config';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { apiUrl } = getConfig();
  const bearer = getBearer();
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (bearer) headers.set('Authorization', `Bearer ${bearer}`);

  const base = apiUrl.replace(/\/$/, '');
  const resp = await fetch(`${base}${path}`, { ...init, headers });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new ApiError(resp.status, text || resp.statusText);
  }
  if (resp.status === 204) return undefined as T;
  return resp.json() as Promise<T>;
}

export interface HealthResponse {
  ok: boolean;
  google_connected?: boolean;
}

export interface SettingsResponse {
  body: Record<string, string | number | null>;
  meal_plan: Record<string, Record<string, string>>;
  notification_times: Record<string, string>;
  sheets_connected: boolean;
}

export interface FoodLogItem {
  row: number;
  food: string;
  quantity_g: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export interface FoodTodayResponse {
  protein_g: number;
  protein_target_g: number | null;
  calories: number;
  carbs: number;
  fat: number;
  items: FoodLogItem[];
  sheets_connected: boolean;
}

export interface FoodHistoryDay {
  date: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export interface FoodScanResult {
  detected_name: string;
  confidence: number;
  suggested_grams: number;
  matched_name: string | null;
  macros: { calories: number; carbs: number; protein: number; fat: number } | null;
}

export interface FoodSearchResult {
  name: string;
  ref_grams: number;
  protein: number;
  calories: number;
}

export interface FutureSelfCard {
  id: string;
  title: string;
  habit?: string;
  accept_action?: string;
  decline_action?: string;
  image_url?: string;
  image_prompt?: string;
}

export interface HabitsWeekDay {
  date: string;
  weekday: string;
  metrics: Record<string, number | null>;
}

export interface HabitsWeekResponse {
  days_tracked: number;
  averages: Record<string, number | null>;
  recent_days: HabitsWeekDay[];
}

export interface HabitsTodayResponse {
  date: string;
  row: number | null;
  weekday: string;
  metrics: Record<string, number | null>;
  notes: string | null;
  sheets_connected: boolean;
}

export interface KeepCard {
  id: string;
  type: 'sickness' | 'notes' | 'strategy';
  title: string;
  body: string;
  color: string;
  row: number;
}

export interface ChatResponse {
  reply: string;
  tool_results: { tool: string; args: Record<string, unknown>; result: unknown }[];
}

export const api = {
  health: () => request<HealthResponse>('/healthz'),
  getSettings: () => request<SettingsResponse>('/api/settings'),
  updateSettings: (payload: Partial<SettingsResponse>) =>
    request<SettingsResponse>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  disconnectGoogle: () =>
    request<{ ok: boolean }>('/auth/google', { method: 'DELETE' }),
  getFoodToday: () => request<FoodTodayResponse>('/api/food/today'),
  getFoodHistory: (days = 7) =>
    request<{ days: FoodHistoryDay[]; sheets_connected: boolean }>(
      `/api/food/history?days=${days}`,
    ),
  getFoodTargets: () =>
    request<{ calorie_target: number; protein_target_g: number | null; sheets_connected: boolean }>(
      '/api/food/targets',
    ),
  scanFood: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return request<FoodScanResult>('/api/food/scan', { method: 'POST', body: fd });
  },
  getSavedRecipe: () =>
    request<{
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
    request<{
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
  updateFoodRow: (row: number, food?: string, quantity_g?: number) =>
    request<FoodTodayResponse>(`/api/food/log/${row}`, {
      method: 'PUT',
      body: JSON.stringify({ food, quantity_g }),
    }),
  deleteFoodRow: (row: number) =>
    request<FoodTodayResponse>(`/api/food/log/${row}`, { method: 'DELETE' }),
  searchFood: (q: string) =>
    request<{ results: FoodSearchResult[] }>(
      `/api/food/search?q=${encodeURIComponent(q)}`,
    ),
  getFutureSelfSummary: () =>
    request<{ summary: string; cards?: FutureSelfCard[]; tracker?: HabitsTodayResponse }>(
      '/api/future-self/summary',
    ),
  getFutureSelfCards: (images = false) =>
    request<{ cards: FutureSelfCard[]; summary: string }>(
      `/api/future-self/cards?images=${images}`,
    ),
  acceptFutureSelfCard: (card_id: string) =>
    request<{ summary: string }>('/api/future-self/accept', {
      method: 'POST',
      body: JSON.stringify({ card_id }),
    }),
  generateFutureSelfProjections: (photo_base64: string, habit_id = 'general') =>
    request<{
      decline_outcome: { label: string; image_url: string | null };
      accept_outcome: { label: string; image_url: string | null };
    }>('/api/future-self/projections', {
      method: 'POST',
      body: JSON.stringify({ photo_base64, habit_id }),
    }),
  getHabitsToday: () => request<HabitsTodayResponse>('/api/habits/today'),
  getHabitsWeek: () => request<HabitsWeekResponse>('/api/habits/week'),
  updateHabitMetric: (metric: string, value: number | null) =>
    request<HabitsTodayResponse>(`/api/habits/today/${metric}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),
  getCalendarToday: () =>
    request<{ events: { id: string; summary: string; start: string }[] }>(
      '/api/calendar/today',
    ),
  createCalendarEvent: (title: string, start: string, duration_minutes = 60) =>
    request<{ event: { summary: string; start: string } }>('/api/calendar/event', {
      method: 'POST',
      body: JSON.stringify({ title, start, duration_minutes }),
    }),
  getManageDay: () =>
    request<{ quadrants: Record<string, string[]>; sheets_connected: boolean }>(
      '/api/day/manage',
    ),
  updateManageDay: (quadrant: string, items: string[]) =>
    request<{ quadrants: Record<string, string[]> }>('/api/day/manage', {
      method: 'PUT',
      body: JSON.stringify({ quadrant, items }),
    }),
  getCards: (type?: string) =>
    request<{ cards: KeepCard[]; sheets_connected: boolean }>(
      `/api/cards${type ? `?type=${type}` : ''}`,
    ),
  createCard: (card_type: string, title: string, body: string) =>
    request<{ cards: KeepCard[] }>('/api/cards', {
      method: 'POST',
      body: JSON.stringify({ card_type, title, body }),
    }),
  deleteCard: (card_type: string, row: number) =>
    request<{ cards: KeepCard[] }>(`/api/cards/${card_type}/${row}`, { method: 'DELETE' }),
  agentChat: (message: string, history?: { role: string; content: string }[]) =>
    request<ChatResponse>('/api/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),
};
