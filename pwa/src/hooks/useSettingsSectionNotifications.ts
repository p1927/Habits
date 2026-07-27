import { useCallback, useState } from 'react';
import {
  getNotificationPermission,
  isMealRemindersEnabled,
  requestNotificationPermission,
  setMealRemindersEnabled,
} from '../lib/mealNotifications';

export function useSettingsSectionNotifications() {
  const [mealDay, setMealDay] = useState('monday');
  const [remindersEnabled, setRemindersEnabled] = useState(isMealRemindersEnabled);
  const [notifyPermission, setNotifyPermission] = useState(getNotificationPermission());

  const handleRemindersChange = useCallback((on: boolean) => {
    setMealRemindersEnabled(on);
    setRemindersEnabled(on);
  }, []);

  const handleRequestPermission = useCallback(() => {
    void requestNotificationPermission().then((p) => {
      setNotifyPermission(p);
      if (p === 'granted') {
        setMealRemindersEnabled(true);
        setRemindersEnabled(true);
      }
    });
  }, []);

  return {
    mealDay,
    setMealDay,
    remindersEnabled,
    notifyPermission,
    handleRemindersChange,
    handleRequestPermission,
  };
}
