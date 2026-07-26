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
  headers.set('Content-Type', 'application/json');
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

export interface HabitsTodayResponse {
  date: string;
  row: number | null;
  weekday: string;
  metrics: Record<string, number | null>;
  notes: string | null;
  sheets_connected: boolean;
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
  logFood: (description: string, meal_type = 'other') =>
    request<{ message: string; errors?: string[]; summary: FoodTodayResponse }>(
      '/api/food/log',
      {
        method: 'POST',
        body: JSON.stringify({ description, meal_type }),
      },
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
  getHabitsToday: () => request<HabitsTodayResponse>('/api/habits/today'),
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
};
