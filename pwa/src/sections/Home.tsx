import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ActivityRings, ActivityRingsSkeleton } from '../components/ui/Ring';
import { Card } from '../components/ui/Card';
import { SwipeStack } from '../components/ui/SwipeStack';
import { MacroBar, Sparkline } from '../components/MacroChart';
import { MealPhotoGallery } from '../components/MealPhotoGallery';
import { UndoToast } from '../components/UndoToast';
import { MealPlanQueueEmptyHint } from '../components/MealPlanQueueEmptyHint';
import { MealPlanQueuePanel } from '../components/MealPlanQueuePanel';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useMealPlanUndo } from '../hooks/useMealPlanUndo';
import { useMealPlanQueueSync } from '../hooks/useMealPlanQueueSync';
import {
  api,
  ApiError,
  type FoodHistoryDay,
  type FoodTodayResponse,
  type FutureSelfCard,
  type HabitsTodayResponse,
  type HabitsWeekResponse,
} from '../lib/api';
import { getTodayMealPhotos, type MealPhoto } from '../lib/mealPhotos';
import { cacheHabitStreak, getCachedHabitStreak } from '../lib/habitQueue';
import {
  cacheMealPlan,
  clearMealPlanQueue,
  enqueueMealPlanLog,
  getCachedMealPlan,
  isOfflineError,
  type MealPlanEntry,
} from '../lib/mealPlanQueue';

interface HomeProps {
  serverOnline: boolean;
}

const METRICS = ['sleep', 'work', 'wasted', 'speak', 'game', 'read'] as const;
const MET_TARGETS: Record<string, number> = {
  sleep: 7,
  work: 4,
  read: 1,
  speak: 0.5,
  game: 0,
  wasted: 0,
};

const HABIT_SPARKLINES = [
  { key: 'sleep', label: 'Sleep', target: 7, color: 'var(--ring-habits)' },
  { key: 'work', label: 'Work', target: 4, color: 'var(--accent)' },
  { key: 'read', label: 'Read', target: 1, color: 'var(--ok)' },
  { key: 'speak', label: 'Speak', target: 0.5, color: 'var(--warn)' },
] as const;

function estimateBurn(habits: HabitsTodayResponse | null): number {
  if (!habits?.metrics) return 0;
  const work = habits.metrics.work ?? 0;
  const read = habits.metrics.read ?? 0;
  return Math.round(work * 3.5 * 70 + read * 1.3 * 70);
}

