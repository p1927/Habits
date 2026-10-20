import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from './ui/Card';
import { api, ApiError, type FoodTodayResponse } from '../lib/api';
import { formatGrams, type MacroFilter } from '../lib/logTypeTotals';
import { buildLogTypeTotalsViewModel } from '../lib/logTypeTotalsViewModel';
import { buildLogTotalsCoachPrompt } from '../lib/logTotalsCoachPrompt';

// relay-231: the stale-data indicator ticks the relative time every 15s
// once we have data. 15s matches the most common "sub-minute" bucket in
// formatRelativeUpdatedAt ("Updated 12s ago") so the user sees the seconds
// count move naturally instead of jumping in larger steps. Lower bounds
// would burn CPU without changing what the user can see.
const STALE_TICK_MS = 15_000;

export interface LogTypeTodayTotalsStripProps {
  data: FoodTodayResponse | null;
  serverOnline: boolean;
  // Number of optimistic food entries still queued locally and waiting to
  // sync to the backend (relay-223). Surfaced in the footer as a muted badge
  // so users know their totals are not yet the final picture.
  pendingCount?: number;
  // relay-232: Ask Coach handoff. When provided, the strip renders an
  // "Ask Coach" button that builds a plain-text prompt from the current
  // totals viewmodel and invokes this callback with it. The callback is
  // expected to navigate to the Agent tab and prefill (NOT auto-send) the
  // composer — the AC explicitly forbids sending without user confirmation.
  // Optional so existing call sites that don't wire the Agent handoff
  // (e.g. tests, future non-Log mounts) keep working.
  onAskCoach?: (prompt: string) => void;
  // relay-233: macro contribution drill-down. When provided AND the strip
  // has items to drill into, the Carbs and Fat rows render as
  // <button type="button"> elements that invoke this callback with the
  // chosen MacroFilter. The callback is expected to lift state up to the
  // panel (LogTypeTabPanel) which then forwards the filter to the today
  // list. Optional so call sites that don't wire a drill-down surface
  // (e.g. non-Log shells, tests) keep rendering as plain <p> rows.
  onMacroClick?: (macro: MacroFilter) => void;
}

