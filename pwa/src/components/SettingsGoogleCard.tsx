interface SettingsGoogleCardProps {
  googleConnected: boolean;
  authUrl: string | null;
  onDisconnect: () => void;
}

export function SettingsGoogleCard({ googleConnected, authUrl, onDisconnect }: SettingsGoogleCardProps) {
  return (
    <article className="settings-card">
      <p className="section-eyebrow">Integrations</p>
      <h2>Google account</h2>
      <div className="settings-row">
        <span className="settings-row-label">Status</span>
        <span className={`settings-status-pill ${googleConnected ? 'settings-status-pill--ok' : ''}`}>
          {googleConnected ? 'Connected' : 'Not connected'}
        </span>
      </div>
      <div className="settings-actions">
        {authUrl && !googleConnected && (
          <a className="btn-pill btn-pill-outline" href={authUrl}>Connect Google Sheets & Calendar</a>
        )}
        {googleConnected && (
          <button type="button" className="btn-pill btn-pill-ghost" onClick={onDisconnect}>
            Disconnect Google
          </button>
        )}
      </div>
    </article>
  );
}
