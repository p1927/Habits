import { APP_STATUS_LABELS } from '../lib/appShellShared';

interface AppHeaderProps {
  status: string;
  onOpenSettings: () => void;
  onPreloadSettings: () => void;
}

export function AppHeader({ status, onOpenSettings, onPreloadSettings }: AppHeaderProps) {
  return (
    <header className="header">
      <span className="logo">Habits</span>
      <div className="header-actions">
        <button
          type="button"
          className="header-gear"
          onClick={onOpenSettings}
          onPointerEnter={onPreloadSettings}
          onFocus={onPreloadSettings}
          aria-label="Settings"
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