export function LogTypeTodayTotalsStrip({
  data,
  serverOnline,
  pendingCount = 0,
  onAskCoach,
  onMacroClick,
}: LogTypeTodayTotalsStripProps) {
  const [calorieTarget, setCalorieTarget] = useState<number | null>(null);
  // Expanded panel state for the carbs/fat breakdown (relay-222).
  // Persists across renders but resets when the strip unmounts — appropriate
  // because the strip lives above the today list and is not a sticky
  // navigation surface.
  const [expanded, setExpanded] = useState(false);

  // relay-231: track the wall-clock timestamp the moment `data` is
  // received so the stale-data indicator can render "Updated 12s ago".
  // We use a ref (mutable storage) that captures Date.now() the first
  // time each new `data` identity is observed during render. Updating
  // a ref during render is safe when the new value is computed
  // deterministically from props (React documents this pattern in the
  // FAQ for derived state — see "You Might Not Need an Effect").
  // We compare against a separate dataIdentityRef so we only re-stamp
  // when the parent actually hands us a NEW payload (not on every
  // re-render with the same data reference).
  const dataIdentityRef = useRef<FoodTodayResponse | null | undefined>(undefined);
  const dataReceivedAtRef = useRef<number>(0);
  if (dataIdentityRef.current !== data) {
    dataIdentityRef.current = data;
    dataReceivedAtRef.current = data != null ? Date.now() : 0;
  }
  const [freshnessTick, setFreshnessTick] = useState(0);
  const freshnessMs =
    data != null && dataReceivedAtRef.current > 0
      ? Date.now() - dataReceivedAtRef.current
      : 0;
  // Tick the relative-time recompute every STALE_TICK_MS once we have
  // data on screen. When `data` goes null again (e.g. fresh fetch in
  // flight) the timer clears. The interval is independent of the
  // data-stamping logic above so the two never race.
  useEffect(() => {
    if (data == null) return undefined;
    const id = window.setInterval(() => {
      setFreshnessTick((n) => n + 1);
    }, STALE_TICK_MS);
    return () => {
      window.clearInterval(id);
    };
  }, [data]);

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

  // relay-228: yesterday's totals for the day-over-day comparison line.
  // Fetched once when the server is reachable; the component never
  // re-fetches on data/pending changes because yesterday's totals are a
  // point-in-time lookback (a new meal logged today shouldn't refresh
  // yesterday's numbers). When the server is offline or the call fails
  // we leave the slots as null and the viewmodel emits the unavailable
  // message — the AC explicitly requires "an explicit unavailable state
  // when yesterday data is missing."
  //
  // Bugbot Round 85 finding #1: the prior implementation selected the
  // first row whose date was simply NOT today. That mislabelled any older
  // logged day as "yesterday" when yesterday itself was absent, and
  // could match a future-dated row. Now we filter on the exact yesterday
  // date (computed at fetch time, not render time, so a long-mounted
  // strip across midnight stays consistent with its fetch).
  const [yesterdayKcal, setYesterdayKcal] = useState<number | null>(null);
  const [yesterdayProtein, setYesterdayProtein] = useState<number | null>(null);
  useEffect(() => {
    if (!serverOnline) {
      setYesterdayKcal(null);
      setYesterdayProtein(null);
      return;
    }
    let cancelled = false;
    // Compute yesterday as YYYY-MM-DD using the same UTC slice the server
    // emits (server history_sheet.py stores isoformat() date strings).
    // Computing here once (not in the resolve handler) keeps the
    // comparison anchored to fetch time so the line doesn't drift if the
    // user keeps the tab open across local midnight.
    const yesterdayDate = new Date();
    yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
    const yesterdayIso = yesterdayDate.toISOString().slice(0, 10);
    api
      .getFoodHistory(2)
      .then((res) => {
        if (cancelled) return;
        const prior =
          (res.days ?? []).find((d) => d.date === yesterdayIso) ?? null;
        setYesterdayKcal(prior ? prior.calories : null);
        setYesterdayProtein(prior ? prior.protein : null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) return;
        setYesterdayKcal(null);
        setYesterdayProtein(null);
      });
    return () => {
      cancelled = true;
    };
  }, [serverOnline]);

  // relay-231: the viewmodel is memoised so handleAskCoach (relay-232) can
  // use it as a useCallback dep with a stable identity. The memo's deps
  // include `freshnessTick` — NOT `freshnessMs` — because freshnessMs
  // is computed from Date.now() on every render and depending on it
  // would invalidate the memo on every render (defeating memoisation).
  // The freshnessTick counter bumps every 15s via setInterval, which is
  // the cadence at which the stale-data indicator actually needs to
  // update. New payload arrivals trigger a memo invalidation through the
  // `data` dep + the dataReceivedAtRef mutation.
  const viewModel = useMemo(
    () =>
      buildLogTypeTotalsViewModel(
        data,
        calorieTarget,
        pendingCount,
        yesterdayKcal,
        yesterdayProtein,
        freshnessMs,
        serverOnline,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, calorieTarget, pendingCount, yesterdayKcal, yesterdayProtein, serverOnline, freshnessTick],
  );
  const {
    announceText,
    calorieText,
    carbs,
    comparison,
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
    staleIndicator,
  } = viewModel;

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

  // relay-232: Ask Coach handoff. Builds the plain-text prompt from the
  // current viewmodel and hands it to onAskCoach exactly once per click.
  // The prompt builder is pure (no DOM, no network) so the only reason to
  // useCallback is to give downstream consumers a stable handler identity
  // — useful if a parent wires this through React.memo or a stable
  // useEffect dependency.
  const handleAskCoach = useCallback(() => {
    if (!onAskCoach) return;
    onAskCoach(buildLogTotalsCoachPrompt(viewModel));
  }, [onAskCoach, viewModel]);

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
      {/* relay-228: day-over-day comparison line(s). Suppressed in the empty
          state (relay-225's "No meals logged yet" owns the message and a
          delta from yesterday is misleading on a zero-meal day). When
          yesterday totals are known the line shows two muted fragments
          joined by a middot; when unknown it surfaces the concise
          unavailable message so the user is never left wondering whether
          a delta of zero means "same" or "missing data". The line is
          deliberately not part of the aria-live region — it updates only
          on server state changes (mount / refresh) and re-announcing on
          each render would be noisy for screen reader users. */}
      {!hasNoMealsLogged && comparison ? (
        <p
          className="muted log-type-totals-strip__comparison"
          data-testid="log-type-totals-strip-comparison"
        >
          {comparison.hasYesterday ? (
            <>
              <span data-testid="log-type-totals-strip-comparison-kcal">
                {comparison.kcalDeltaText}
              </span>
              {' · '}
              <span data-testid="log-type-totals-strip-comparison-protein">
                {comparison.proteinDeltaText}
              </span>
            </>
          ) : (
            <span data-testid="log-type-totals-strip-comparison-unavailable">
              {comparison.unavailableText}
            </span>
          )}
        </p>
      ) : null}
      {/* relay-231: stale-data indicator. Renders as a single muted line
          that names how current the totals are. Sits below the comparison
          line and the setup hint (the comparison block has the most
          recent pull timestamp context, so reading order matches "delta
          vs yesterday → when did we pull this from the server"). The
          indicator is suppressed when there is no data to time-stamp —
          relay-225's "No meals logged yet" is the right message when the
          totals themselves are absent. The indicator itself is NOT part
          of the aria-live region: the relative time changes on a 15s
          interval and re-announcing "Updated 12s ago… 27s ago…" would be
          noisy; the user can read the text directly. */}
      {staleIndicator ? (
        <p
          className={`muted log-type-totals-strip__stale log-type-totals-strip__stale--${staleIndicator.kind}`}
          data-testid="log-type-totals-strip-stale"
          aria-hidden="true"
        >
          {staleIndicator.text}
        </p>
      ) : null}
      {/*
        relay-232: Ask Coach handoff. Rendered as a real <button> (not part of
        the Card's onClick disclosure) so the keyboard focus model stays sane:
        the Card is the "show/hide macros" toggle, the Ask Coach button is a
        separate, single-purpose primary action. Disabled only when the server
        is offline — the Coach prompt relies on the totals viewmodel, which is
        still meaningful when the server is unreachable (we keep the last-known
        values and don't fabricate). Hidden entirely when onAskCoach is not
        wired so consumers that don't expose the Agent tab don't see a dead
        button. aria-label names the action in plain language for screen readers.
      */}
      {onAskCoach ? (
        <div className="log-type-totals-strip__coach-row">
          <button
            type="button"
            className="log-type-totals-strip__coach-button"
            data-testid="log-type-totals-strip-coach-button"
            aria-label="Ask Coach about today's totals"
            onClick={handleAskCoach}
            disabled={!serverOnline}
          >
            Ask Coach
          </button>
        </div>
      ) : null}
    </Card>
  );
}
