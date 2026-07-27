import type { SettingsResponse } from '../lib/api';
import { SETTINGS_NOTIFICATION_LABELS } from '../lib/settingsSectionShared';

interface SettingsMealNotificationsCardProps {
  settings: SettingsResponse;
  saving: boolean;
  remindersEnabled: boolean;
  notifyPermission: NotificationPermission | 'unsupported';
  onRemindersChange: (enabled: boolean) => void;
  onRequestPermission: () => void;
  onNotificationTimeChange: (key: string, value: string) => void;
  onSave: () => void;
}

export function SettingsMealNotificationsCard({
  settings,
  saving,
  remindersEnabled,
  notifyPermission,
  onRemindersChange,
  onRequestPermission,
  onNotificationTimeChange,
  onSave,
}: SettingsMealNotificationsCardProps) {
  return (
    <article className="settings-card">
      <h2>Meal notifications</h2>
      <p className="muted settings-card-note">
        Browser reminders at each meal time while Habits is installed. Keep the app open or pinned for best results.
      </p>
      <label className="settings-row">
        <span className="settings-row-label">Enable meal reminders</span>
        <input
          type="checkbox"
          className="settings-toggle"
          checked={remindersEnabled}
          disabled={notifyPermission === 'unsupported'}
          onChange={(e) => onRemindersChange(e.target.checked)}
        />
      </label>
      {notifyPermission === 'unsupported' && (
        <p className="muted settings-card-note">Notifications are not supported in this browser.</p>
      )}
      {notifyPermission === 'default' && (
        <div className="settings-actions">
          <button type="button" className="btn-pill btn-pill-outline" onClick={onRequestPermission}>
            Allow notifications
          </button>
        </div>
      )}
      {notifyPermission === 'denied' && (
        <p className="banner banner-warn banner-revolut settings-inline-banner">Notifications blocked — enable them in browser settings.</p>
      )}
      {notifyPermission === 'granted' && remindersEnabled && (
        <p className="muted settings-card-note">Reminders active for today&apos;s schedule.</p>
      )}
      {Object.entries(settings.notification_times).map(([key, val]) => (
        <label key={key} className="settings-row settings-row--input">
          <span className="settings-row-label">{SETTINGS_NOTIFICATION_LABELS[key] ?? key}</span>
          <input
            type="time"
            className="settings-time-input"
            value={val}
            onChange={(e) => onNotificationTimeChange(key, e.target.value)}
          />
        </label>
      ))}
      <div className="settings-actions">
        <button type="button" className="btn-pill" disabled={saving} onClick={onSave}>
          Save notification times
        </button>
      </div>
    </article>
  );
}
