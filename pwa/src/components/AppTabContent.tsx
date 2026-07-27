import { Suspense } from 'react';
import { Home } from '../sections/Home';
import { Agent, Cards, Day, Log, Settings } from '../lib/appTabPreload';
import type { AppShellState } from '../hooks/useAppShell';
import { TabSectionFallback } from './TabSectionFallback';

type AppTabContentProps = Pick<
  AppShellState,
  | 'tab'
  | 'serverOnline'
  | 'googleConnected'
  | 'oauthSuccess'
  | 'setOauthSuccess'
  | 'openLogMealPlan'
  | 'setOpenLogMealPlan'
  | 'openLogHistory'
  | 'setOpenLogHistory'
  | 'openLogRecipes'
  | 'setOpenLogRecipes'
  | 'mealPlanQueueScrollToken'
  | 'navigateMealPlanSyncSource'
  | 'navigateLogHistory'
  | 'navigateLogRecipes'
  | 'refresh'
>;

export function AppTabContent({
  tab,
  serverOnline,
  googleConnected,
  oauthSuccess,
  setOauthSuccess,
  openLogMealPlan,
  setOpenLogMealPlan,
  openLogHistory,
  setOpenLogHistory,
  openLogRecipes,
  setOpenLogRecipes,
  mealPlanQueueScrollToken,
  navigateMealPlanSyncSource,
  navigateLogHistory,
  navigateLogRecipes,
  refresh,
}: AppTabContentProps) {
  return (
    <Suspense fallback={<TabSectionFallback />}>
      {tab === 'home' && (
        <Home
          serverOnline={serverOnline}
          onNavigateMealPlanSyncSource={navigateMealPlanSyncSource}
          onOpenLogHistory={navigateLogHistory}
          onOpenLogRecipes={navigateLogRecipes}
          scrollToMealPlanQueue={mealPlanQueueScrollToken}
        />
      )}
      {tab === 'log' && (
        <Log
          serverOnline={serverOnline}
          openMealPlan={openLogMealPlan}
          onMealPlanOpened={() => setOpenLogMealPlan(false)}
          openLogHistory={openLogHistory}
          onLogHistoryOpened={() => setOpenLogHistory(false)}
          openLogRecipes={openLogRecipes}
          onLogRecipesOpened={() => setOpenLogRecipes(false)}
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
  );
}
