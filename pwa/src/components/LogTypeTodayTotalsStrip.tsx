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
    hasNoMealsLogged,
    kcalPct,
    pendingBadgeText,
    proteinPct,
    proteinText,
    setupHint,
  } = buildLogTypeTotalsViewModel(data, calorieTarget, pendingCount);

  // relay-226: progress bars are only meaningful when there IS a target to
  // measure against. Without a calorie target a 0% bar reads as "you have
  // progress to make" even though there's nothing to make progress toward;
  // hide it instead. Same for protein: a 0% bar against a null target is
  // a misleading empty track. The protein pct falls back to 0% in that
  // case (foodSectionShared.proteinProgressPct) but the visual suppression
  // happens here.
  const showKcalBar = hasCalorieTarget && !hasNoMealsLogged;
  const proteinTarget = data?.protein_target_g;
  const showProteinBar = proteinTarget != null && proteinTarget > 0 && !hasNoMealsLogged;

  // relay-227: keyboard focus affordance. The strip carries a summary of
  // today's totals; a keyboard user should be able to Tab to it, see a focus
  // ring, and use Enter/Space to expose the macro breakdown (the only piece
  // of "details" the strip can reveal). When hasMacros is false the strip
  // has no details to expose, so it is NOT promoted to a button — the Card
  // remains a non-interactive region in that case. The aria-label on the
  // Card already names the summary for screen readers, so we don't need a
  // second accessible name.
  //
  // Note: when interactive, the Card is itself the toggle. The previous
  // "Show/Hide macros" child button was removed (relay-227) because nesting
  // a <button> inside a <div role="button"> is invalid HTML and a11y-hostile
  // for screen readers — they announce nested interactive elements
  // inconsistently. The macros region is the controlled disclosure.
  const hasDetails = hasMacros;
  const handleToggleDetails = () => {
    if (hasDetails) setExpanded((v) => !v);
  };

  return (
    <Card
      className="log-type-totals-strip home-export-card--health"
      ariaLabel={
        hasDetails
          ? "Today's calorie and protein totals. Press Enter to toggle macro details."
          : "Today's calorie and protein totals"
      }
      onClick={hasDetails ? handleToggleDetails : undefined}
      ariaExpanded={hasDetails ? expanded : undefined}
      ariaControls={hasDetails ? 'log-type-totals-strip-macros' : undefined}
    >
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announceText}
      </div>
      <p className="section-eyebrow">Today</p>
      <div className="progress-label">
        <span>Calories</span>
        <span>{calorieText}</span>
      </div>
      {/* relay-225: when no meals are logged yet the strip should not imply
          "progress toward a target" by rendering a 0% progress bar. Hide both
          kcal and protein bars in the empty state and let the footer carry
          the explicit "No meals logged yet" message. relay-226: even when
          meals are logged, a missing calorie target means there is nothing to
          measure against — the kcal bar would render width:0% and read as
          "fill me"; suppress it and route the user to the setup hint
          instead. Same reasoning for the protein bar against a null
          protein_target_g. */}
      {showKcalBar ? (
        <div className="progress-bar" aria-hidden="true">
          <div
            className={`progress-fill${goalReached ? ' progress-fill--goal-reached' : ''}`}
            style={{ width: `${kcalPct}%` }}
          />
        </div>
      ) : null}
      <p className="progress-label log-type-totals-strip__protein">
        <span>Protein</span>
        <span>{proteinText}</span>
      </p>
      {showProteinBar ? (
        <div className="progress-bar progress-bar--thin" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${proteinPct}%` }} />
        </div>
      ) : null}
      {/*
        relay-227: the strip itself is now the disclosure toggle (see Card
        onClick above). The old "Show/Hide macros" child button was removed
        because nesting a real <button> inside a div[role=button] is invalid
        HTML and produces inconsistent screen reader behavior. The visual
        affordance is now carried by the focus ring on the Card and a small
        hint line just above the footer that reads "Show macros" / "Hide
        macros" depending on the expanded state. The hint is non-interactive
        (a span), so the Card remains the single keyboard target.
      */}
      {hasMacros ? (
        <p
          className="log-type-totals-strip__expand-hint"
          data-testid="log-type-totals-strip-expand-hint"
          aria-hidden="true"
        >
          {expanded ? 'Hide macros' : 'Show macros'}
        </p>
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
      {/* relay-226: when the user has logged at least one meal today but no
          calorie target is configured, surface a concise setup hint so the
          strip tells them what unlocks progress tracking. The hint is part
          of the visible strip (not the aria-live region) because the user
          action is configuration, not a state change — no need to
          re-announce on every render. */}
      {setupHint ? (
        <p
          className="muted log-type-totals-strip__setup-hint"
          data-testid="log-type-totals-strip-setup-hint"
        >
          {setupHint}
        </p>
      ) : null}
    </Card>
  );
}
