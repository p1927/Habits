import { useCallback, useEffect, useState } from 'react';
import type { TabId } from './lib/config';
import { useServerStatus } from './hooks/useServerStatus';
import { FutureSelf } from './sections/FutureSelf';
import { Agent } from './sections/Agent';
import { Food } from './sections/Food';
import { Settings } from './sections/Settings';
import './App.css';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'future', label: 'Future', icon: '✦' },
  { id: 'agent', label: 'Agent', icon: '🎙' },
  { id: 'food', label: 'Food', icon: '🥗' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

function parseInitialTab(): TabId {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'settings' || hash === 'agent' || hash === 'food' || hash === 'future') {
    return hash;
  }
  return 'food';
}

function App() {
  const [tab, setTab] = useState<TabId>(parseInitialTab);
  const [oauthSuccess, setOauthSuccess] = useState(false);
  const { status, googleConnected, refresh } = useServerStatus();
  const serverOnline = status === 'online' || status === 'online-unauthorized';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google') === 'connected') {
      setTab('settings');
      setOauthSuccess(true);
      void refresh();
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash || '#settings'}`);
    }
  }, [refresh]);

  const handleTabChange = useCallback((id: TabId) => {
    setTab(id);
    window.location.hash = id;
  }, []);

  return (
    <div className="app">
      <header className="header">
        <span className="logo">Habits</span>
        <span className={`status-dot status-${status}`} title={status} />
      </header>

      {status === 'no-config' && (
        <div className="banner banner-warn">
          API URL not configured. Set VITE_HABITS_API_URL in GitHub secrets or pwa/.env.development.
        </div>
      )}

      {status === 'online-unauthorized' && (
        <div className="banner banner-warn">
          Server reachable — paste your bearer token in Settings.
        </div>
      )}

      <main className="main">
        {tab === 'future' && <FutureSelf serverOnline={serverOnline} />}
        {tab === 'agent' && <Agent serverOnline={serverOnline} />}
        {tab === 'food' && <Food serverOnline={serverOnline} />}
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

      <nav className="tab-bar" aria-label="Main">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? 'tab-active' : ''}`}
            onClick={() => handleTabChange(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
          >
            <span className="tab-icon" aria-hidden>{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
