import { APP_STATUS_LABELS } from '../lib/appShellShared';
import { shortcutModifierLabel } from '../lib/logSectionShared';

interface AppHeaderProps {
  status: string;
  settingsActive?: boolean;
  onLeaveSettings?: () => void;
  onOpenSettings: () => void;
  onPreloadSettings: () => void;
  showShortcutHint?: boolean;
  onDismissShortcutHint?: () => void;
}

export function AppHeader({
  status,
  settingsActive = false,
  onLeaveSettings,
  onOpenSettings,
  onPreloadSettings,
  showShortcutHint = false,
  onDismissShortcutHint,
}: AppHeaderProps) {
  const mod = shortcutModifierLabel();

  return (
    <header className="header">
      <span className="logo">Habits</span>
      <div className="header-actions">
        {settingsActive && onLeaveSettings && (
          <button type="button" className="btn-pill btn-pill-outline header-back-btn" onClick={onLeaveSettings}>
            ← Back
          </button>
        )}
        {showShortcutHint && (
          <p className="header-settings-shortcut-hint muted" role="note">
            <kbd>{mod},</kbd> Settings{' '}
            {onDismissShortcutHint && (
              <button type="button" className="link-btn" onClick={onDismissShortcutHint}>
                Got it
              </button>
            )}
          </p>
        )}
        <button
          type="button"
          className={`header-gear${settingsActive ? ' header-gear--active' : ''}`}
          onClick={onOpenSettings}
          onPointerEnter={onPreloadSettings}
          onFocus={onPreloadSettings}
          aria-label="Settings"
          aria-keyshortcuts={`${mod},`}
        >
          ⚙
        </button>
        <span
          className={`status-dot status-${status}`}
          role="status"
          aria-label={APP_STATUS_LABELS[status] ?? status}
        />
      </div>
    </header>
  );
}
