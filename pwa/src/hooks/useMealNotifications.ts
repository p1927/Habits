import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getBearer } from '../lib/config';
import {
  cacheNotificationTimes,
  getCachedNotificationTimes,
  getNotificationPermission,
  isMealRemindersEnabled,
  startMealReminderScheduler,
} from '../lib/mealNotifications';

export function useMealNotifications(serverOnline: boolean) {
  const [permission, setPermission] = useState(getNotificationPermission());
  const [enabled, setEnabled] = useState(isMealRemindersEnabled());
  const [times, setTimes] = useState(getCachedNotificationTimes);

  useEffect(() => {
    if (!serverOnline || !getBearer()) return;
    api.getSettings()
      .then((settings) => {
        cacheNotificationTimes(settings.notification_times);
        setTimes(settings.notification_times);
      })
      .catch(() => {
        setTimes(getCachedNotificationTimes());
      });
  }, [serverOnline]);

  useEffect(() => {
    setPermission(getNotificationPermission());
    setEnabled(isMealRemindersEnabled());
  }, []);

  useEffect(() => {
    if (!enabled || permission !== 'granted') return;
    return startMealReminderScheduler(times);
  }, [enabled, permission, times]);

  return { permission, enabled, times, setEnabled, setPermission, setTimes };
}
