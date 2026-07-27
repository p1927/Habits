import { AppHeader } from './components/AppHeader';
import { AppStatusBanners } from './components/AppStatusBanners';
import { AppTabBar } from './components/AppTabBar';
import { AppTabContent } from './components/AppTabContent';
import { useAppShell } from './hooks/useAppShell';
import { useAppTabShortcuts } from './hooks/useAppTabShortcuts';
import { useSettingsOpenShortcut } from './hooks/useSettingsOpenShortcut';
import './App.css';

function App() {
  const shell = useAppShell();
  const { showShortcutHint, dismissShortcutHint, openSettings } = useSettingsOpenShortcut(() => {
    shell.preloadTab('settings');
    shell.handleTabChange('settings');
  });
  const { showShortcutHint: showTabShortcutHint, dismissShortcutHint: dismissTabShortcutHint } =
    useAppTabShortcuts(shell.tab, shell.handleTabChange, shell.preloadTab);

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <AppHeader
        status={shell.status}
        onOpenSettings={openSettings}
        onPreloadSettings={() => shell.preloadTab('settings')}
        showShortcutHint={showShortcutHint}
        onDismissShortcutHint={dismissShortcutHint}
      />
      <AppStatusBanners status={shell.status} />
      <main className="main" id="main-content" role="main">
        <AppTabContent {...shell} />
      </main>
      <AppTabBar
        {...shell}
        showShortcutHint={showTabShortcutHint}
        onDismissShortcutHint={dismissTabShortcutHint}
      />
    </div>
  );
}

export default App;
