import { APP_TABS } from '../lib/appShellShared';
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
>;

export function AppTabBar({
  tab,
  handleTabChange,
  preloadTab,
  mealPlanQueueCount,
  mealPlanFailedCount,
  mealPlanBadgePulse,
  mealPlanSyncSourceHint,
  scrollToMealPlanQueue,
}: AppTabBarProps) {
  if (tab === 'settings') return null;

  return (
    <nav className="tab-bar" aria-label="Main">
      {APP_TABS.map((t) => {
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
            onClick={() => handleTabChange(t.id)}
            onPointerEnter={() => preloadTab(t.id)}
            onFocus={() => preloadTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
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
