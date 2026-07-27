import { openLogFromNotification } from './notificationNavigation';
import {
  DEFAULT_NOTIFICATION_TIMES,
  MEAL_NOTIFICATION_LABELS,
  MEAL_REMINDER_CHECK_INTERVAL_MS,
  getCachedNotificationTimes,
  isMealRemindersEnabled,
  markMealNotificationFired,
  mealNotificationCurrentHm,
  mealNotificationTodayKey,
  setMealRemindersEnabled,
  wasMealNotificationFiredToday,
  cacheNotificationTimes,
} from './mealNotificationStorage';
import { getNotificationPermission, requestNotificationPermission } from './mealNotificationPermission';

export {
  DEFAULT_NOTIFICATION_TIMES,
  MEAL_NOTIFICATION_LABELS,
  cacheNotificationTimes,
  getCachedNotificationTimes,
  isMealRemindersEnabled,
  setMealRemindersEnabled,
};
export { getNotificationPermission, requestNotificationPermission };

async function showMealNotification(mealKey: string, label: string) {
  const title = `Time for ${label}`;
  const body = 'Open Habits to log your meal or scan your plate.';
  const icon = `${import.meta.env.BASE_URL}icons/icon-192.png`;
  const tag = `meal-${mealKey}-${mealNotificationTodayKey()}`;
  const data = { url: `${import.meta.env.BASE_URL}#log` };

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, { body, icon, tag, data });
      return;
    } catch {
      /* fall through */
    }
  }

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    const notification = new Notification(title, { body, icon, tag, data });
    notification.onclick = () => {
      notification.close();
      openLogFromNotification();
    };
  }
}

export function checkMealReminders(times: Record<string, string>) {
  if (!isMealRemindersEnabled()) return;
  if (getNotificationPermission() !== 'granted') return;

  const now = mealNotificationCurrentHm();
  for (const [mealKey, scheduled] of Object.entries(times)) {
    if (!scheduled || scheduled !== now || wasMealNotificationFiredToday(mealKey)) continue;
    const label = MEAL_NOTIFICATION_LABELS[mealKey] ?? mealKey.replace(/_/g, ' ');
    markMealNotificationFired(mealKey);
    void showMealNotification(mealKey, label);
  }
}

export function startMealReminderScheduler(times: Record<string, string>): () => void {
  checkMealReminders(times);
  const id = window.setInterval(() => checkMealReminders(times), MEAL_REMINDER_CHECK_INTERVAL_MS);
  return () => window.clearInterval(id);
}
