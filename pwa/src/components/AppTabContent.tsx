import { Suspense } from 'react';
import { Home } from '../sections/Home';
import { Agent, Cards, Day, FutureSelf, Log, Settings } from '../lib/appTabPreload';
import { AGENT_SCHEDULE_TODAY_PROMPT } from '../lib/agentSectionShared';
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
  | 'openLogType'
  | 'setOpenLogType'
  | 'openLogRecipes'
  | 'setOpenLogRecipes'
  | 'mealPlanQueueScrollToken'
  | 'navigateMealPlanSyncSource'
  | 'navigateLogHistory'
  | 'navigateLogType'
  | 'navigateLogScan'
  | 'navigateLogRecipes'
  | 'navigateAgentPrompt'
  | 'navigateFutureSelf'
  | 'navigateHome'
  | 'foodQueueFocusToken'
  | 'navigateFoodQueuePending'
  | 'agentPrompt'
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
  openLogType,
  setOpenLogType,
  openLogRecipes,
  setOpenLogRecipes,
  mealPlanQueueScrollToken,
  navigateMealPlanSyncSource,
  navigateLogHistory,
  navigateLogType,
  navigateLogScan,
  navigateLogRecipes,
  navigateAgentPrompt,
  navigateFutureSelf,
  navigateHome,
  foodQueueFocusToken,
  navigateFoodQueuePending,
  agentPrompt,
  refresh,
}: AppTabContentProps) {
  return (
    <Suspense fallback={<TabSectionFallback />}>
      {tab === 'home' && (
        <Home
          serverOnline={serverOnline}
          onNavigateMealPlanSyncSource={navigateMealPlanSyncSource}
          onOpenLogHistory={navigateLogHistory}
          onOpenLogType={navigateLogType}
          onOpenLogScan={navigateLogScan}
          onOpenLogRecipes={navigateLogRecipes}
          onOpenFutureSelf={navigateFutureSelf}
          scrollToMealPlanQueue={mealPlanQueueScrollToken}
          onNavigateFoodQueuePending={navigateFoodQueuePending}
        />
      )}
      {tab === 'log' && (
        <Log
          serverOnline={serverOnline}
          openMealPlan={openLogMealPlan}
          onMealPlanOpened={() => setOpenLogMealPlan(false)}
          openLogHistory={openLogHistory}
          onLogHistoryOpened={() => setOpenLogHistory(false)}
          openLogType={openLogType}
          onLogTypeOpened={() => setOpenLogType(false)}
          openLogRecipes={openLogRecipes}
          onLogRecipesOpened={() => setOpenLogRecipes(false)}
          onNavigateMealPlanSyncSource={navigateMealPlanSyncSource}
          scrollToMealPlanQueue={mealPlanQueueScrollToken}
          scrollToFoodQueue={foodQueueFocusToken}
          onNavigateFoodQueuePending={navigateFoodQueuePending}
        />
      )}
      {tab === 'day' && (
        <Day
          serverOnline={serverOnline}
          onNavigateMealPlanSyncSource={navigateMealPlanSyncSource}
          scrollToMealPlanQueue={mealPlanQueueScrollToken}
          onAgentSchedulePrompt={(prompt) => navigateAgentPrompt(prompt ?? AGENT_SCHEDULE_TODAY_PROMPT)}
          onNavigateHome={navigateHome}
        />
      )}
      {tab === 'cards' && (
        <Cards serverOnline={serverOnline} onNavigateMealPlanSyncSource={navigateMealPlanSyncSource} />
      )}
      {tab === 'agent' && (
        <Agent
          serverOnline={serverOnline}
          onNavigateMealPlanSyncSource={navigateMealPlanSyncSource}
          agentPrompt={agentPrompt}
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
      {tab === 'futureself' && <FutureSelf serverOnline={serverOnline} />}
    </Suspense>
  );
}
