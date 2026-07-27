import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { ActivityRings, ActivityRingsSkeleton } from '../components/ui/Ring';
import { Card } from '../components/ui/Card';
import { SwipeStack } from '../components/ui/SwipeStack';
import { MacroBar, Sparkline } from '../components/MacroChart';
import { MealPhotoGallery } from '../components/MealPhotoGallery';
import { UndoToast } from '../components/UndoToast';
import { MealPlanQueueEmptyHint } from '../components/MealPlanQueueEmptyHint';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useMealPlanUndo } from '../hooks/useMealPlanUndo';
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
  getMealPlanQueue,
  isOfflineError,
  MEAL_PLAN_QUEUE_CHANGE,
  removeMealPlanQueueItem,
  type MealPlanEntry,
  type QueuedMealPlanLog,
} from '../lib/mealPlanQueue';

interface HomeProps {
  serverOnline: boolean;
}

function mealPlanQueueLabel(item: QueuedMealPlanLog): string {
  if (item.kind === 'all') return 'All planned meals';
  return item.label ?? item.meal ?? 'Meal';
}

function mealPlanSyncUndoLabel(synced: number, labels: string[]): string {
  if (synced === 1) return labels[0] ?? 'Queued meal';
  return `${synced} queued meal logs`;
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
  const [mealPlanQueue, setMealPlanQueue] = useState<QueuedMealPlanLog[]>(() => getMealPlanQueue());
  const [syncingMealPlanQueue, setSyncingMealPlanQueue] = useState(false);
  const [mealPlanSyncProgress, setMealPlanSyncProgress] = useState<{ done: number; total: number } | null>(null);
  const [failedMealPlanIds, setFailedMealPlanIds] = useState<Set<string>>(() => new Set());
  const [retryingMealPlanId, setRetryingMealPlanId] = useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const syncMealPlanQueue = useCallback(() => {
    setMealPlanQueue(getMealPlanQueue());
  }, []);

  const {
    undoLog: mealPlanUndo,
    undoing: mealPlanUndoing,
    dismissUndo: dismissMealPlanUndo,
    snapshotRows: snapshotFoodRows,
    offerUndoFromSummary,
    handleUndo: handleMealPlanUndo,
  } = useMealPlanUndo(serverOnline);

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

  const syncOneMealPlanItem = useCallback(
    async (item: QueuedMealPlanLog): Promise<FoodTodayResponse | null> => {
      let summary: FoodTodayResponse | null = null;
      if (item.kind === 'all') {
        summary = (await api.logMealPlanToday()).summary;
      } else if (item.meal) {
        summary = (await api.logMealPlanItem(item.meal)).summary;
      } else {
        return null;
      }
      removeMealPlanQueueItem(item.id);
      setFailedMealPlanIds((prev) => {
        if (!prev.has(item.id)) return prev;
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      return summary;
    },
    [],
  );

  const flushMealPlanQueue = useCallback(async () => {
    if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
    const queue = getMealPlanQueue();
    if (!queue.length) return;

    setSyncingMealPlanQueue(true);
    setError('');
    dismissMealPlanUndo();
    const total = queue.length;
    setMealPlanSyncProgress({ done: 0, total });
    let synced = 0;
    const labels: string[] = [];
    let lastSummary: FoodTodayResponse | null = null;

    try {
      const before = food ?? (await api.getFoodToday());
      const beforeRows = snapshotFoodRows(before);

      for (const item of queue) {
        try {
          const summary = await syncOneMealPlanItem(item);
          if (summary) {
            lastSummary = summary;
            synced += 1;
            labels.push(mealPlanQueueLabel(item));
            setMealPlanSyncProgress({ done: synced, total });
            syncMealPlanQueue();
          }
        } catch (e) {
          if (isOfflineError(e)) break;
          setFailedMealPlanIds((prev) => new Set(prev).add(item.id));
          setError(e instanceof Error ? e.message : 'Meal plan sync failed');
          break;
        }
      }
      if (synced > 0 && lastSummary) {
        const label = mealPlanSyncUndoLabel(synced, labels);
        if (!offerUndoFromSummary(beforeRows, lastSummary, label)) {
          setMealPlanMessage(`Synced ${synced} queued meal log${synced === 1 ? '' : 's'}`);
        }
        setFood(lastSummary);
        void refresh();
      }
    } finally {
      setSyncingMealPlanQueue(false);
      setMealPlanSyncProgress(null);
      syncMealPlanQueue();
      const remainingIds = new Set(getMealPlanQueue().map((item) => item.id));
      if (remainingIds.size === 0) {
        setFailedMealPlanIds(new Set());
        setError('');
      } else {
        setFailedMealPlanIds((prev) => {
          let changed = false;
          const next = new Set<string>();
          for (const id of prev) {
            if (remainingIds.has(id)) next.add(id);
            else changed = true;
          }
          return changed ? next : prev;
        });
      }
    }
  }, [
    serverOnline,
    syncMealPlanQueue,
    refresh,
    food,
    dismissMealPlanUndo,
    snapshotFoodRows,
    offerUndoFromSummary,
    syncOneMealPlanItem,
  ]);

  const retryMealPlanItem = useCallback(
    async (item: QueuedMealPlanLog) => {
      if (!serverOnline || retryingMealPlanId) return;
      setRetryingMealPlanId(item.id);
      setError('');
      dismissMealPlanUndo();
      try {
        const before = food ?? (await api.getFoodToday());
        const summary = await syncOneMealPlanItem(item);
        if (summary) {
          setFood(summary);
          syncMealPlanQueue();
          const label = mealPlanQueueLabel(item);
          if (!offerUndoFromSummary(snapshotFoodRows(before), summary, label)) {
            setMealPlanMessage(`Logged ${label}`);
          }
        }
      } catch (e) {
        if (isOfflineError(e)) {
          setMealPlanMessage(`${mealPlanQueueLabel(item)} still queued — offline`);
        } else {
          setFailedMealPlanIds((prev) => new Set(prev).add(item.id));
          setError(e instanceof Error ? e.message : 'Meal plan sync failed');
        }
      } finally {
        setRetryingMealPlanId(null);
      }
    },
    [
      serverOnline,
      retryingMealPlanId,
      food,
      syncMealPlanQueue,
      syncOneMealPlanItem,
      dismissMealPlanUndo,
      snapshotFoodRows,
      offerUndoFromSummary,
    ],
  );

  const dismissMealPlanItem = useCallback(
    (id: string) => {
      removeMealPlanQueueItem(id);
      setFailedMealPlanIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      syncMealPlanQueue();
    },
    [syncMealPlanQueue],
  );

  const { pullProgress, refreshing, triggerRefresh } = usePullToRefresh({
    onRefresh: refresh,
    enabled: true,
  });

  useEffect(() => {
    syncMealPlanQueue();
    const onQueueChange = () => syncMealPlanQueue();
    window.addEventListener(MEAL_PLAN_QUEUE_CHANGE, onQueueChange);
    const onWake = () => {
      syncMealPlanQueue();
      void flushMealPlanQueue();
    };
    window.addEventListener('online', onWake);
    window.addEventListener('focus', onWake);
    return () => {
      window.removeEventListener(MEAL_PLAN_QUEUE_CHANGE, onQueueChange);
      window.removeEventListener('online', onWake);
      window.removeEventListener('focus', onWake);
    };
  }, [syncMealPlanQueue, flushMealPlanQueue]);

  useEffect(() => {
    void flushMealPlanQueue();
  }, [flushMealPlanQueue]);

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
  const failedMealPlanCount = mealPlanQueue.filter((item) => failedMealPlanIds.has(item.id)).length;
  const mealPlanQueueBannerText =
    syncingMealPlanQueue && mealPlanSyncProgress
      ? `Syncing meal logs (${mealPlanSyncProgress.done}/${mealPlanSyncProgress.total})…`
      : `${mealPlanQueue.length} meal log${mealPlanQueue.length === 1 ? '' : 's'} queued${
          failedMealPlanCount > 0 ? ` · ${failedMealPlanCount} failed` : ''
        }${
          mealPlan.length === 0 ? ' — no meals planned today' : ''
        }${serverOnline ? ' — tap Retry or Sync now' : ' — will sync when online'}.`;

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
        <div
          className={`home-meal-plan-queue-panel${syncingMealPlanQueue ? ' home-meal-plan-queue-panel--syncing' : ''}${mealPlan.length === 0 ? ' home-meal-plan-queue-panel--no-plan' : ''}${failedMealPlanCount > 0 ? ' home-meal-plan-queue-panel--has-failed' : ''}`}
        >
          <div className={`banner banner-row${failedMealPlanCount > 0 ? ' banner-err' : ' banner-warn'}`} role="status">
            <span>{mealPlanQueueBannerText}</span>
            {serverOnline && (
              <button
                type="button"
                className="btn-small"
                disabled={syncingMealPlanQueue || !!retryingMealPlanId}
                onClick={() => void flushMealPlanQueue()}
              >
                {syncingMealPlanQueue ? 'Syncing…' : 'Sync now'}
              </button>
            )}
            <button
              type="button"
              className="btn-small"
              aria-label="Dismiss meal plan log queue"
              disabled={syncingMealPlanQueue}
              onClick={() => {
                clearMealPlanQueue();
                setFailedMealPlanIds(new Set());
                syncMealPlanQueue();
                setMealPlanMessage('Meal plan log queue cleared');
              }}
            >
              Dismiss all
            </button>
          </div>
          {syncingMealPlanQueue && mealPlanSyncProgress && mealPlanSyncProgress.total > 0 && (
            <div
              className="home-meal-plan-sync-progress"
              role="progressbar"
              aria-valuenow={mealPlanSyncProgress.done}
              aria-valuemin={0}
              aria-valuemax={mealPlanSyncProgress.total}
              aria-label="Meal plan sync progress"
            >
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(mealPlanSyncProgress.done / mealPlanSyncProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
          {mealPlanQueue.length > 0 && (
            <ul className="food-list meal-plan-queue-list" aria-label="Queued meal logs">
              {mealPlanQueue.map((item) => {
                const failed = failedMealPlanIds.has(item.id);
                const retrying = retryingMealPlanId === item.id;
                return (
                  <li
                    key={item.id}
                    className={`food-row food-row--${failed ? 'failed' : 'queued'}`}
                    role={failed ? 'alert' : undefined}
                  >
                    <div>
                      <strong>{mealPlanQueueLabel(item)}</strong>
                      <span className={`muted${failed ? ' meal-plan-queue-item-failed' : ''}`}>
                        {item.description ? ` · ${item.description}` : ''}
                        {retrying
                          ? ' · Syncing…'
                          : failed
                            ? ' · Failed to sync'
                            : ' · Queued offline'}
                      </span>
                    </div>
                    <div className="food-row-actions">
                      {serverOnline && (
                        <button
                          type="button"
                          className="btn-small"
                          disabled={syncingMealPlanQueue || !!retryingMealPlanId}
                          onClick={() => void retryMealPlanItem(item)}
                        >
                          {retrying ? 'Syncing…' : 'Retry'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-small btn-danger"
                        aria-label={`Dismiss queued ${mealPlanQueueLabel(item)}`}
                        disabled={retrying || syncingMealPlanQueue}
                        onClick={() => dismissMealPlanItem(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
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
