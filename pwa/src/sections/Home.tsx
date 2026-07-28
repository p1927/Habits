import { useHomeSection } from '../hooks/useHomeSection';
import { HomeDashboardPanels } from '../components/HomeDashboardPanels';
import { HomeMealPlanBlock } from '../components/HomeMealPlanBlock';
import { HomePullRefreshIndicator, HomeSectionHeader } from '../components/HomeSectionChrome';
import { HomeRingShareSheet } from '../components/HomeRingShareSheet';
import { FoodFailedBanner } from '../components/FoodFailedBanner';
import { FoodQueueBanner } from '../components/FoodQueueBanner';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

interface HomeProps {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
  onOpenLogHistory?: () => void;
  onOpenLogRecipes?: () => void;
  onOpenFutureSelf?: () => void;
  scrollToMealPlanQueue?: number;
  onNavigateFoodQueuePending?: () => void;
}

export function Home(props: HomeProps) {
  const h = useHomeSection(props);

  return (
    <section className="section home-section" aria-labelledby="home-heading">
      <HomePullRefreshIndicator pullProgress={h.pullProgress} refreshing={h.refreshing} />
      <HomeSectionHeader refreshing={h.refreshing} onRefresh={() => void h.triggerRefresh()} />

      {!h.serverOnline && (
        <div className="banner banner-warn banner-revolut" role="alert">
          Server offline — connect to sync.
        </div>
      )}

      <FoodQueueBanner
        queuedCount={h.queuedCount}
        queueSyncClearedToken={h.queueSyncClearedToken}
        onDismiss={h.dismissAllQueued}
        onFocusQueue={h.onNavigateFoodQueuePending}
      />

      <FoodFailedBanner failedCount={h.failedCount} onRetryAll={() => h.retryAllFailed()} />

      <HomeMealPlanBlock
        serverOnline={h.serverOnline}
        onNavigateMealPlanSyncSource={h.onNavigateMealPlanSyncSource}
        scrollToMealPlanQueue={h.scrollToMealPlanQueue}
        mealPlan={h.mealPlan}
        mealPlanMessage={h.mealPlanMessage}
        shell={h.mealPlanShell}
        onMealPlanUndo={h.onMealPlanUndo}
      />

      <HomeDashboardPanels {...h} />

      {h.error && (
        <div className="banner banner-warn banner-revolut" role="alert">
          {h.error}
        </div>
      )}

      <HomeRingShareSheet
        previewUrl={h.ringSharePreviewUrl}
        onClose={h.closeRingShareSheet}
        onDownload={() => void h.downloadRingShareFromSheet()}
      />
    </section>
  );
}
