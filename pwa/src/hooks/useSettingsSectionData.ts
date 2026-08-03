import { useCallback, useEffect, useState } from 'react';
import { api, type SettingsResponse } from '../lib/api';
import { getBearer, setBearer } from '../lib/config';
import { cacheNotificationTimes } from '../lib/mealNotifications';
import type { UseSettingsSectionOptions } from '../lib/settingsSectionTypes';

export function useSettingsSectionData({
  serverOnline,
  googleConnected,
  onBearerSaved,
}: UseSettingsSectionOptions) {
  const [bearerInput, setBearerInput] = useState(getBearer() ?? '');
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [error, setError] = useState('');
  const [disconnectSuccess, setDisconnectSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [googleScopes, setGoogleScopes] = useState<string[]>([]);

  useEffect(() => {
    if (!serverOnline || !getBearer()) return;
    api.getSettings()
      .then((s) => {
        cacheNotificationTimes(s.notification_times);
        setSettings(s);
      })
      .catch((e: Error) => {
        setDisconnectSuccess(false);
        setError(e.message);
      });
  }, [serverOnline, googleConnected]);

  // ui-069: re-fetch granted OAuth scopes whenever the connection state
  // flips (post-OAuth return, post-disconnect). The list is what powers the
  // "Not granted" pills on the Google card.
  useEffect(() => {
    if (!serverOnline || !getBearer()) {
      setGoogleScopes([]);
      return;
    }
    api
      .getGoogleStatus()
      .then((s) => setGoogleScopes(s.google_scopes ?? []))
      .catch(() => setGoogleScopes([]));
  }, [serverOnline, googleConnected]);

  const saveBearer = useCallback(async () => {
    setBearer(bearerInput.trim());
    setError('');
    setDisconnectSuccess(false);
    onBearerSaved?.();
    if (serverOnline && bearerInput.trim()) {
      try {
        setSettings(await api.getSettings());
      } catch (e) {
        setDisconnectSuccess(false);
        setError(e instanceof Error ? e.message : 'Failed to connect');
      }
    }
  }, [bearerInput, onBearerSaved, serverOnline]);

  const saveSettings = useCallback(async () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    setDisconnectSuccess(false);
    try {
      const updated = await api.updateSettings(settings);
      cacheNotificationTimes(updated.notification_times);
      setSettings(updated);
    } catch (e) {
      setDisconnectSuccess(false);
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const disconnectGoogle = useCallback(async () => {
    setDisconnectSuccess(false);
    try {
      await api.disconnectGoogle();
      onBearerSaved?.();
      setSettings((s) => (s ? { ...s, sheets_connected: false } : s));
      setError('');
      setGoogleScopes([]);
      setDisconnectSuccess(true);
    } catch (e) {
      setDisconnectSuccess(false);
      setError(e instanceof Error ? e.message : 'Disconnect failed');
    }
  }, [onBearerSaved]);

  const dismissDisconnectSuccess = useCallback(() => {
    setDisconnectSuccess(false);
  }, []);

  const updateBody = useCallback((key: string, value: string) => {
    setSettings((s) => (s ? { ...s, body: { ...s.body, [key]: value } } : s));
  }, []);

  const updateNotificationTime = useCallback((key: string, value: string) => {
    setSettings((s) =>
      s ? { ...s, notification_times: { ...s.notification_times, [key]: value } } : s,
    );
  }, []);

  const updateMealPlan = useCallback((mealKey: string, day: string, value: string) => {
    setSettings((s) =>
      s
        ? {
            ...s,
            meal_plan: {
              ...s.meal_plan,
              [mealKey]: {
                ...(s.meal_plan[mealKey] ?? {}),
                [day]: value,
              },
            },
          }
        : s,
    );
  }, []);

  return {
    bearerInput,
    setBearerInput,
    settings,
    error,
    disconnectSuccess,
    dismissDisconnectSuccess,
    saving,
    googleScopes,
    saveBearer,
    saveSettings,
    disconnectGoogle,
    updateBody,
    updateNotificationTime,
    updateMealPlan,
  };
}

export type SettingsSectionDataState = ReturnType<typeof useSettingsSectionData>;
