import { GOOGLE_REQUESTED_SCOPES, googleScopeLabel } from '../lib/settingsSectionShared';

interface SettingsGoogleCardProps {
  googleConnected: boolean;
  authUrl: string | null;
  googleScopes: string[];
  onDisconnect: () => void;
}

const GOOGLE_ACCOUNT_PERMISSIONS_URL = 'https://myaccount.google.com/permissions';

// External link target — Google's "third-party apps with account access" page.
// Opening in a new tab keeps the Settings state alive so the user can return
// and re-grant, then come back without a hard navigation.
function ManageOnGoogleLink() {
  return (
    <a
      className="btn-pill btn-pill-outline"
      href={GOOGLE_ACCOUNT_PERMISSIONS_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      Manage on Google Account
    </a>
  );
}

export function SettingsGoogleCard({
  googleConnected,
  authUrl,
  googleScopes,
  onDisconnect,
}: SettingsGoogleCardProps) {
  const granted = new Set(googleScopes);
  // When the user is connected but the status fetch hasn't returned yet
  // (transient) we don't want to flash "Not granted" pills — treat as
  // "unknown" so the row shows a neutral pill instead.
  const statusUnknown = googleConnected && googleScopes.length === 0;
  const someMissing = !statusUnknown && GOOGLE_REQUESTED_SCOPES.some((s) => !granted.has(s));

  return (
    <article className="settings-card" aria-labelledby="settings-google-heading">
      <p className="section-eyebrow">Integrations</p>
      <h2 id="settings-google-heading">Google account</h2>
      <div className="settings-row">
        <span className="settings-row-label">Status</span>
        <span className={`settings-status-pill ${googleConnected ? 'settings-status-pill--ok' : ''}`}>
          {googleConnected ? 'Connected' : 'Not connected'}
        </span>
      </div>

      {googleConnected && (
        <div
          className="settings-scope-list"
          role="region"
          aria-live="polite"
          aria-label="Granted Google permissions"
        >
          <p className="settings-card-note settings-scope-lede">
            Habits can access the following:
          </p>
          <ul className="settings-scope-rows" aria-label="Granted permissions">
            {GOOGLE_REQUESTED_SCOPES.map((scope) => {
              const isGranted = granted.has(scope);
              return (
                <li
                  key={scope}
                  className={`settings-scope-row${isGranted ? ' settings-scope-row--granted' : ' settings-scope-row--missing'}`}
                >
                  <span className="settings-scope-row-icon" aria-hidden="true">
                    {isGranted ? '✓' : '!'}
                  </span>
                  <span className="settings-scope-row-text">{googleScopeLabel(scope)}</span>
                  <span
                    className={
                      isGranted
                        ? 'settings-status-pill settings-status-pill--ok settings-scope-row-pill'
                        : 'settings-status-pill settings-scope-row-pill'
                    }
                  >
                    {isGranted
                      ? 'Granted'
                      : statusUnknown
                        ? 'Checking…'
                        : 'Not granted'}
                  </span>
                </li>
              );
            })}
          </ul>

          {someMissing && !statusUnknown && (
            <p className="settings-card-note settings-scope-reconnect">
              A permission is missing. Reconnect Google to grant it.
            </p>
          )}
        </div>
      )}

      <div className="settings-actions">
        {authUrl && !googleConnected && (
          <a className="btn-pill btn-pill-outline" href={authUrl}>
            Connect Google Sheets & Calendar
          </a>
        )}
        {googleConnected && authUrl && someMissing && (
          <a className="btn-pill btn-pill-outline" href={authUrl}>
            Re-connect Google
          </a>
        )}
        {googleConnected && <ManageOnGoogleLink />}
        {googleConnected && (
          <button type="button" className="btn-pill btn-pill-ghost" onClick={onDisconnect}>
            Disconnect Google
          </button>
        )}
      </div>
    </article>
  );
}
