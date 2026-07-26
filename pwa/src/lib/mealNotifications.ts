import { openLogFromNotification } from './notificationNavigation';

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

const ENABLED_KEY = 'habits-meal-reminders-enabled';
const TIMES_KEY = 'habits-meal-notification-times';
const FIRED_KEY = 'habits-meal-notifications-fired';

const CHECK_INTERVAL_MS = 30_000;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function currentHm(): string {
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

function markFired(mealKey: string) {
  const day = todayKey();
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

function wasFiredToday(mealKey: string): boolean {
  return (readFired()[todayKey()] ?? []).includes(mealKey);
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

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

async function showMealNotification(mealKey: string, label: string) {
  const title = `Time for ${label}`;
  const body = 'Open Habits to log your meal or scan your plate.';
  const icon = `${import.meta.env.BASE_URL}icons/icon-192.png`;

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon,
        tag: `meal-${mealKey}-${todayKey()}`,
        data: { url: `${import.meta.env.BASE_URL}#log` },
      });
      return;
    } catch {
      /* fall through */
    }
  }

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon,
      tag: `meal-${mealKey}-${todayKey()}`,
      data: { url: `${import.meta.env.BASE_URL}#log` },
    });
    notification.onclick = () => {
      notification.close();
      openLogFromNotification();
    };
  }
}

export function checkMealReminders(times: Record<string, string>) {
  if (!isMealRemindersEnabled()) return;
  if (getNotificationPermission() !== 'granted') return;

  const now = currentHm();
  for (const [mealKey, scheduled] of Object.entries(times)) {
    if (!scheduled || scheduled !== now || wasFiredToday(mealKey)) continue;
    const label = MEAL_NOTIFICATION_LABELS[mealKey] ?? mealKey.replace(/_/g, ' ');
    markFired(mealKey);
    void showMealNotification(mealKey, label);
  }
}

export function startMealReminderScheduler(times: Record<string, string>): () => void {
  checkMealReminders(times);
  const id = window.setInterval(() => checkMealReminders(times), CHECK_INTERVAL_MS);
  return () => window.clearInterval(id);
}
