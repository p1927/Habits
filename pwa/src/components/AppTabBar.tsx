import { APP_TABS } from '../lib/appShellShared';
import { isAppTabShortcutAvailable } from '../hooks/useAppTabShortcuts';
import { shortcutModifierLabel } from '../lib/logSectionShared';
import { getMealPlanQueueLastSource, mealPlanQueueSourceLabel, type MealPlanSyncSource } from '../lib/mealPlanQueue';
import type { TabId } from '../lib/config';
import type { AppShellState } from '../hooks/useAppShell';

type AppTabBarProps = Pick<
  AppShellState,
  | 'tab'
  | 'handleTabChange'
  | 'preloadTab'
  | 'mealPlanQueueCount'
  | 'mealPlanFailedCount'
  | 'mealPlanBadgePulse'
  | 'mealPlanSyncSourceHint'
  | 'scrollToMealPlanQueue'
> & {
  showShortcutHint?: boolean;
  onDismissShortcutHint?: () => void;
};

export function AppTabBar({
  tab,
  handleTabChange,
  preloadTab,
  mealPlanQueueCount,
  mealPlanFailedCount,
  mealPlanBadgePulse,
  mealPlanSyncSourceHint,
  scrollToMealPlanQueue,
  showShortcutHint = false,
  onDismissShortcutHint,
}: AppTabBarProps) {
  if (tab === 'settings') return null;

  const mod = shortcutModifierLabel();

  return (
    <>
    <nav className="tab-bar" aria-label="Main">
      {APP_TABS.map((t, index) => {
        const showQueueBadge =
          mealPlanQueueCount > 0 &&
          (t.id === 'home' || t.id === 'log' || t.id === 'day' || t.id === 'cards' || t.id === 'agent') &&
          tab !== t.id;
        const badgeCount = mealPlanFailedCount > 0 ? mealPlanFailedCount : mealPlanQueueCount;
        const queueBadgeCountLabel =
          (mealPlanFailedCount > 0
            ? `${mealPlanFailedCount} meal log${mealPlanFailedCount === 1 ? '' : 's'} failed to sync`
            : `${mealPlanQueueCount} meal log${mealPlanQueueCount === 1 ? '' : 's'} queued`) +
          mealPlanSyncSourceHint;
        const queueBadgeActionable =
          t.id === 'home' || t.id === 'log' || t.id === 'day' || t.id === 'cards' || t.id === 'agent';
        const cardsQueueTarget = getMealPlanQueueLastSource() ?? 'home';
        return (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? 'tab-active' : ''}`}
            onClick={() => {
              handleTabChange(t.id);
              onDismissShortcutHint?.();
            }}
            onPointerEnter={() => preloadTab(t.id)}
            onFocus={() => preloadTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            {...(isAppTabShortcutAvailable(tab, index)
              ? { 'aria-keyshortcuts': `${mod}${index + 1}` }
              : {})}
            aria-label={showQueueBadge ? `${t.label}, ${queueBadgeCountLabel}` : t.label}
          >
            <span className="tab-icon-wrap">
              <span className="tab-icon" aria-hidden>{t.icon}</span>
              {showQueueBadge && (
                <span
                  className={`tab-badge${mealPlanFailedCount > 0 ? ' tab-badge--failed' : ''}${mealPlanBadgePulse ? ' tab-badge--pulse' : ''}${queueBadgeActionable ? ' tab-badge--actionable' : ''}`}
                  aria-label={queueBadgeCountLabel}
                  title={queueBadgeTitle(t.id, queueBadgeCountLabel, cardsQueueTarget)}
                  onClick={
                    queueBadgeActionable
                      ? (e) => {
                          e.stopPropagation();
                          const targetTab =
                            t.id === 'cards' || t.id === 'agent' ? cardsQueueTarget : t.id;
                          scrollToMealPlanQueue(targetTab, { openLogPlan: targetTab === 'log' });
                        }
                      : undefined
                  }
                >
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </span>
            <span className="tab-label">{t.label}</span>
          </button>
        );
      })}
    </nav>
    {showShortcutHint && (
      <p className="log-shortcut-hint muted app-tab-shortcut-hint" role="note">
        Tip: press <kbd>{mod}1</kbd>–<kbd>{mod}5</kbd> to jump tabs (Log/Day/Cards keep their own shortcuts).{' '}
        {onDismissShortcutHint && (
          <button type="button" className="link-btn" onClick={onDismissShortcutHint}>
            Got it
          </button>
        )}
      </p>
    )}
    </>
  );
}

function queueBadgeTitle(tabId: TabId, label: string, cardsQueueTarget: MealPlanSyncSource) {
  if (tabId === 'log') return `${label} — tap to open Plan queue`;
  if (tabId === 'home' || tabId === 'day') return `${label} — tap to open queue`;
  if (tabId === 'cards' || tabId === 'agent') {
    return `${label} — tap to open ${mealPlanQueueSourceLabel(cardsQueueTarget)} queue`;
  }
  return undefined;
}
