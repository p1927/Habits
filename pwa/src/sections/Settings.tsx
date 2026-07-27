import { useEffect } from 'react';
import { SettingsBodyTargetsCard } from '../components/SettingsBodyTargetsCard';
import { SettingsConnectionCard } from '../components/SettingsConnectionCard';
import { SettingsGoogleCard } from '../components/SettingsGoogleCard';
import { SettingsMealNotificationsCard } from '../components/SettingsMealNotificationsCard';
import { SettingsMealPlanCard } from '../components/SettingsMealPlanCard';
import { useSettingsSection } from '../hooks/useSettingsSection';
import { getBuildLabel } from '../lib/config';

interface SettingsProps {
  serverOnline: boolean;
  googleConnected: boolean;
  onBearerSaved?: () => void;
  oauthSuccess?: boolean;
  onDismissOauth?: () => void;
}

export function Settings({
  serverOnline,
  googleConnected,
  onBearerSaved,
  oauthSuccess,
  onDismissOauth,
}: SettingsProps) {
  const {
    bearerInput,
    setBearerInput,
    settings,
    error,
    saving,
    mealDay,
    setMealDay,
    remindersEnabled,
    notifyPermission,
    saveBearer,
    saveSettings,
    disconnectGoogle,
    authUrl,
    updateBody,
    updateNotificationTime,
    updateMealPlan,
    handleRemindersChange,
    handleRequestPermission,
  } = useSettingsSection({ serverOnline, googleConnected, onBearerSaved });

  useEffect(() => {
    if (!oauthSuccess || !onDismissOauth) return;
    const id = window.setTimeout(onDismissOauth, 5000);
    return () => window.clearTimeout(id);
  }, [oauthSuccess, onDismissOauth]);

  return (
    <section className="section settings-page">
      <p className="section-eyebrow">Account</p>
      <h1>Settings</h1>
      <p className="muted settings-lede">Everything settable here syncs to your Google Sheets — same as Excel.</p>

      {oauthSuccess && (
        <div className="banner banner-ok banner-revolut banner-row">
          Google connected successfully.
          <button type="button" className="btn-pill btn-pill-outline" onClick={onDismissOauth}>Dismiss</button>
        </div>
      )}

      <SettingsConnectionCard
        bearerInput={bearerInput}
        onBearerChange={setBearerInput}
        onSave={() => void saveBearer()}
      />

      <SettingsGoogleCard
        googleConnected={googleConnected}
        authUrl={authUrl}
        onDisconnect={() => void disconnectGoogle()}
      />

      {settings && (
        <>
          <SettingsBodyTargetsCard
            settings={settings}
            saving={saving}
            onBodyChange={updateBody}
            onSave={() => void saveSettings()}
          />

          <SettingsMealNotificationsCard
            settings={settings}
            saving={saving}
            remindersEnabled={remindersEnabled}
            notifyPermission={notifyPermission}
            onRemindersChange={handleRemindersChange}
            onRequestPermission={handleRequestPermission}
            onNotificationTimeChange={updateNotificationTime}
            onSave={() => void saveSettings()}
          />

          <SettingsMealPlanCard
            settings={settings}
            mealDay={mealDay}
            saving={saving}
            onMealDayChange={setMealDay}
            onMealPlanChange={updateMealPlan}
            onSave={() => void saveSettings()}
          />
        </>
      )}

      {error && <div className="banner banner-warn banner-revolut">{error}</div>}
      <p className="muted build-label">Build {getBuildLabel()}</p>
    </section>
  );
}
