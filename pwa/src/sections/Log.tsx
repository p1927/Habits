import { FoodFailedBanner } from '../components/FoodFailedBanner';
import { FoodQueueBanner } from '../components/FoodQueueBanner';
import { LogStatusShell } from '../components/LogStatusShell';
import { LogSubTabs } from '../components/LogSubTabs';
import { LogTabPanels } from '../components/LogTabPanels';
import { MealPlanSyncAwarenessSlot } from '../components/MealPlanSyncAwarenessSlot';
import { RecipeScanQueueSection } from '../components/RecipeScanQueueSection';
import { useLogSection } from '../hooks/useLogSection';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

interface LogProps {
  serverOnline: boolean;
  openMealPlan?: boolean;
  onMealPlanOpened?: () => void;
  openLogHistory?: boolean;
  onLogHistoryOpened?: () => void;
  openLogType?: boolean;
  onLogTypeOpened?: () => void;
  openLogRecipes?: boolean;
  onLogRecipesOpened?: () => void;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
  scrollToMealPlanQueue?: number;
  scrollToFoodQueue?: number;
  onNavigateFoodQueuePending?: () => void;
  // relay-232: Ask Coach handoff from the totals strip. When provided, the
  // strip renders its "Ask Coach" button; the caller is expected to
  // navigate to the Agent tab and prefill the composer with the prompt.
  // Mirrors the Day section's onAgentSchedulePrompt pattern.
  onAskCoach?: (prompt: string) => void;
}

export function Log({
  serverOnline,
  openMealPlan,
  onMealPlanOpened,
  openLogHistory,
  onLogHistoryOpened,
  openLogType,
  onLogTypeOpened,
  openLogRecipes,
  onLogRecipesOpened,
  onNavigateMealPlanSyncSource,
  scrollToMealPlanQueue,
  scrollToFoodQueue,
  onNavigateFoodQueuePending,
  onAskCoach,
}: LogProps) {
  const {
    tab,
    setTab,
    showShortcutHint,
    dismissShortcutHint,
    queuedCount,
    failedCount,
    queueSyncClearedToken,
    dismissFoodLogQueue,
    retryAllFailed,
    recipeScanQueue,
    recipeScanQueueSyncClearedToken,
    dismissRecipeScanQueue,
    tabPanels,
    statusShell,
  } = useLogSection({
    serverOnline,
    openMealPlan,
    onMealPlanOpened,
    openLogHistory,
    onLogHistoryOpened,
    openLogType,
    onLogTypeOpened,
    openLogRecipes,
    onLogRecipesOpened,
    scrollToMealPlanQueue,
    scrollToFoodQueue,
    onAskCoach,
  });

  return (
    <section className="section log-section" aria-labelledby="log-heading">
      <p className="section-eyebrow">Food log</p>
      <h1 id="log-heading">Log Food</h1>
      <p className="muted">Scan, type, or review history</p>

      <FoodQueueBanner
        queuedCount={queuedCount}
        queueSyncClearedToken={queueSyncClearedToken}
        onDismiss={dismissFoodLogQueue}
        onFocusQueue={onNavigateFoodQueuePending}
      />

      <FoodFailedBanner failedCount={failedCount} onRetryAll={() => retryAllFailed()} />

      <RecipeScanQueueSection
        queue={recipeScanQueue}
        queueSyncClearedToken={recipeScanQueueSyncClearedToken}
        onDismiss={dismissRecipeScanQueue}
      />

      <MealPlanSyncAwarenessSlot
        viewer="log"
        onNavigate={onNavigateMealPlanSyncSource}
        visible={tab !== 'mealplan'}
        showOwnSource={tab !== 'mealplan'}
      />

      <LogSubTabs
        tab={tab}
        onTabChange={setTab}
        showShortcutHint={showShortcutHint}
        onDismissShortcutHint={dismissShortcutHint}
      />

      <LogTabPanels tab={tab} serverOnline={serverOnline} {...tabPanels} />

      <LogStatusShell {...statusShell} />
    </section>
  );
}
