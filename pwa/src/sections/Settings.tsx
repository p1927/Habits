import { useEffect, useState } from 'react';
import { api, type SettingsResponse } from '../lib/api';
import { getBearer, getBuildLabel, getConfig, setBearer } from '../lib/config';

interface SettingsProps {
  serverOnline: boolean;
  googleConnected: boolean;
  onBearerSaved?: () => void;
  oauthSuccess?: boolean;
  onDismissOauth?: () => void;
}

const NOTIFICATION_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  mid_day_snack: 'Mid-day snack',
  lunch: 'Lunch',
  evening_snack: 'Evening snack',
  late_evening_snack: 'Late evening snack',
  dinner: 'Dinner',
  late_night_snack: 'Late night snack',
  bedtime: 'Bedtime',
};

const MEAL_PLAN_KEYS = [
  'breakfast',
  'mid_day_snack',
  'lunch',
  'evening_snack',
  'late_evening_snack',
  'dinner',
  'late_night_snack',
];

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function Settings({ serverOnline, googleConnected, onBearerSaved, oauthSuccess, onDismissOauth }: SettingsProps) {
  const [bearerInput, setBearerInput] = useState(getBearer() ?? '');
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [mealDay, setMealDay] = useState('monday');

  useEffect(() => {
    if (!serverOnline || !getBearer()) return;
    api.getSettings()
      .then(setSettings)
      .catch((e: Error) => setError(e.message));
  }, [serverOnline, googleConnected]);

  async function saveBearer() {
    setBearer(bearerInput.trim());
    setError('');
    onBearerSaved?.();
    if (serverOnline && bearerInput.trim()) {
      try {
        const s = await api.getSettings();
        setSettings(s);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to connect');
      }
    }
  }

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    setError('');
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function disconnectGoogle() {
    try {
      await api.disconnectGoogle();
      onBearerSaved?.();
      setSettings((s) => (s ? { ...s, sheets_connected: false } : s));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Disconnect failed');
    }
  }

  const { apiUrl } = getConfig();
  const authUrl = serverOnline && apiUrl
    ? `${apiUrl.replace(/\/$/, '')}/auth/google`
    : null;

  return (
    <section className="section">
      <h1>Settings</h1>
      <p className="muted">Everything settable here syncs to your Google Sheets — same as Excel.</p>

      {oauthSuccess && (
        <div className="banner banner-ok">
          Google connected successfully.
          <button type="button" className="btn-small" onClick={onDismissOauth}>Dismiss</button>
        </div>
      )}

      <div className="card">
        <h2>Server connection</h2>
        <label className="field">
          Bearer token
          <input
            value={bearerInput}
            onChange={(e) => setBearerInput(e.target.value)}
            placeholder="Paste token from Mac server"
            autoComplete="off"
          />
        </label>
        <button type="button" onClick={() => void saveBearer()}>Save token</button>
      </div>

      <div className="card">
        <h2>Google account</h2>
        <p>{googleConnected ? 'Connected' : 'Not connected'}</p>
        {authUrl && !googleConnected && (
          <a className="btn-link" href={authUrl}>Connect Google Sheets & Calendar</a>
        )}
        {googleConnected && (
          <button type="button" onClick={() => void disconnectGoogle()}>Disconnect Google</button>
        )}
      </div>

      {settings && (
        <>
          <div className="card">
            <h2>Body & targets</h2>
            {Object.entries(settings.body).map(([key, val]) => (
              <label key={key} className="field">
                {key}
                <input
                  value={val ?? ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      body: { ...settings.body, [key]: e.target.value },
                    })
                  }
                />
              </label>
            ))}
            <button type="button" disabled={saving} onClick={() => void saveSettings()}>
              {saving ? 'Saving…' : 'Save to Google Sheet'}
            </button>
          </div>

          <div className="card">
            <h2>Meal notifications</h2>
            {Object.entries(settings.notification_times).map(([key, val]) => (
              <label key={key} className="field">
                {NOTIFICATION_LABELS[key] ?? key}
                <input
                  type="time"
                  value={val}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notification_times: {
                        ...settings.notification_times,
                        [key]: e.target.value,
                      },
                    })
                  }
                />
              </label>
            ))}
            <button type="button" disabled={saving} onClick={() => void saveSettings()}>
              Save notification times
            </button>
          </div>

          <div className="card">
            <h2>Weekly meal plan</h2>
            <label className="field">
              Day
              <select value={mealDay} onChange={(e) => setMealDay(e.target.value)}>
                {WEEKDAYS.map((d) => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </label>
            {MEAL_PLAN_KEYS.map((mealKey) => {
              const val = settings.meal_plan[mealKey]?.[mealDay] ?? '';
              return (
                <label key={mealKey} className="field">
                  {NOTIFICATION_LABELS[mealKey] ?? mealKey.replace(/_/g, ' ')}
                  <input
                    value={val}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        meal_plan: {
                          ...settings.meal_plan,
                          [mealKey]: {
                            ...(settings.meal_plan[mealKey] ?? {}),
                            [mealDay]: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </label>
              );
            })}
            <button type="button" disabled={saving} onClick={() => void saveSettings()}>
              Save meal plan
            </button>
          </div>
        </>
      )}

      {error && <div className="banner banner-warn">{error}</div>}
      <p className="muted build-label">Build {getBuildLabel()}</p>
    </section>
  );
}
