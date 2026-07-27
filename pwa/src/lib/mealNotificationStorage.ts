export const DEFAULT_NOTIFICATION_TIMES: Record<string, string> = {
  breakfast: '08:00',
  mid_day_snack: '11:00',
  lunch: '13:00',
  evening_snack: '16:00',
  late_evening_snack: '18:00',
  dinner: '20:00',
  late_night_snack: '22:00',
  bedtime: '22:30',
};

export const MEAL_NOTIFICATION_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  mid_day_snack: 'Mid-day snack',
  lunch: 'Lunch',
  evening_snack: 'Evening snack',
  late_evening_snack: 'Late evening snack',
  dinner: 'Dinner',
  late_night_snack: 'Late night snack',
  bedtime: 'Bedtime',
};

export const MEAL_REMINDER_CHECK_INTERVAL_MS = 30_000;

const ENABLED_KEY = 'habits-meal-reminders-enabled';
const TIMES_KEY = 'habits-meal-notification-times';
const FIRED_KEY = 'habits-meal-notifications-fired';

export function mealNotificationTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function mealNotificationCurrentHm(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function readFired(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeFired(map: Record<string, string[]>) {
  localStorage.setItem(FIRED_KEY, JSON.stringify(map));
}

export function markMealNotificationFired(mealKey: string) {
  const day = mealNotificationTodayKey();
  const map = readFired();
  const list = map[day] ?? [];
  if (!list.includes(mealKey)) {
    map[day] = [...list, mealKey];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 2);
    const cutoffKey = cutoff.toISOString().slice(0, 10);
    for (const key of Object.keys(map)) {
      if (key < cutoffKey) delete map[key];
    }
    writeFired(map);
  }
}

export function wasMealNotificationFiredToday(mealKey: string): boolean {
  return (readFired()[mealNotificationTodayKey()] ?? []).includes(mealKey);
}

export function isMealRemindersEnabled(): boolean {
  return localStorage.getItem(ENABLED_KEY) === '1';
}

export function setMealRemindersEnabled(enabled: boolean) {
  localStorage.setItem(ENABLED_KEY, enabled ? '1' : '0');
}

export function cacheNotificationTimes(times: Record<string, string>) {
  localStorage.setItem(TIMES_KEY, JSON.stringify(times));
}

export function getCachedNotificationTimes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TIMES_KEY);
    if (!raw) return { ...DEFAULT_NOTIFICATION_TIMES };
    const parsed = JSON.parse(raw) as Record<string, string>;
    return { ...DEFAULT_NOTIFICATION_TIMES, ...parsed };
  } catch {
    return { ...DEFAULT_NOTIFICATION_TIMES };
  }
}