function habitCompletionPct(habits: HabitsTodayResponse | null): number {
  if (!habits?.metrics) return 0;
  let score = 0;
  let total = 0;
  for (const m of METRICS) {
    const target = MET_TARGETS[m];
    if (target <= 0) continue;
    total += 1;
    const val = habits.metrics[m] ?? 0;
    score += Math.min(val / target, 1);
  }
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

export function Home({ serverOnline }: HomeProps) {
  const [food, setFood] = useState<FoodTodayResponse | null>(null);
  const [habits, setHabits] = useState<HabitsTodayResponse | null>(null);
  const [history, setHistory] = useState<FoodHistoryDay[]>([]);
  const [calTarget, setCalTarget] = useState(2200);
  const [habitWeek, setHabitWeek] = useState<HabitsWeekResponse | null>(null);
  const [decisionCard, setDecisionCard] = useState<FutureSelfCard | null>(null);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [sharingRings, setSharingRings] = useState(false);
  const [mealPhotos, setMealPhotos] = useState<MealPhoto[]>(() => getTodayMealPhotos());
  const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>(() => getCachedMealPlan());
  const [mealPlanMessage, setMealPlanMessage] = useState('');
  const [loggingMealKey, setLoggingMealKey] = useState<string | null>(null);
  const [loggingMeals, setLoggingMeals] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const {
    undoLog: mealPlanUndo,
    undoing: mealPlanUndoing,
    dismissUndo: dismissMealPlanUndo,
    snapshotRows: snapshotFoodRows,
    offerUndoFromSummary,
    handleUndo: handleMealPlanUndo,
  } = useMealPlanUndo(serverOnline);

  const getFoodBeforeSync = useCallback(async () => food ?? (await api.getFoodToday()), [food]);
  const afterMealPlanSyncRef = useRef<() => void>(() => {});

  const {
    mealPlanQueue,
    syncingMealPlanQueue,
    mealPlanSyncProgress,
    failedMealPlanIds,
    retryingMealPlanId,
    syncMealPlanQueue,
    flushMealPlanQueue,
    retryMealPlanItem,
    dismissMealPlanItem,
    resetFailedIds,
  } = useMealPlanQueueSync({
    serverOnline,
    autoFlushOnMount: true,
    watchOnline: true,
    watchFocus: true,
    watchQueueChanges: true,
    getFoodBeforeSync,
    onFoodUpdated: setFood,
    afterSync: () => afterMealPlanSyncRef.current(),
    dismissMealPlanUndo,
    snapshotFoodRows,
    offerUndoFromSummary,
    onBatchSynced: (synced, offeredUndo) => {
      if (!offeredUndo) {
        setMealPlanMessage(`Synced ${synced} queued meal log${synced === 1 ? '' : 's'}`);
      }
    },
    onItemLogged: (label, offeredUndo) => {
      if (!offeredUndo) setMealPlanMessage(`Logged ${label}`);
    },
    onItemOffline: (label) => setMealPlanMessage(`${label} still queued — offline`),
    setError,
    clearError: () => setError(''),
  });

  const refresh = useCallback(async () => {
    setMealPhotos(getTodayMealPhotos());
    syncMealPlanQueue();
    if (!serverOnline) {
      setMealPlan(getCachedMealPlan());
      setDashboardLoading(false);
      return;
    }
    setError('');
    try {
      const [f, h, hist, targets, cards, week, streaks, mealPlanToday] = await Promise.all([
        api.getFoodToday(),
        api.getHabitsToday(),
        api.getFoodHistory(7),
        api.getFoodTargets(),
        api.getFutureSelfCards(true),
        api.getHabitsWeek(),
        api.getHabitStreaks(),
        api.getMealPlanToday(),
      ]);
      setFood(f);
      setHabits(h);
      setHistory(hist.days);
      setHabitWeek(week);
      cacheHabitStreak(streaks.overall);
      setMealPlan(mealPlanToday.meals ?? []);
      cacheMealPlan(mealPlanToday.meals ?? []);
      setCalTarget(targets.calorie_target ?? 2200);
      if (cards.cards.length > 0) {
        setDecisionCard(cards.cards[0]);
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setDashboardLoading(false);
    }
  }, [serverOnline, syncMealPlanQueue]);

  afterMealPlanSyncRef.current = () => {
    void refresh();
  };

  const { pullProgress, refreshing, triggerRefresh } = usePullToRefresh({
    onRefresh: refresh,
    enabled: true,
  });

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== 'r' && e.key !== 'R') return;
      const target = e.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) return;
      }
      e.preventDefault();
      void triggerRefresh();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [triggerRefresh]);

  const logMealPlanEntry = useCallback(
    (entry: MealPlanEntry) => {
      setLoggingMealKey(entry.meal);
      setMealPlanMessage('');
      setError('');
      dismissMealPlanUndo();

      if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
        enqueueMealPlanLog({
          kind: 'item',
          meal: entry.meal,
          label: entry.label,
          description: entry.description,
        });
        syncMealPlanQueue();
        setMealPlanMessage(`${entry.label} queued — will log when online`);
        setLoggingMealKey(null);
        return;
      }

      void (async () => {
        try {
          const before = food ?? (await api.getFoodToday());
          const res = await api.logMealPlanItem(entry.meal);
          if (!offerUndoFromSummary(snapshotFoodRows(before), res.summary, entry.label)) {
            setMealPlanMessage(res.message);
          }
          setFood(res.summary);
          void refresh();
        } catch (e) {
          if (isOfflineError(e)) {
            enqueueMealPlanLog({
              kind: 'item',
              meal: entry.meal,
              label: entry.label,
              description: entry.description,
            });
            syncMealPlanQueue();
            setMealPlanMessage(`${entry.label} queued — will log when online`);
            return;
          }
          setError(e instanceof Error ? e.message : 'Meal log failed');
        } finally {
          setLoggingMealKey(null);
        }
      })();
    },
    [serverOnline, refresh, syncMealPlanQueue, food, dismissMealPlanUndo, snapshotFoodRows, offerUndoFromSummary],
  );

  const logAllMealPlan = useCallback(() => {
    setLoggingMeals(true);
    setMealPlanMessage('');
    setError('');
    dismissMealPlanUndo();

    if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      enqueueMealPlanLog({ kind: 'all' });
      syncMealPlanQueue();
      setMealPlanMessage('All planned meals queued — will log when online');
      setLoggingMeals(false);
      return;
    }

    void (async () => {
      try {
        const before = food ?? (await api.getFoodToday());
        const res = await api.logMealPlanToday();
        if (!offerUndoFromSummary(snapshotFoodRows(before), res.summary, 'All planned meals')) {
          setMealPlanMessage(res.message);
        }
        setFood(res.summary);
        void refresh();
      } catch (e) {
        if (isOfflineError(e)) {
          enqueueMealPlanLog({ kind: 'all' });
          syncMealPlanQueue();
          setMealPlanMessage('All planned meals queued — will log when online');
          return;
        }
        setError(e instanceof Error ? e.message : 'Meal log failed');
      } finally {
        setLoggingMeals(false);
      }
    })();
  }, [serverOnline, refresh, syncMealPlanQueue, food, dismissMealPlanUndo, snapshotFoodRows, offerUndoFromSummary]);

  async function handleShareRings() {
    setSharingRings(true);
    setError('');
    try {
      let streakDays = getCachedHabitStreak();
      if (serverOnline) {
        try {
          const st = await api.getHabitStreaks();
          streakDays = st.overall;
          cacheHabitStreak(st.overall);
        } catch {
          /* use cached streak when fetch fails */
        }
      }
      const { downloadRingShareCard } = await import('../lib/ringShareCard');
      downloadRingShareCard({
        protein: { value: food?.protein_g ?? 0, max: proteinTarget },
        calories: { value: food?.calories ?? 0, max: calTarget },
        habits: { value: habitPct, max: 100 },
        date: habits?.date || new Date().toISOString().slice(0, 10),
        streakDays,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Share card export failed');
    } finally {
      setSharingRings(false);
    }
  }

  async function handleExportWeekPdf() {
    if (!serverOnline) return;
    setExporting(true);
    setError('');
    try {
      const [hist, week, streaks, targets] = await Promise.all([
        api.getFoodHistory(7),
        api.getHabitsWeek(),
        api.getHabitStreaks(),
        api.getFoodTargets(),
      ]);
      const { downloadWeekReportPdf } = await import('../lib/weekReportPdf');
      downloadWeekReportPdf({
        foodDays: hist.days,
        habitWeek: week,
        streaks,
        calorieTarget: targets.calorie_target ?? 2200,
        proteinTarget: targets.protein_target_g ?? 150,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'PDF export failed');
    } finally {
      setExporting(false);
    }
  }

  async function handleAcceptCard() {
    if (!decisionCard) return;
    try {
      await api.acceptFutureSelfCard(decisionCard.id);
      setDecisionCard(null);
      void refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Accept failed');
    }
  }

  const proteinTarget = food?.protein_target_g ?? 150;
  const habitPct = habitCompletionPct(habits);
  const burn = estimateBurn(habits);
  const hasPendingMealPlanQueue = mealPlanQueue.length > 0 || syncingMealPlanQueue;

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

      {hasPendingMealPlanQueue ? (
        <MealPlanQueuePanel
          serverOnline={serverOnline}
          queue={mealPlanQueue}
          syncing={syncingMealPlanQueue}
          syncProgress={mealPlanSyncProgress}
          failedIds={failedMealPlanIds}
          retryingId={retryingMealPlanId}
          variant="home"
          noPlanToday={mealPlan.length === 0}
          bannerSuffix={mealPlan.length === 0 ? ' — no meals planned today' : ''}
          onSyncAll={() => void flushMealPlanQueue()}
          onRetry={(item) => void retryMealPlanItem(item)}
          onDismissItem={dismissMealPlanItem}
          onClearAll={() => {
            clearMealPlanQueue();
            resetFailedIds();
            syncMealPlanQueue();
            setMealPlanMessage('Meal plan log queue cleared');
          }}
        />
      ) : mealPlan.length > 0 ? (
        <MealPlanQueueEmptyHint />
      ) : null}

      <Card className="home-export-card">
        <div className="home-export-row">
          <div>
            <h2>Weekly report</h2>
            <p className="muted">Download nutrition and habit summary as PDF</p>
          </div>
          <button
            type="button"
            className="btn-small"
            disabled={!serverOnline || exporting}
            onClick={() => void handleExportWeekPdf()}
          >
            {exporting ? 'Exporting…' : 'Export PDF'}
          </button>
        </div>
      </Card>

      <Card className="home-rings-card">
        <div className="home-export-row">
          <h2>Activity rings</h2>
          <button
            type="button"
            className="btn-small"
            disabled={sharingRings || dashboardLoading}
            onClick={() => void handleShareRings()}
          >
            {sharingRings ? 'Saving…' : 'Share PNG'}
          </button>
        </div>
        {dashboardLoading && serverOnline ? (
          <ActivityRingsSkeleton />
        ) : (
          <ActivityRings
            protein={{ value: food?.protein_g ?? 0, max: proteinTarget }}
            calories={{ value: food?.calories ?? 0, max: calTarget }}
            habits={{ value: habitPct, max: 100 }}
          />
        )}
        <p className="home-burn muted">Est. active burn: {burn} kcal (from work + read hours)</p>
      </Card>

      <Card className="home-macros-card">
        <h2>Macros today</h2>
        <MacroBar label="Protein" value={food?.protein_g ?? 0} target={proteinTarget} color="var(--ring-protein)" />
        <MacroBar label="Carbs" value={food?.carbs ?? 0} target={250} color="var(--carbs)" />
        <MacroBar label="Fat" value={food?.fat ?? 0} target={80} color="var(--fat)" />
      </Card>

      {mealPlan.length > 0 && (
        <Card className="home-meal-plan-card">
          <h2>Today&apos;s meal plan</h2>
          <p className="muted">From WEEK MEALS sheet</p>
          {mealPlanMessage && !mealPlanUndo && (
            <p className="banner banner-ok home-meal-plan-msg">{mealPlanMessage}</p>
          )}
          <ul className="food-list">
            {mealPlan.map((m) => (
              <li key={m.meal} className="food-row">
                <div>
                  <strong>{m.label}</strong>
                  <span className="muted">{m.description}</span>
                </div>
                <button
                  type="button"
                  className="btn-small"
                  disabled={loggingMealKey === m.meal}
                  aria-label={`Log ${m.label}`}
                  onClick={() => logMealPlanEntry(m)}
                >
                  {loggingMealKey === m.meal ? 'Logging…' : 'Log'}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="home-meal-plan-log-all"
            disabled={loggingMeals || !!loggingMealKey}
            onClick={logAllMealPlan}
          >
            {loggingMeals ? 'Logging…' : 'Log all planned meals'}
          </button>
        </Card>
      )}

      {mealPhotos.length > 0 && (
        <Card>
          <h2>Today&apos;s meal photos</h2>
          <p className="muted">From food scans on Log and Coach</p>
          <MealPhotoGallery photos={mealPhotos} />
        </Card>
      )}

      {history.length > 1 && (
        <Card>
          <h2>7-day calories</h2>
          <Sparkline data={history.map((d) => d.calories)} color="var(--ring-calories)" />
          <div className="sparkline-labels">
            {history.map((d) => (
              <span key={d.date}>{d.date.slice(5)}</span>
            ))}
          </div>
        </Card>
      )}

      {habitWeek && habitWeek.recent_days.length > 1 && (
        <Card>
          <h2>7-day habits</h2>
          <p className="muted">Daily hours vs your targets</p>
          <div className="habit-spark-grid">
            {HABIT_SPARKLINES.map(({ key, label, target, color }) => {
              const series = habitWeek.recent_days.map((d) => d.metrics[key] ?? 0);
              const avg = habitWeek.averages[key];
              return (
                <div key={key} className="habit-spark-row">
                  <div className="habit-spark-header">
                    <span>{label}</span>
                    <span className="muted">
                      avg {avg != null ? `${avg}h` : '—'} / {target}h
                    </span>
                  </div>
                  <Sparkline data={series} color={color} height={36} />
                  <div className="sparkline-labels">
                    {habitWeek.recent_days.map((d) => (
                      <span key={d.date}>{d.date.slice(5)}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {decisionCard && (
        <Card className="decision-card-wrap decision-card-wrap--elevated">
          <p className="decision-card-eyebrow">Future self</p>
          <h2>Today&apos;s decision</h2>
          {decisionCard.image_url && (
            <img
              src={decisionCard.image_url}
              alt={decisionCard.title ? `Illustration for ${decisionCard.title}` : 'Decision card illustration'}
              className="decision-card-img"
            />
          )}
          <SwipeStack
            label="Future self decision card"
            onSwipe={(dir) => {
              if (dir === 'right') void handleAcceptCard();
              else if (dir === 'left' || dir === 'up') setDecisionCard(null);
            }}
            hintRight="Accept"
            hintLeft="Decline"
            hintUp="Skip"
          >
            <div className="decision-card-inner">
              <h3>{decisionCard.title}</h3>
              <p className="muted">{decisionCard.accept_action}</p>
            </div>
          </SwipeStack>
        </Card>
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
