import { useCallback, useEffect, useState } from 'react';
import type { TabId } from './lib/config';
import type { MealPlanSyncSource } from './lib/mealPlanQueue';
import { useMealNotifications } from './hooks/useMealNotifications';
import { useMealPlanQueueCount } from './hooks/useMealPlanQueueCount';
import { bindNotificationNavigation } from './lib/notificationNavigation';
import { useServerStatus } from './hooks/useServerStatus';
import { Home } from './sections/Home';
import { Log } from './sections/Log';
import { Day } from './sections/Day';
import { Cards } from './sections/Cards';
import { Agent } from './sections/Agent';
import { Settings } from './sections/Settings';
import './App.css';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '◉' },
  { id: 'log', label: 'Log', icon: '📷' },
  { id: 'day', label: 'Day', icon: '📅' },
  { id: 'cards', label: 'Cards', icon: '📝' },
  { id: 'agent', label: 'Coach', icon: '✦' },
];

function parseInitialTab(): TabId {
  const hash = window.location.hash.replace('#', '');
  const valid: TabId[] = ['home', 'log', 'day', 'cards', 'agent', 'settings'];
  if (valid.includes(hash as TabId)) return hash as TabId;
  return 'home';
}

const STATUS_LABELS: Record<string, string> = {
  online: 'Server connected',
  'online-unauthorized': 'Server connected, authorization required',
  offline: 'Server offline',
  checking: 'Checking server connection',
  'no-config': 'API URL not configured',
};

function App() {
  const [tab, setTab] = useState<TabId>(parseInitialTab);
  const [oauthSuccess, setOauthSuccess] = useState(false);
  const [openLogMealPlan, setOpenLogMealPlan] = useState(false);
  const { status, googleConnected, refresh } = useServerStatus();
  const serverOnline = status === 'online' || status === 'online-unauthorized';
  useMealNotifications(serverOnline);
  const { count: mealPlanQueueCount, failedCount: mealPlanFailedCount, badgePulse: mealPlanBadgePulse } =
    useMealPlanQueueCount();

  const handleTabChange = useCallback((id: TabId) => {
    setTab(id);
    window.location.hash = id;
  }, []);

  const navigateMealPlanSyncSource = useCallback(
    (source: MealPlanSyncSource) => {
      if (source === 'log') setOpenLogMealPlan(true);
      handleTabChange(source);
    },
    [handleTabChange],
  );

  useEffect(() => {
    return bindNotificationNavigation(handleTabChange);
  }, [handleTabChange]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google') === 'connected') {
      setTab('settings');
      setOauthSuccess(true);
      void refresh();
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash || '#settings'}`);
    }
  }, [refresh]);

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="header">
        <span className="logo">Habits</span>
        <div className="header-actions">
          <button
            type="button"
            className="header-gear"
            onClick={() => handleTabChange('settings')}
            aria-label="Settings"
          >
            ⚙
          </button>
          <span
            className={`status-dot status-${status}`}
            role="status"
            aria-label={STATUS_LABELS[status] ?? status}
          />
        </div>
      </header>

      {status === 'no-config' && (
        <div className="banner banner-warn" role="alert">
          API URL not configured. Set VITE_HABITS_API_URL in GitHub secrets or pwa/.env.development.
        </div>
      )}

      {status === 'online-unauthorized' && (
        <div className="banner banner-warn" role="alert">
          Server reachable — paste your bearer token in Settings.
        </div>
      )}

      <main className="main" id="main-content" role="main">
        {tab === 'home' && (
          <Home serverOnline={serverOnline} onNavigateMealPlanSyncSource={navigateMealPlanSyncSource} />
        )}
        {tab === 'log' && (
          <Log
            serverOnline={serverOnline}
            openMealPlan={openLogMealPlan}
            onMealPlanOpened={() => setOpenLogMealPlan(false)}
            onNavigateMealPlanSyncSource={navigateMealPlanSyncSource}
          />
        )}
        {tab === 'day' && (
          <Day serverOnline={serverOnline} onNavigateMealPlanSyncSource={navigateMealPlanSyncSource} />
        )}
        {tab === 'cards' && (
          <Cards serverOnline={serverOnline} onNavigateMealPlanSyncSource={navigateMealPlanSyncSource} />
        )}
        {tab === 'agent' && <Agent serverOnline={serverOnline} />}
        {tab === 'settings' && (
          <Settings
            serverOnline={serverOnline}
            googleConnected={googleConnected}
            onBearerSaved={() => void refresh()}
            oauthSuccess={oauthSuccess}
            onDismissOauth={() => setOauthSuccess(false)}
          />
        )}
      </main>

      {tab !== 'settings' && (
        <nav className="tab-bar" aria-label="Main">
          {TABS.map((t) => {
            const showQueueBadge =
              mealPlanQueueCount > 0 &&
              (t.id === 'home' || t.id === 'log' || t.id === 'day' || t.id === 'cards') &&
              tab !== t.id;
            const badgeCount = mealPlanFailedCount > 0 ? mealPlanFailedCount : mealPlanQueueCount;
            const queueBadgeCountLabel =
              mealPlanFailedCount > 0
                ? `${mealPlanFailedCount} meal log${mealPlanFailedCount === 1 ? '' : 's'} failed to sync`
                : `${mealPlanQueueCount} meal log${mealPlanQueueCount === 1 ? '' : 's'} queued`;
            return (
            <button
              key={t.id}
              type="button"
              className={`tab ${tab === t.id ? 'tab-active' : ''}`}
              onClick={() => handleTabChange(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
            >
              <span className="tab-icon-wrap">
                <span className="tab-icon" aria-hidden>{t.icon}</span>
                {showQueueBadge && (
                  <span
                    className={`tab-badge${mealPlanFailedCount > 0 ? ' tab-badge--failed' : ''}${mealPlanBadgePulse ? ' tab-badge--pulse' : ''}${t.id === 'log' || t.id === 'cards' ? ' tab-badge--actionable' : ''}`}
                    aria-label={queueBadgeCountLabel}
                    title={
                      t.id === 'log'
                        ? `${queueBadgeCountLabel} — tap to open Plan`
                        : t.id === 'home'
                          ? `${queueBadgeCountLabel} — tap to sync on Home`
                          : t.id === 'day'
                            ? `${queueBadgeCountLabel} — tap to sync on Day`
                            : t.id === 'cards'
                              ? `${queueBadgeCountLabel} — tap to open Home`
                              : undefined
                    }
                    onClick={
                      t.id === 'log'
                        ? (e) => {
                            e.stopPropagation();
                            setOpenLogMealPlan(true);
                            handleTabChange('log');
                          }
                        : t.id === 'cards'
                          ? (e) => {
                              e.stopPropagation();
                              navigateMealPlanSyncSource('home');
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
          );})}
        </nav>
      )}
    </div>
  );
}

export default App;
