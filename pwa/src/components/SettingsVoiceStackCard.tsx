import { getConfig } from '../lib/config';

export function SettingsVoiceStackCard() {
  const { voiceUiUrl } = getConfig();
  const base = voiceUiUrl.replace(/\/$/, '');
  const settingsUrl = `${base}/settings`;

  return (
    <div className="ui-card settings-voice-stack-card">
      <h2 className="settings-card-title">Voice coach stack</h2>
      <p className="muted settings-card-lede">
        LLM, speech-to-text, text-to-speech, wake word, and voice selection — use the full
        local-voice-ai settings UI (same app embedded in Coach voice sheet).
      </p>
      <div className="settings-voice-stack-actions">
        <a
          href={settingsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill btn-pill-outline"
        >
          Open voice settings
        </a>
        <a href={base} target="_blank" rel="noopener noreferrer" className="btn-pill btn-pill-outline">
          Open voice app
        </a>
      </div>
    </div>
  );
}
