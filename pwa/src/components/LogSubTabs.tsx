import { LOG_TABS, logTabLabel, shortcutModifierLabel, type LogTab } from '../lib/logSectionShared';

export interface LogSubTabsProps {
  tab: LogTab;
  onTabChange: (tab: LogTab) => void;
  showShortcutHint: boolean;
  onDismissShortcutHint: () => void;
}

export function LogSubTabs({ tab, onTabChange, showShortcutHint, onDismissShortcutHint }: LogSubTabsProps) {
  const mod = shortcutModifierLabel();

  return (
    <>
      <div className="sub-tabs" role="tablist" aria-label="Log food views">
        {LOG_TABS.map((t, index) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`log-tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`log-panel-${t}`}
            aria-keyshortcuts={`${mod}${index + 1}`}
            className={`sub-tab ${tab === t ? 'sub-tab-active' : ''}`}
            onClick={() => {
              onTabChange(t);
              onDismissShortcutHint();
            }}
          >
            {logTabLabel(t)}
          </button>
        ))}
      </div>

      {showShortcutHint && (
        <p className="log-shortcut-hint muted" role="note">
          Tip: press <kbd>{mod}1</kbd>–<kbd>{mod}5</kbd> to switch tabs.{' '}
          <button type="button" className="link-btn" onClick={onDismissShortcutHint}>
            Got it
          </button>
        </p>
      )}
    </>
  );
}
