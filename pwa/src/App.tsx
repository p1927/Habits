import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import type { TabId } from './lib/config';
import type { MealPlanSyncSource } from './lib/mealPlanQueue';
import { getMealPlanQueueLastSource, mealPlanQueueSourceLabel } from './lib/mealPlanQueue';
import { useMealNotifications } from './hooks/useMealNotifications';
import { useMealPlanQueueCount } from './hooks/useMealPlanQueueCount';
import { useMealPlanQueueRemoteSync } from './lib/mealPlanQueueRemoteSyncStore';
import { useMealPlanQueueScroll } from './hooks/useMealPlanQueueScroll';
import { bindNotificationNavigation } from './lib/notificationNavigation';
import { useServerStatus } from './hooks/useServerStatus';
import { Home } from './sections/Home';
import './App.css';

const Log = lazy(async () => ({ default: (await import('./sections/Log')).Log }));
const Day = lazy(async () => ({ default: (await import('./sections/Day')).Day }));
const Cards = lazy(async () => ({ default: (await import('./sections/Cards')).Cards }));
const Agent = lazy(async () => ({ default: (await import('./sections/Agent')).Agent }));
const Settings = lazy(async () => ({ default: (await import('./sections/Settings')).Settings }));

const TAB_CHUNK_PRELOAD: Partial<Record<TabId, () => Promise<unknown>>> = {
  log: () => import('./sections/Log'),
  day: () => import('./sections/Day'),
  cards: () => import('./sections/Cards'),
  agent: () => import('./sections/Agent'),
  settings: () => import('./sections/Settings'),
};

const preloadedTabs = new Set<TabId>();

function preloadTabChunk(id: TabId) {
  if (preloadedTabs.has(id)) return;
  const load = TAB_CHUNK_PRELOAD[id];
  if (!load) return;
  preloadedTabs.add(id);
  void load();
}

function TabSectionFallback() {
  return (
    <div className="section-loading muted" role="status" aria-live="polite">
      Loading…
    </div>
  );
}

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
  const mealPlanRemoteSync = useMealPlanQueueRemoteSync('external');
  const mealPlanSyncSourceHint =
    mealPlanRemoteSync?.syncing
      ? ` — syncing on ${mealPlanQueueSourceLabel(mealPlanRemoteSync.source)}`
      : '';

  const handleTabChange = useCallback((id: TabId) => {
    setTab(id);
    window.location.hash = id;
  }, []);

  const { scrollToken: mealPlanQueueScrollToken, scrollToMealPlanQueue } = useMealPlanQueueScroll(
    handleTabChange,
    { onBeforeLogScroll: () => setOpenLogMealPlan(true) },
  );

  const navigateMealPlanSyncSource = useCallback(
    (source: MealPlanSyncSource) => {
      scrollToMealPlanQueue(source, { openLogPlan: source === 'log' });
    },
    [scrollToMealPlanQueue],
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

  useEffect(() => {
    const id = window.requestIdleCallback?.(() => {
      preloadTabChunk('log');
      preloadTabChunk('day');
    }) ?? window.setTimeout(() => {
      preloadTabChunk('log');
      preloadTabChunk('day');
    }, 1200);
    return () => {
      if (typeof id === 'number' && window.cancelIdleCallback) {
        window.cancelIdleCallback(id);
      } else {
        window.clearTimeout(id);
      }
    };
  }, []);

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
            onPointerEnter={() => preloadTabChunk('settings')}
            onFocus={() => preloadTabChunk('settings')}
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
        <div className="banner banner-warn banner-revolut" role="alert">
          API URL not configured. Set VITE_HABITS_API_URL in GitHub secrets or pwa/.env.development.
        </div>
      )}

      {status === 'online-unauthorized' && (
        <div className="banner banner-warn banner-revolut" role="alert">
          Server reachable — paste your bearer token in Settings.
        </div>
      )}

      <main className="main" id="main-content" role="main">
        <Suspense fallback={<TabSectionFallback />}>
        {tab === 'home' && (
          <Home
            serverOnline={serverOnline}
            onNavigateMealPlanSyncSource={navigateMealPlanSyncSource}
            scrollToMealPlanQueue={mealPlanQueueScrollToken}
          />
        )}
        {tab === 'log' && (
          <Log
            serverOnline={serverOnline}
            openMealPlan={openLogMealPlan}
            onMealPlanOpened={() => setOpenLogMealPlan(false)}
            onNavigateMealPlanSyncSource={navigateMealPlanSyncSource}
            scrollToMealPlanQueue={mealPlanQueueScrollToken}
          />
        )}
        {tab === 'day' && (
          <Day
            serverOnline={serverOnline}
            onNavigateMealPlanSyncSource={navigateMealPlanSyncSource}
            scrollToMealPlanQueue={mealPlanQueueScrollToken}
          />
        )}
        {tab === 'cards' && (
          <Cards serverOnline={serverOnline} onNavigateMealPlanSyncSource={navigateMealPlanSyncSource} />
        )}
        {tab === 'agent' && (
          <Agent
            serverOnline={serverOnline}
            onNavigateMealPlanSyncSource={navigateMealPlanSyncSource}
          />
        )}
        {tab === 'settings' && (
          <Settings
            serverOnline={serverOnline}
            googleConnected={googleConnected}
            onBearerSaved={() => void refresh()}
            oauthSuccess={oauthSuccess}
            onDismissOauth={() => setOauthSuccess(false)}
          />
        )}
        </Suspense>
      </main>

      {tab !== 'settings' && (
        <nav className="tab-bar" aria-label="Main">
          {TABS.map((t) => {
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
              onPointerEnter={() => preloadTabChunk(t.id)}
              onFocus={() => preloadTabChunk(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              aria-label={showQueueBadge ? `${t.label}, ${queueBadgeCountLabel}` : t.label}
            >
              <span className="tab-icon-wrap">
                <span className="tab-icon" aria-hidden>{t.icon}</span>
                {showQueueBadge && (
                  <span
                    className={`tab-badge${mealPlanFailedCount > 0 ? ' tab-badge--failed' : ''}${mealPlanBadgePulse ? ' tab-badge--pulse' : ''}${queueBadgeActionable ? ' tab-badge--actionable' : ''}`}
                    aria-label={queueBadgeCountLabel}
                    title={
                      t.id === 'log'
                        ? `${queueBadgeCountLabel} — tap to open Plan queue`
                        : t.id === 'home'
                          ? `${queueBadgeCountLabel} — tap to open queue`
                          : t.id === 'day'
                            ? `${queueBadgeCountLabel} — tap to open queue`
                            : t.id === 'cards'
                              ? `${queueBadgeCountLabel} — tap to open ${mealPlanQueueSourceLabel(cardsQueueTarget)} queue`
                              : t.id === 'agent'
                                ? `${queueBadgeCountLabel} — tap to open ${mealPlanQueueSourceLabel(cardsQueueTarget)} queue`
                                : undefined
                    }
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
          );})}
        </nav>
      )}
    </div>
  );
}

export default App;
