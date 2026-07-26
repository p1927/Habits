import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { Card } from '../components/ui/Card';
import { MealPlanQueueEmptyHint } from '../components/MealPlanQueueEmptyHint';
import { UndoToast } from '../components/UndoToast';
import { useMealPlanUndo } from '../hooks/useMealPlanUndo';
import { useOptimisticHabitLog } from '../hooks/useOptimisticHabitLog';
import { api, ApiError, type FoodTodayResponse, type HabitsStreaksResponse, type HabitsTodayResponse } from '../lib/api';
import { cacheHabitStreak } from '../lib/habitQueue';
import {
  cacheMealPlan,
  clearMealPlanQueue,
  enqueueMealPlanLog,
  getCachedMealPlan,
  getMealPlanQueue,
  isOfflineError,
  removeMealPlanQueueItem,
  type MealPlanEntry,
  type QueuedMealPlanLog,
} from '../lib/mealPlanQueue';
import { vibrateFireStreak, vibrateHotStreak, vibrateMetricFireStreak, vibrateMetricHotStreak } from '../lib/haptics';

const STREAK_HAPTIC_OVERALL_KEY = 'habits-streak-haptic-overall';
const STREAK_HAPTIC_METRICS_KEY = 'habits-streak-haptic-metrics';
const STREAK_LEGEND_SEEN_KEY = 'habits-streak-legend-seen';
const STREAK_LEGEND_COLLAPSED_KEY = 'habits-streak-legend-collapsed';

function readStreakLegendOpen(): boolean {
  if (localStorage.getItem(STREAK_LEGEND_COLLAPSED_KEY) === '1') return false;
  return localStorage.getItem(STREAK_LEGEND_SEEN_KEY) !== '1';
}

