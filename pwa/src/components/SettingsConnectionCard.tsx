interface SettingsConnectionCardProps {
  bearerInput: string;
  onBearerChange: (value: string) => void;
  onSave: () => void;
}

export function SettingsConnectionCard({ bearerInput, onBearerChange, onSave }: SettingsConnectionCardProps) {
  return (
    <article className="settings-card">
      <h2>Server connection</h2>
      <label className="field settings-field">
        Bearer token
        <input
          value={bearerInput}
          onChange={(e) => onBearerChange(e.target.value)}
          placeholder="Paste token from Mac server"
          autoComplete="off"
        />
      </label>
      <div className="settings-actions">
        <button type="button" className="btn-pill" onClick={onSave}>Save token</button>
      </div>
    </article>
  );
}
