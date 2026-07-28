import type { Dispatch, SetStateAction } from 'react';
import type { SettingsResponse } from './api';

export interface UseSettingsSectionOptions {
  serverOnline: boolean;
  googleConnected: boolean;
  onBearerSaved?: () => void;
}

export interface SettingsSectionProps {
  serverOnline: boolean;
  googleConnected: boolean;
  onBearerSaved?: () => void;
  oauthSuccess?: boolean;
  onDismissOauth?: () => void;
}

export interface SettingsSectionCardsProps {
  googleConnected: boolean;
  bearerInput: string;
  setBearerInput: Dispatch<SetStateAction<string>>;
  settings: SettingsResponse | null;
  saving: boolean;
  mealDay: string;
  setMealDay: Dispatch<SetStateAction<string>>;
  remindersEnabled: boolean;
  notifyPermission: NotificationPermission | 'unsupported';
  authUrl: string | null;
  saveBearer: () => Promise<void>;
  saveSettings: () => Promise<void>;
  disconnectGoogle: () => Promise<void>;
  updateBody: (key: string, value: string) => void;
  updateNotificationTime: (key: string, value: string) => void;
  updateMealPlan: (mealKey: string, day: string, value: string) => void;
  handleRemindersChange: (enabled: boolean) => void;
  handleRequestPermission: () => void;
}

export interface SettingsSectionChromeProps {
  oauthSuccess?: boolean;
  onDismissOauth?: () => void;
  disconnectSuccess: boolean;
  dismissDisconnectSuccess: () => void;
}
