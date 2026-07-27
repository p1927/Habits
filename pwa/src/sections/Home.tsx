import { useRef, useState, type CSSProperties } from 'react';
import { UndoToast } from '../components/UndoToast';
import { MealPlanQueueSection } from '../components/MealPlanQueueSection';
import { MealPlanSyncAwarenessSlot } from '../components/MealPlanSyncAwarenessSlot';
import { MealPlanTodayCard } from '../components/MealPlanTodayCard';
import { HomeSummaryTiles } from '../components/HomeSummaryTiles';
import { HomeActivityRingsCard } from '../components/HomeActivityRingsCard';
import { HomeMacrosCard } from '../components/HomeMacrosCard';
import { HomeCalorieTrendCard } from '../components/HomeCalorieTrendCard';
import { HomeHabitTrendCard } from '../components/HomeHabitTrendCard';
import { HomeDecisionCard } from '../components/HomeDecisionCard';
import { HomeReportsPanel } from '../components/HomeReportsPanel';
import { HomeMealPhotosPanel } from '../components/HomeMealPhotosPanel';
import { useHomeDashboard } from '../hooks/useHomeDashboard';
import { useMealPlanShell } from '../hooks/useMealPlanShell';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

interface HomeProps {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
  scrollToMealPlanQueue?: number;
}

export function Home({ serverOnline, onNavigateMealPlanSyncSource, scrollToMealPlanQueue }: HomeProps) {
  const [mealPlanMessage, setMealPlanMessage] = useState('');
  const syncMealPlanQueueRef = useRef<() => void>(() => {});

  const {
    food,
    setFood,
    history,
    calTarget,
    habitWeek,
    decisionCard,
    setDecisionCard,
    error,
    setError,
    exporting,
    sharingRings,
    mealPhotos,
    mealPlan,
    dashboardLoading,
    refresh,
    pullProgress,
    refreshing,
    triggerRefresh,
    proteinTarget,
    habitPct,
    burn,
    calorieTrend,
    habitsTrend,
    handleShareRings,
    handleExportWeekPdf,
    handleAcceptCard,
  } = useHomeDashboard({
    serverOnline,
    syncMealPlanQueue: () => syncMealPlanQueueRef.current(),
  });

  const {
    mealPlanUndo,
    mealPlanUndoing,
    dismissMealPlanUndo,
    handleMealPlanUndo,
    mealPlanQueue,
    syncingMealPlanQueue,
    mealPlanSyncProgress,
    failedMealPlanIds,
    retryingMealPlanId,
    syncMealPlanQueue,
    flushMealPlanQueue,
    retryFailedMealPlanQueue,
    retryMealPlanItem,
    dismissMealPlanItem,
    loggingMealKey,
    loggingMeals,
    logMealPlanEntry,
    logAllMealPlan,
    clearMealPlanQueue,
  } = useMealPlanShell({
    serverOnline,
    syncSource: 'home',
    setMessage: setMealPlanMessage,
    setError,
    watchFocus: true,
    watchQueueChanges: true,
    food,
    onFoodUpdated: setFood,
    afterSync: () => void refresh(),
    onAfterLog: () => void refresh(),
  });

  syncMealPlanQueueRef.current = syncMealPlanQueue;

  return (
    <section className="section home-section" aria-labelledby="home-heading">
      {(pullProgress > 0 || refreshing) && (
        <div
          className="pull-refresh-indicator"
          role="status"
          aria-live="polite"
          style={{ '--pull-progress': pullProgress } as CSSProperties}
        >
          {refreshing ? 'Refreshing…' : pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
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
          className="btn-small home-refresh-btn"
          disabled={refreshing}
          aria-label="Refresh dashboard"
          title="Refresh dashboard (R)"
          onClick={() => void triggerRefresh()}
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {!serverOnline && (
        <div className="banner banner-warn" role="alert">Server offline — connect to sync.</div>
      )}

      <MealPlanSyncAwarenessSlot
        viewer="home"
        onNavigate={onNavigateMealPlanSyncSource}
        localSyncing={syncingMealPlanQueue}
      />

      <MealPlanQueueSection
        hasMealPlan={mealPlan.length > 0}
        serverOnline={serverOnline}
        queue={mealPlanQueue}
        syncing={syncingMealPlanQueue}
        syncProgress={mealPlanSyncProgress}
        failedIds={failedMealPlanIds}
        retryingId={retryingMealPlanId}
        variant="home"
        scrollToQueueToken={scrollToMealPlanQueue}
        noPlanToday={mealPlan.length === 0}
        bannerSuffix={mealPlan.length === 0 ? ' — no meals planned today' : ''}
        onSyncAll={() => void flushMealPlanQueue()}
        onRetryFailed={() => void retryFailedMealPlanQueue()}
        onRetry={(item) => void retryMealPlanItem(item)}
        onDismissItem={dismissMealPlanItem}
        onClearAll={clearMealPlanQueue}
      />

      <HomeReportsPanel
        serverOnline={serverOnline}
        exporting={exporting}
        onExport={() => void handleExportWeekPdf()}
      />

      <HomeActivityRingsCard
        loading={dashboardLoading}
        serverOnline={serverOnline}
        sharing={sharingRings}
        protein={food?.protein_g ?? 0}
        proteinTarget={proteinTarget}
        calories={food?.calories ?? 0}
        calTarget={calTarget}
        habitsPct={habitPct}
        burn={burn}
        onShare={() => void handleShareRings()}
      />

      <HomeSummaryTiles
        loading={dashboardLoading && serverOnline}
        calories={food?.calories}
        calTarget={calTarget}
        protein={food?.protein_g}
        proteinTarget={proteinTarget}
        habitsPct={habitPct}
        calorieTrend={calorieTrend}
        habitsTrend={habitsTrend}
      />

      <HomeMacrosCard
        protein={food?.protein_g ?? 0}
        proteinTarget={proteinTarget}
        carbs={food?.carbs ?? 0}
        fat={food?.fat ?? 0}
      />

      <MealPlanTodayCard
        mealPlan={mealPlan}
        loggingMealKey={loggingMealKey}
        loggingMeals={loggingMeals}
        onLogEntry={logMealPlanEntry}
        onLogAll={logAllMealPlan}
        hideWhenEmpty
        message={mealPlanMessage}
        hideMessage={!!mealPlanUndo}
        className="home-meal-plan-card"
        logAllClassName="home-meal-plan-log-all"
        disableLogAllWhenItemLogging
      />

      <HomeMealPhotosPanel photos={mealPhotos} />

      <HomeCalorieTrendCard days={history} />

      <HomeHabitTrendCard habitWeek={habitWeek} />

      {decisionCard && (
        <HomeDecisionCard
          card={decisionCard}
          onSwipe={(dir) => {
            if (dir === 'right') void handleAcceptCard();
            else if (dir === 'left' || dir === 'up') setDecisionCard(null);
          }}
        />
      )}

      {error && <div className="banner banner-warn" role="alert">{error}</div>}
      {mealPlanUndo && (
        <UndoToast
          message={`Logged ${mealPlanUndo.label}`}
          onUndo={() => void handleMealPlanUndo(() => {
            setMealPlanMessage('Log undone');
            void refresh();
          })}
          onDismiss={dismissMealPlanUndo}
          undoing={mealPlanUndoing}
        />
      )}
    </section>
  );
}
