import { useMemo } from 'react';
import { getConfig } from '../lib/config';
import type { UseSettingsSectionOptions } from '../lib/settingsSectionTypes';
import { useSettingsSectionData } from './useSettingsSectionData';
import { useSettingsSectionNotifications } from './useSettingsSectionNotifications';

export type { UseSettingsSectionOptions } from '../lib/settingsSectionTypes';

export function useSettingsSection(options: UseSettingsSectionOptions) {
  const data = useSettingsSectionData(options);
  const notifications = useSettingsSectionNotifications();

  const authUrl = useMemo(() => {
    const { apiUrl } = getConfig();
    return options.serverOnline ? `${apiUrl.replace(/\/$/, '')}/auth/google` : null;
  }, [options.serverOnline]);

  return {
    bearerInput: data.bearerInput,
    setBearerInput: data.setBearerInput,
    settings: data.settings,
    error: data.error,
    saving: data.saving,
    mealDay: notifications.mealDay,
    setMealDay: notifications.setMealDay,
    remindersEnabled: notifications.remindersEnabled,
    notifyPermission: notifications.notifyPermission,
    saveBearer: data.saveBearer,
    saveSettings: data.saveSettings,
    disconnectGoogle: data.disconnectGoogle,
    authUrl,
    updateBody: data.updateBody,
    updateNotificationTime: data.updateNotificationTime,
    updateMealPlan: data.updateMealPlan,
    handleRemindersChange: notifications.handleRemindersChange,
    handleRequestPermission: notifications.handleRequestPermission,
  };
}
