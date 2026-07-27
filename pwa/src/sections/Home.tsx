import { useHomeSection } from '../hooks/useHomeSection';
import { HomeMealPlanBlock } from '../components/HomeMealPlanBlock';
import { HomeSummaryTiles } from '../components/HomeSummaryTiles';
import { HomeActivityRingsCard } from '../components/HomeActivityRingsCard';
import { HomeMacrosCard } from '../components/HomeMacrosCard';
import { HomeCalorieTrendCard } from '../components/HomeCalorieTrendCard';
import { HomeHabitTrendCard } from '../components/HomeHabitTrendCard';
import { HomeDecisionCard } from '../components/HomeDecisionCard';
import { HomeReportsPanel } from '../components/HomeReportsPanel';
import { HomeMealPhotosPanel } from '../components/HomeMealPhotosPanel';
import { FoodFailedBanner } from '../components/FoodFailedBanner';
import { FoodQueueBanner } from '../components/FoodQueueBanner';
import { HomeSavedRecipeCard } from '../components/HomeSavedRecipeCard';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';
import type { CSSProperties } from 'react';

interface HomeProps {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
  scrollToMealPlanQueue?: number;
}

export function Home(props: HomeProps) {
  const h = useHomeSection(props);

  return (
    <section className="section home-section" aria-labelledby="home-heading">
      {(h.pullProgress > 0 || h.refreshing) && (
        <div
          className="pull-refresh-indicator"
          role="status"
          aria-live="polite"
          style={{ '--pull-progress': h.pullProgress } as CSSProperties}
        >
          {h.refreshing ? 'Refreshing…' : h.pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      )}
      <div className="home-header-row">
        <div>
          <p className="section-eyebrow">Summary</p>
          <h1 id="home-heading">Today</h1>
          <p className="muted">Your health dashboard</p>
        </div>
        <button
          type="button"
          className="btn-pill btn-pill-outline home-refresh-btn"
          disabled={h.refreshing}
          aria-label="Refresh dashboard"
          title="Refresh dashboard (R)"
          onClick={() => void h.triggerRefresh()}
        >
          {h.refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {!h.serverOnline && (
        <div className="banner banner-warn banner-revolut" role="alert">Server offline — connect to sync.</div>
      )}

      <FoodQueueBanner
        queuedCount={h.queuedCount}
        queueSyncClearedToken={h.queueSyncClearedToken}
        onDismiss={h.dismissAllQueued}
      />

      <FoodFailedBanner failedCount={h.failedCount} onRetryAll={() => h.retryAllFailed()} />

      <HomeMealPlanBlock
        serverOnline={h.serverOnline}
        onNavigateMealPlanSyncSource={h.onNavigateMealPlanSyncSource}
        scrollToMealPlanQueue={h.scrollToMealPlanQueue}
        mealPlan={h.mealPlan}
        mealPlanMessage={h.mealPlanMessage}
        syncingMealPlanQueue={h.mealPlanShell.syncingMealPlanQueue}
        mealPlanQueue={h.mealPlanShell.mealPlanQueue}
        mealPlanSyncProgress={h.mealPlanShell.mealPlanSyncProgress}
        failedMealPlanIds={h.mealPlanShell.failedMealPlanIds}
        retryingMealPlanId={h.mealPlanShell.retryingMealPlanId}
        loggingMealKey={h.mealPlanShell.loggingMealKey}
        loggingMeals={h.mealPlanShell.loggingMeals}
        mealPlanUndo={h.mealPlanShell.mealPlanUndo}
        mealPlanUndoing={h.mealPlanShell.mealPlanUndoing}
        onFlushQueue={() => void h.mealPlanShell.flushMealPlanQueue()}
        onRetryFailed={() => void h.mealPlanShell.retryFailedMealPlanQueue()}
        onRetryItem={(item) => void h.mealPlanShell.retryMealPlanItem(item)}
        onDismissItem={h.mealPlanShell.dismissMealPlanItem}
        onClearAll={h.mealPlanShell.clearMealPlanQueue}
        onLogEntry={h.mealPlanShell.logMealPlanEntry}
        onLogAll={h.mealPlanShell.logAllMealPlan}
        onMealPlanUndo={h.onMealPlanUndo}
        onDismissMealPlanUndo={h.mealPlanShell.dismissMealPlanUndo}
      />

      <HomeReportsPanel
        serverOnline={h.serverOnline}
        exporting={h.exporting}
        onExport={() => void h.handleExportWeekPdf()}
      />

      <HomeActivityRingsCard
        loading={h.dashboardLoading}
        serverOnline={h.serverOnline}
        sharing={h.sharingRings}
        protein={h.food?.protein_g ?? 0}
        proteinTarget={h.proteinTarget}
        calories={h.food?.calories ?? 0}
        calTarget={h.calTarget}
        habitsPct={h.habitPct}
        burn={h.burn}
        onShare={() => void h.handleShareRings()}
      />

      <HomeSummaryTiles
        loading={h.dashboardLoading && h.serverOnline}
        calories={h.food?.calories}
        calTarget={h.calTarget}
        protein={h.food?.protein_g}
        proteinTarget={h.proteinTarget}
        habitsPct={h.habitPct}
        calorieTrend={h.calorieTrend}
        habitsTrend={h.habitsTrend}
      />

      <HomeMacrosCard
        protein={h.food?.protein_g ?? 0}
        proteinTarget={h.proteinTarget}
        carbs={h.food?.carbs ?? 0}
        fat={h.food?.fat ?? 0}
      />

      <HomeSavedRecipeCard
        serverOnline={h.serverOnline}
        onFoodUpdated={h.setFood}
        onError={h.setError}
        logging={h.recipeLogging}
        onLogItem={(food, quantityG) => h.logItem(food, quantityG)}
        onLogEntireRecipe={() => void h.logEntireRecipe()}
      />
      {h.recipeMessage && (
        <p className="banner banner-ok banner-revolut" role="status">{h.recipeMessage}</p>
      )}

      <HomeMealPhotosPanel photos={h.mealPhotos} />

      <HomeCalorieTrendCard days={h.history} />

      <HomeHabitTrendCard habitWeek={h.habitWeek} />

      {h.decisionCard && (
        <HomeDecisionCard
          card={h.decisionCard}
          onSwipe={(dir) => {
            if (dir === 'right') void h.handleAcceptCard();
            else if (dir === 'left' || dir === 'up') h.setDecisionCard(null);
          }}
        />
      )}

      {h.error && <div className="banner banner-warn banner-revolut" role="alert">{h.error}</div>}
    </section>
  );
}
