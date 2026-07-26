import { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { useOptimisticHabitLog } from '../hooks/useOptimisticHabitLog';
import { api, ApiError, type HabitsStreaksResponse, type HabitsTodayResponse } from '../lib/api';
import { cacheHabitStreak } from '../lib/habitQueue';
import { vibrateFireStreak, vibrateHotStreak, vibrateMetricFireStreak, vibrateMetricHotStreak } from '../lib/haptics';

const STREAK_HAPTIC_OVERALL_KEY = 'habits-streak-haptic-overall';
const STREAK_HAPTIC_METRICS_KEY = 'habits-streak-haptic-metrics';

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

export function Day({ serverOnline }: DayProps) {
  const [habits, setHabits] = useState<HabitsTodayResponse | null>(null);
  const [events, setEvents] = useState<{ id: string; summary: string; start: string }[]>([]);
  const [manageDay, setManageDay] = useState<Record<string, string[]>>({});
  const [mealPlan, setMealPlan] = useState<{ meal: string; label: string; description: string }[]>([]);
  const [mealSuccess, setMealSuccess] = useState('');
  const [error, setError] = useState('');
  const [habitSyncMessage, setHabitSyncMessage] = useState('');
  const [loggingMeals, setLoggingMeals] = useState(false);
  const [streaks, setStreaks] = useState<HabitsStreaksResponse | null>(null);

  const { saving, updateMetric, queuedCount, pending, retry, dismiss, dismissAllQueued } = useOptimisticHabitLog({
    serverOnline,
    habits,
    setHabits,
    setError,
    setSyncMessage: setHabitSyncMessage,
  });

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

  return (
    <section className="section day-section" aria-labelledby="day-heading">
      <h1 id="day-heading">Your Day</h1>
      <p className="muted">Schedule + habit tracker</p>

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
                  <strong>{m.label}</strong>
                  <span className="muted">{m.description}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={!serverOnline || loggingMeals}
              onClick={() => {
                setLoggingMeals(true);
                setMealSuccess('');
                setError('');
                void api
                  .logMealPlanToday()
                  .then((res) => setMealSuccess(res.message))
                  .catch((e) => setError(e instanceof Error ? e.message : 'Meal log failed'))
                  .finally(() => setLoggingMeals(false));
              }}
            >
              Log all planned meals
            </button>
          </>
        )}
      </Card>

      <Card>
        <h2>Timeline</h2>
        {!events.length ? (
          <p className="muted">No calendar events today.</p>
        ) : (
          <ul className="timeline" aria-label="Today's calendar events">
            {events.map((ev) => (
              <li
                key={ev.id}
                className={`timeline-item ${isPastEvent(ev.start) ? 'timeline-item--past' : ''}`}
              >
                <span className="timeline-time">{formatTime(ev.start)}</span>
                <span className="timeline-title">{ev.summary}</span>
                {isPastEvent(ev.start) && <span className="timeline-nudge">Passed</span>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2>Habit hours</h2>
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
              <label key={key} className={`habit-chip ${behind ? 'habit-chip--behind' : ''}`}>
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
        {mealSuccess && <div className="banner banner-ok">{mealSuccess}</div>}
        {habitSyncMessage && <div className="banner banner-ok">{habitSyncMessage}</div>}
      </div>
      {error && <div className="banner banner-warn" role="alert">{error}</div>}
    </section>
  );
}