function readMetricStreakHaptics(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(STREAK_HAPTIC_METRICS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

interface DayProps {
  serverOnline: boolean;
}

const METRIC_COLORS: Record<string, string> = {
  sleep: 'var(--ring-habits)',
  work: 'var(--accent)',
  read: 'var(--ok)',
  speak: 'var(--warn)',
  game: 'var(--carbs)',
  wasted: 'var(--err)',
};

function weekStripDays(): Date[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}
const METRICS = [
  { key: 'sleep', label: 'Sleep', target: 7 },
  { key: 'work', label: 'Work', target: 4 },
  { key: 'read', label: 'Read', target: 1 },
  { key: 'speak', label: 'Speak', target: 0.5 },
  { key: 'game', label: 'Game', target: 0 },
  { key: 'wasted', label: 'Wasted', target: 0 },
] as const;

function streakTierClass(days: number): string {
  if (days >= 14) return 'streak-badge--fire';
  if (days >= 7) return 'streak-badge--hot';
  if (days >= 3) return 'streak-badge--warm';
  return '';
}

function metricLabel(key: string): string {
  return METRICS.find((m) => m.key === key)?.label ?? key;
}

function mealPlanQueueLabel(item: QueuedMealPlanLog): string {
  if (item.kind === 'all') return 'All planned meals';
  return item.label ?? item.meal ?? 'Meal';
}

function mealPlanSyncUndoLabel(synced: number, labels: string[]): string {
  if (synced === 1) return labels[0] ?? 'Queued meal';
  return `${synced} queued meal logs`;
}

export function Day({ serverOnline }: DayProps) {
  const [habits, setHabits] = useState<HabitsTodayResponse | null>(null);
  const [events, setEvents] = useState<{ id: string; summary: string; start: string }[]>([]);
  const [manageDay, setManageDay] = useState<Record<string, string[]>>({});
  const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>(() => getCachedMealPlan());
  const [mealPlanQueue, setMealPlanQueue] = useState<QueuedMealPlanLog[]>(() => getMealPlanQueue());
  const [failedMealPlanIds, setFailedMealPlanIds] = useState<Set<string>>(() => new Set());
  const [retryingMealPlanId, setRetryingMealPlanId] = useState<string | null>(null);
  const [syncingMealPlanQueue, setSyncingMealPlanQueue] = useState(false);
  const [mealPlanSyncProgress, setMealPlanSyncProgress] = useState<{ done: number; total: number } | null>(null);
  const [mealSuccess, setMealSuccess] = useState('');
  const [error, setError] = useState('');
  const [habitSyncMessage, setHabitSyncMessage] = useState('');
  const [loggingMeals, setLoggingMeals] = useState(false);
  const [loggingMealKey, setLoggingMealKey] = useState<string | null>(null);
  const [streaks, setStreaks] = useState<HabitsStreaksResponse | null>(null);
  const [streakLegendOpen, setStreakLegendOpen] = useState(readStreakLegendOpen);

  const { saving, updateMetric, queuedCount, pending, retry, dismiss, dismissAllQueued } = useOptimisticHabitLog({
    serverOnline,
    habits,
    setHabits,
    setError,
    setSyncMessage: setHabitSyncMessage,
  });

  const {
    undoLog: mealPlanUndo,
    undoing: mealPlanUndoing,
    dismissUndo: dismissMealPlanUndo,
    snapshotRows: snapshotFoodRows,
    offerUndoFromSummary,
    handleUndo: handleMealPlanUndo,
  } = useMealPlanUndo(serverOnline);

  const refresh = useCallback(async () => {
    if (!serverOnline) return;
    try {
      const [h, cal, md, mp, st] = await Promise.all([
        api.getHabitsToday(),
        api.getCalendarToday(),
        api.getManageDay(),
        api.getMealPlanToday(),
        api.getHabitStreaks(),
      ]);
      setHabits(h);
      setEvents(cal.events ?? []);
      setManageDay(md.quadrants ?? {});
      setMealPlan(mp.meals ?? []);
      cacheMealPlan(mp.meals ?? []);
      setStreaks(st);
      cacheHabitStreak(st.overall);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
      setError(e instanceof Error ? e.message : 'Failed to load day');
    }
  }, [serverOnline]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const syncMealPlanQueue = useCallback(() => {
    setMealPlanQueue(getMealPlanQueue());
  }, []);

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
    dismissMealPlanUndo();
    const total = queue.length;
    setMealPlanSyncProgress({ done: 0, total });
    let synced = 0;
    const labels: string[] = [];
    let lastSummary: FoodTodayResponse | null = null;

    try {
      const before = await api.getFoodToday();
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
          setMealSuccess(`Synced ${synced} queued meal log${synced === 1 ? '' : 's'}`);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Meal plan sync failed');
    } finally {
      setSyncingMealPlanQueue(false);
      setMealPlanSyncProgress(null);
      syncMealPlanQueue();
      if (getMealPlanQueue().length === 0) {
        setFailedMealPlanIds(new Set());
        setError('');
      }
    }
  }, [
    serverOnline,
    syncMealPlanQueue,
    syncOneMealPlanItem,
    dismissMealPlanUndo,
    snapshotFoodRows,
    offerUndoFromSummary,
  ]);

  const retryMealPlanItem = useCallback(
    async (item: QueuedMealPlanLog) => {
      if (!serverOnline || retryingMealPlanId) return;
      setRetryingMealPlanId(item.id);
      setError('');
      dismissMealPlanUndo();
      try {
        const before = await api.getFoodToday();
        const summary = await syncOneMealPlanItem(item);
        if (summary) {
          syncMealPlanQueue();
          const label = mealPlanQueueLabel(item);
          if (!offerUndoFromSummary(snapshotFoodRows(before), summary, label)) {
            setMealSuccess(`Logged ${label}`);
          }
        }
      } catch (e) {
        if (isOfflineError(e)) {
          setMealSuccess(`${mealPlanQueueLabel(item)} still queued — offline`);
        } else {
          setFailedMealPlanIds((prev) => new Set(prev).add(item.id));
          setError(e instanceof Error ? e.message : 'Meal plan sync failed');
        }
      } finally {
        setRetryingMealPlanId(null);
      }
    },
    [serverOnline, retryingMealPlanId, syncMealPlanQueue, syncOneMealPlanItem, dismissMealPlanUndo, snapshotFoodRows, offerUndoFromSummary],
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

  useEffect(() => {
    void flushMealPlanQueue();
  }, [flushMealPlanQueue]);

  useEffect(() => {
    const onOnline = () => {
      syncMealPlanQueue();
      void flushMealPlanQueue();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [flushMealPlanQueue, syncMealPlanQueue]);

  const logMealPlanEntry = useCallback(
    (entry: MealPlanEntry) => {
      setLoggingMealKey(entry.meal);
      setMealSuccess('');
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
        setMealSuccess(`${entry.label} queued — will log when online`);
        setLoggingMealKey(null);
        return;
      }

      void (async () => {
        try {
          const before = await api.getFoodToday();
          const res = await api.logMealPlanItem(entry.meal);
          if (!offerUndoFromSummary(snapshotFoodRows(before), res.summary, entry.label)) {
            setMealSuccess(res.message);
          }
        } catch (e) {
          if (isOfflineError(e)) {
            enqueueMealPlanLog({
              kind: 'item',
              meal: entry.meal,
              label: entry.label,
              description: entry.description,
            });
            syncMealPlanQueue();
            setMealSuccess(`${entry.label} queued — will log when online`);
            return;
          }
          setError(e instanceof Error ? e.message : 'Meal log failed');
        } finally {
          setLoggingMealKey(null);
        }
      })();
    },
    [serverOnline, syncMealPlanQueue, dismissMealPlanUndo, snapshotFoodRows, offerUndoFromSummary],
  );

  const logAllMealPlan = useCallback(() => {
    setLoggingMeals(true);
    setMealSuccess('');
    setError('');
    dismissMealPlanUndo();

    if (!serverOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      enqueueMealPlanLog({ kind: 'all' });
      syncMealPlanQueue();
      setMealSuccess('All planned meals queued — will log when online');
      setLoggingMeals(false);
      return;
    }

    void (async () => {
      try {
        const before = await api.getFoodToday();
        const res = await api.logMealPlanToday();
        if (!offerUndoFromSummary(snapshotFoodRows(before), res.summary, 'All planned meals')) {
          setMealSuccess(res.message);
        }
      } catch (e) {
        if (isOfflineError(e)) {
          enqueueMealPlanLog({ kind: 'all' });
          syncMealPlanQueue();
          setMealSuccess('All planned meals queued — will log when online');
          return;
        }
        setError(e instanceof Error ? e.message : 'Meal log failed');
      } finally {
        setLoggingMeals(false);
      }
    })();
  }, [serverOnline, syncMealPlanQueue, dismissMealPlanUndo, snapshotFoodRows, offerUndoFromSummary]);

  useEffect(() => {
    if (localStorage.getItem(STREAK_LEGEND_SEEN_KEY) !== '1') {
      localStorage.setItem(STREAK_LEGEND_SEEN_KEY, '1');
    }
  }, []);

  const toggleStreakLegend = useCallback(() => {
    setStreakLegendOpen((open) => {
      const next = !open;
      localStorage.setItem(STREAK_LEGEND_COLLAPSED_KEY, next ? '0' : '1');
      return next;
    });
  }, []);

  useEffect(() => {
    if (!streaks) return;

    let didVibrate = false;
    const vibrateOnce = (fn: () => void) => {
      if (didVibrate) return;
      fn();
      didVibrate = true;
    };

    const prevOverall = Number(sessionStorage.getItem(STREAK_HAPTIC_OVERALL_KEY) ?? '0');
    if (streaks.overall >= 14 && prevOverall < 14) vibrateOnce(vibrateFireStreak);
    else if (streaks.overall >= 7 && prevOverall < 7) vibrateOnce(vibrateHotStreak);
    if (streaks.overall !== prevOverall) {
      sessionStorage.setItem(STREAK_HAPTIC_OVERALL_KEY, String(streaks.overall));
    }

    const prevMetrics = readMetricStreakHaptics();
    const nextMetrics = { ...prevMetrics };
    for (const { key } of METRICS) {
      const days = streaks.metrics?.[key] ?? 0;
      const prev = prevMetrics[key] ?? 0;
      if (days >= 14 && prev < 14) vibrateOnce(vibrateMetricFireStreak);
      else if (days >= 7 && prev < 7) vibrateOnce(vibrateMetricHotStreak);
      if (days !== prev) nextMetrics[key] = days;
    }
    sessionStorage.setItem(STREAK_HAPTIC_METRICS_KEY, JSON.stringify(nextMetrics));
  }, [streaks]);

  function formatTime(iso: string): string {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  }

  function isPastEvent(start: string): boolean {
    return new Date(start) < new Date();
  }

  const failedMealPlanCount = mealPlanQueue.filter((item) => failedMealPlanIds.has(item.id)).length;

  return (
    <section className="section day-section" aria-labelledby="day-heading">
      <h1 id="day-heading">Your Day</h1>
      <p className="muted">Schedule + habit tracker</p>

      <div className="day-week-strip" role="group" aria-label="This week">
        {weekStripDays().map((d) => {
          const isToday = isSameDay(d, new Date());
          return (
            <div
              key={d.toISOString()}
              className={`day-week-pill ${isToday ? 'day-week-pill--today' : ''}`}
              aria-current={isToday ? 'date' : undefined}
            >
              <span className="day-week-pill__dow">
                {d.toLocaleDateString([], { weekday: 'narrow' })}
              </span>
              <span className="day-week-pill__date">{d.getDate()}</span>
            </div>
          );
        })}
      </div>

      {!serverOnline && <div className="banner banner-warn" role="alert">Server offline — habit edits save locally.</div>}

      {queuedCount > 0 && (
        <div className="banner banner-warn banner-row" role="status">
          <span>
            {queuedCount} habit update{queuedCount === 1 ? '' : 's'} queued — will sync when online.
          </span>
          <button
            type="button"
            className="btn-small"
            aria-label="Dismiss offline habit update queue"
            onClick={() => {
              dismissAllQueued();
              setHabitSyncMessage('Offline habit update queue cleared');
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {mealPlanQueue.length > 0 || syncingMealPlanQueue ? (
        <div
          className={`meal-plan-queue-panel${syncingMealPlanQueue ? ' meal-plan-queue-panel--syncing' : ''}${failedMealPlanCount > 0 ? ' meal-plan-queue-panel--has-failed' : ''}`}
          role="status"
        >
          <div className={`banner banner-row${failedMealPlanCount > 0 ? ' banner-err' : ' banner-warn'}`}>
            <span>
              {syncingMealPlanQueue && mealPlanSyncProgress
                ? `Syncing meal logs (${mealPlanSyncProgress.done}/${mealPlanSyncProgress.total})…`
                : `${mealPlanQueue.length} meal log${mealPlanQueue.length === 1 ? '' : 's'} queued${failedMealPlanCount > 0 ? ` · ${failedMealPlanCount} failed` : ''}${serverOnline ? ' — tap Retry or Sync all' : ' — will sync when online'}.`}
            </span>
            {serverOnline && (
              <button
                type="button"
                className="btn-small"
                disabled={syncingMealPlanQueue || !!retryingMealPlanId}
                onClick={() => void flushMealPlanQueue()}
              >
                {syncingMealPlanQueue ? 'Syncing…' : 'Sync all'}
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
                setMealSuccess('Meal plan log queue cleared');
              }}
            >
              Dismiss all
            </button>
          </div>
          {syncingMealPlanQueue && mealPlanSyncProgress && mealPlanSyncProgress.total > 0 && (
            <div
              className="meal-plan-sync-progress"
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
      ) : (
        <MealPlanQueueEmptyHint />
      )}

      <Card>
        <h2>Today&apos;s meal plan</h2>
        <p className="muted">From WEEK MEALS sheet</p>
        {!mealPlan.length ? (
          <p className="muted">No meals planned for today.</p>
        ) : (
          <>
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
              disabled={loggingMeals}
              onClick={logAllMealPlan}
            >
              Log all planned meals
            </button>
          </>
        )}
      </Card>

      <Card className="day-timeline-card">
        <h2>Timeline</h2>
        {!events.length ? (
          <p className="muted">No calendar events today.</p>
        ) : (
          <ul className="timeline timeline--dense" aria-label="Today's calendar events">
            {events.map((ev) => {
              const past = isPastEvent(ev.start);
              return (
                <li
                  key={ev.id}
                  className={`timeline-item ${past ? 'timeline-item--past' : 'timeline-item--upcoming'}`}
                >
                  <span className="timeline-block" aria-hidden="true" />
                  <span className="timeline-time">{formatTime(ev.start)}</span>
                  <span className="timeline-title">{ev.summary}</span>
                  {past && <span className="timeline-nudge">Passed</span>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <div className="habit-hours-header">
          <h2>Habit hours</h2>
          <button
            type="button"
            className="btn-small streak-legend-toggle"
            aria-expanded={streakLegendOpen}
            aria-controls="streak-tier-legend"
            onClick={toggleStreakLegend}
          >
            {streakLegendOpen ? 'Hide legend' : 'Show legend'}
          </button>
        </div>
        {streakLegendOpen && (
          <ul id="streak-tier-legend" className="streak-tier-legend" aria-label="Streak badge tiers">
            <li>
              <span className="streak-badge streak-badge--warm streak-tier-legend-badge" aria-hidden="true">3d</span>
              <span className="muted">Warm · 3+ days</span>
            </li>
            <li>
              <span className="streak-badge streak-badge--hot streak-tier-legend-badge" aria-hidden="true">7d</span>
              <span className="muted">Hot · 7+ days</span>
            </li>
            <li>
              <span className="streak-badge streak-badge--fire streak-tier-legend-badge" aria-hidden="true">14d</span>
              <span className="muted">Fire · 14+ days</span>
            </li>
          </ul>
        )}
        {streaks && streaks.overall > 0 && (
          <p className="streak-banner streak-banner--animated" role="status">
            <span
              className={`streak-badge streak-badge--overall ${streakTierClass(streaks.overall)}`}
            >
              {streaks.overall}d
            </span>
            All-target streak
          </p>
        )}
        <div className="habit-grid" role="group" aria-label="Habit hours">
          {METRICS.map(({ key, label, target }) => {
            const val = habits?.metrics?.[key];
            const behind = target > 0 && (val ?? 0) < target * 0.5;
            const streak = streaks?.metrics?.[key] ?? 0;
            return (
              <label
                key={key}
                className={`habit-chip habit-chip--${key} ${behind ? 'habit-chip--behind' : ''}`}
                style={{ '--habit-accent': METRIC_COLORS[key] ?? 'var(--accent)' } as CSSProperties}
              >
                <span className="habit-chip-label">
                  {label}
                  {target > 0 && streak > 0 && (
                    <span
                      className={`streak-badge ${streakTierClass(streak)}`}
                      aria-label={`${streak} day streak`}
                    >
                      {streak}d
                    </span>
                  )}
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={val ?? ''}
                  placeholder="0"
                  disabled={saving === key}
                  onChange={(e) => void updateMetric(key, e.target.value)}
                />
                {target > 0 && <span className="habit-target">/{target}h</span>}
              </label>
            );
          })}
        </div>
        {pending.some((e) => e.status === 'failed') && (
          <ul className="food-list habit-sync-list" aria-label="Failed habit syncs">
            {pending
              .filter((e) => e.status === 'failed')
              .map((entry) => (
                <li key={entry.id} className="food-row food-row--failed">
                  <div>
                    <strong>{metricLabel(entry.metric)}</strong>
                    <span className="muted">
                      {' '}
                      · {entry.value ?? 0}h · Failed to sync
                    </span>
                  </div>
                  <div className="food-row-actions">
                    <button type="button" className="btn-small" onClick={() => retry(entry)}>
                      Retry
                    </button>
                    <button
                      type="button"
                      className="btn-small btn-danger"
                      aria-label={`Dismiss failed ${metricLabel(entry.metric)} update`}
                      onClick={() => dismiss(entry.id)}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </Card>

      {Object.keys(manageDay).length > 0 && (
        <Card>
          <h2>Manage day</h2>
          {Object.entries(manageDay).map(([quad, items]) =>
            items.length > 0 ? (
              <div key={quad} className="manage-quad">
                <h3>{quad.replace('_', ' ')}</h3>
                <ul>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null,
          )}
        </Card>
      )}

      <div role="status" aria-live="polite">
        {mealSuccess && !mealPlanUndo && <div className="banner banner-ok">{mealSuccess}</div>}
        {habitSyncMessage && <div className="banner banner-ok">{habitSyncMessage}</div>}
      </div>
      {error && <div className="banner banner-warn" role="alert">{error}</div>}
      {mealPlanUndo && (
        <UndoToast
          message={`Logged ${mealPlanUndo.label}`}
          onUndo={() => void handleMealPlanUndo(() => setMealSuccess('Log undone'))}
          onDismiss={dismissMealPlanUndo}
          undoing={mealPlanUndoing}
        />
      )}
    </section>
  );
}
