import { SettingsBodyTargetsCard } from './SettingsBodyTargetsCard';
import { SettingsConnectionCard } from './SettingsConnectionCard';
import { SettingsGoogleCard } from './SettingsGoogleCard';
import { SettingsMealNotificationsCard } from './SettingsMealNotificationsCard';
import { SettingsMealPlanCard } from './SettingsMealPlanCard';
import { SettingsVoiceStackCard } from './SettingsVoiceStackCard';
import type { SettingsSectionCardsProps } from '../lib/settingsSectionTypes';

export function SettingsSectionCards({
  googleConnected,
  bearerInput,
  setBearerInput,
  settings,
  saving,
  mealDay,
  setMealDay,
  remindersEnabled,
  notifyPermission,
  authUrl,
  saveBearer,
  saveSettings,
  disconnectGoogle,
  updateBody,
  updateNotificationTime,
  updateMealPlan,
  handleRemindersChange,
  handleRequestPermission,
}: SettingsSectionCardsProps) {
  return (
    <>
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

      <SettingsVoiceStackCard />

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
    </>
  );
}
