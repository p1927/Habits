import { api, type FoodTodayResponse } from './api';

let cached: FoodTodayResponse | null = null;
let cachedAt = 0;
const TTL_MS = 5000;

/** Short-lived food/today cache — avoids sync loops hammering the API while food state is still null. */
export async function fetchFoodTodaySnapshot(force = false): Promise<FoodTodayResponse> {
  if (!force && cached && Date.now() - cachedAt < TTL_MS) {
    return cached;
  }
  const data = await api.getFoodToday();
  cached = data;
  cachedAt = Date.now();
  return data;
}

export function primeFoodTodaySnapshot(data: FoodTodayResponse): void {
  cached = data;
  cachedAt = Date.now();
}

export function invalidateFoodTodaySnapshot(): void {
  cached = null;
  cachedAt = 0;
}
