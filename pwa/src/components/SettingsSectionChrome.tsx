import type { SettingsSectionChromeProps } from '../lib/settingsSectionTypes';

export function SettingsSectionChrome({
  oauthSuccess,
  onDismissOauth,
  disconnectSuccess,
  dismissDisconnectSuccess,
}: Omit<SettingsSectionChromeProps, 'error'>) {
  return (
    <>
      <p className="section-eyebrow">Account</p>
      <h1>Settings</h1>
      <p className="muted settings-lede">Everything settable here syncs to your Google Sheets — same as Excel.</p>

      {oauthSuccess && (
        <div className="banner banner-ok banner-revolut banner-row" role="status" aria-live="polite">
          Google connected successfully.
          <button type="button" className="btn-pill btn-pill-outline" onClick={onDismissOauth}>
            Dismiss
          </button>
        </div>
      )}

      {disconnectSuccess && (
        <div className="banner banner-ok banner-revolut banner-row" role="status" aria-live="polite">
          Google account disconnected.
          <button type="button" className="btn-pill btn-pill-outline" onClick={dismissDisconnectSuccess}>
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}
