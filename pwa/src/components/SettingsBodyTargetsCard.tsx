import type { SettingsResponse } from '../lib/api';
import { formatSettingsFieldLabel } from '../lib/settingsSectionShared';

interface SettingsBodyTargetsCardProps {
  settings: SettingsResponse;
  saving: boolean;
  onBodyChange: (key: string, value: string) => void;
  onSave: () => void;
}

export function SettingsBodyTargetsCard({ settings, saving, onBodyChange, onSave }: SettingsBodyTargetsCardProps) {
  return (
    <article className="settings-card">
      <p className="section-eyebrow">Profile</p>
      <h2>Body &amp; targets</h2>
      {Object.entries(settings.body).map(([key, val]) => (
        <label key={key} className="settings-row settings-row--input">
          <span className="settings-row-label">{formatSettingsFieldLabel(key)}</span>
          <input
            className="settings-num-input"
            inputMode="decimal"
            value={val ?? ''}
            onChange={(e) => onBodyChange(key, e.target.value)}
          />
        </label>
      ))}
      <div className="settings-actions">
        <button type="button" className="btn-pill" disabled={saving} onClick={onSave}>
          {saving ? 'Saving…' : 'Save to Google Sheet'}
        </button>
      </div>
    </article>
  );
}
