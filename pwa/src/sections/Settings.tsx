import { SettingsSectionCards } from '../components/SettingsSectionCards';
import { SettingsSectionChrome } from '../components/SettingsSectionChrome';
import { SettingsSectionFooter } from '../components/SettingsSectionFooter';
import { useSettingsSection } from '../hooks/useSettingsSection';
import { useSettingsSectionEffects } from '../hooks/useSettingsSectionEffects';
import type { SettingsSectionProps } from '../lib/settingsSectionTypes';

export function Settings({
  serverOnline,
  googleConnected,
  onBearerSaved,
  oauthSuccess,
  onDismissOauth,
}: SettingsSectionProps) {
  const section = useSettingsSection({ serverOnline, googleConnected, onBearerSaved });

  useSettingsSectionEffects({
    oauthSuccess,
    onDismissOauth,
    disconnectSuccess: section.disconnectSuccess,
    dismissDisconnectSuccess: section.dismissDisconnectSuccess,
  });

  return (
    <section className="section settings-page">
      <SettingsSectionChrome
        oauthSuccess={oauthSuccess}
        onDismissOauth={onDismissOauth}
        disconnectSuccess={section.disconnectSuccess}
        dismissDisconnectSuccess={section.dismissDisconnectSuccess}
      />
      <SettingsSectionCards
        googleConnected={googleConnected}
        bearerInput={section.bearerInput}
        setBearerInput={section.setBearerInput}
        settings={section.settings}
        saving={section.saving}
        mealDay={section.mealDay}
        setMealDay={section.setMealDay}
        remindersEnabled={section.remindersEnabled}
        notifyPermission={section.notifyPermission}
        authUrl={section.authUrl}
        saveBearer={section.saveBearer}
        saveSettings={section.saveSettings}
        disconnectGoogle={section.disconnectGoogle}
        updateBody={section.updateBody}
        updateNotificationTime={section.updateNotificationTime}
        updateMealPlan={section.updateMealPlan}
        handleRemindersChange={section.handleRemindersChange}
        handleRequestPermission={section.handleRequestPermission}
      />
      <SettingsSectionFooter error={section.error} />
    </section>
  );
}
