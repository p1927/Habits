import { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { api, ApiError, type FoodTodayResponse } from '../lib/api';
import { formatGrams } from '../lib/logTypeTotals';
import { buildLogTypeTotalsViewModel } from '../lib/logTypeTotalsViewModel';

export interface LogTypeTodayTotalsStripProps {
  data: FoodTodayResponse | null;
  serverOnline: boolean;
  // Number of optimistic food entries still queued locally and waiting to
  // sync to the backend (relay-223). Surfaced in the footer as a muted badge
  // so users know their totals are not yet the final picture.
  pendingCount?: number;
}

export function LogTypeTodayTotalsStrip({
  data,
  serverOnline,
  pendingCount = 0,
}: LogTypeTodayTotalsStripProps) {
  const [calorieTarget, setCalorieTarget] = useState<number | null>(null);
  // Expanded panel state for the carbs/fat breakdown (relay-222).
  // Persists across renders but resets when the strip unmounts — appropriate
  // because the strip lives above the today list and is not a sticky
  // navigation surface.
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!serverOnline) {
      setCalorieTarget(null);
      return;
    }
    let cancelled = false;
    api
      .getFoodTargets()
      .then((targets) => {
        if (cancelled) return;
        setCalorieTarget(targets.calorie_target ?? null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) return;
        setCalorieTarget(null);
      });
    return () => {
      cancelled = true;
    };
  }, [serverOnline]);

  const {
    announceText,
    calorieText,
    carbs,
    fat,
    footerText,
    goalReached,
    hasCalorieTarget,
    hasMacros,
    kcalPct,
    pendingBadgeText,
    proteinPct,
    proteinText,
  } = buildLogTypeTotalsViewModel(data, calorieTarget, pendingCount);

  return (
    <Card
      className="log-type-totals-strip home-export-card--health"
      ariaLabel="Today's calorie and protein totals"
    >
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announceText}
      </div>
      <p className="section-eyebrow">Today</p>
      <div className="progress-label">
        <span>Calories</span>
        <span>{calorieText}</span>
      </div>
      <div className="progress-bar" aria-hidden="true">
        <div
          className={`progress-fill${goalReached ? ' progress-fill--goal-reached' : ''}`}
          style={{ width: hasCalorieTarget ? `${kcalPct}%` : '0%' }}
        />
      </div>
      <p className="progress-label log-type-totals-strip__protein">
        <span>Protein</span>
        <span>{proteinText}</span>
      </p>
      <div className="progress-bar progress-bar--thin" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${proteinPct}%` }} />
      </div>
      {hasMacros ? (
        <button
          type="button"
          className="log-type-totals-strip__expand"
          aria-expanded={expanded}
          aria-controls="log-type-totals-strip-macros"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Hide macros' : 'Show macros'}
        </button>
      ) : null}
      {hasMacros && expanded ? (
        <div
          id="log-type-totals-strip-macros"
          className="log-type-totals-strip__macros"
          data-testid="log-type-totals-strip-macros"
        >
          <p className="progress-label log-type-totals-strip__macro">
            <span>Carbs</span>
            <span>{formatGrams(carbs)}g</span>
          </p>
          <div className="progress-bar progress-bar--thin" aria-hidden="true">
            <div className="progress-fill" style={{ width: '0%' }} />
          </div>
          <p className="progress-label log-type-totals-strip__macro">
            <span>Fat</span>
            <span>{formatGrams(fat)}g</span>
          </p>
          <div className="progress-bar progress-bar--thin" aria-hidden="true">
            <div className="progress-fill" style={{ width: '0%' }} />
          </div>
        </div>
      ) : null}
      <p className={`muted macro-line log-type-totals-strip__footer${goalReached ? ' log-type-totals-strip__footer--goal-reached' : ''}`}>
        {footerText}
        {pendingBadgeText ? (
          <span
            className="log-type-totals-strip__pending-badge"
            data-testid="log-type-totals-strip-pending-badge"
            aria-label={pendingBadgeText}
          >
            {' · '}
            {pendingBadgeText}
          </span>
        ) : null}
      </p>
    </Card>
  );
}
