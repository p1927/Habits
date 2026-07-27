import { useEffect, useRef } from 'react';
import { mealPlanQueueLabel, type QueuedMealPlanLog } from '../lib/mealPlanQueue';
import { useMealPlanQueueShortcuts } from '../hooks/useMealPlanQueueShortcuts';

export type MealPlanQueuePanelVariant = 'home' | 'default';

export interface MealPlanQueuePanelProps {
  serverOnline: boolean;
  queue: QueuedMealPlanLog[];
  syncing: boolean;
  syncProgress: { done: number; total: number } | null;
  failedIds: Set<string>;
  retryingId: string | null;
  variant?: MealPlanQueuePanelVariant;
  noPlanToday?: boolean;
  syncAllLabel?: string;
  clearAllLabel?: string;
  bannerSuffix?: string;
  syncActionHint?: string;
  onSyncAll: () => void;
  onRetryFailed?: () => void;
  onRetry: (item: QueuedMealPlanLog) => void;
  onDismissItem: (id: string) => void;
  onClearAll: () => void;
  /** Increment to scroll this panel into view (e.g. Cards tab badge → Home). */
  scrollToQueueToken?: number;
}

export function MealPlanQueuePanel({
  serverOnline,
  queue,
  syncing,
  syncProgress,
  failedIds,
  retryingId,
  variant = 'default',
  noPlanToday = false,
  syncAllLabel = 'Sync now',
  clearAllLabel = 'Dismiss all',
  bannerSuffix = '',
  syncActionHint = 'Sync now',
  onSyncAll,
  onRetryFailed,
  onRetry,
  onDismissItem,
  onClearAll,
  scrollToQueueToken = 0,
}: MealPlanQueuePanelProps) {
  const failedCount = queue.filter((item) => failedIds.has(item.id)).length;
  const prevFailedCountRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const syncBtnRef = useRef<HTMLButtonElement>(null);
  const isHome = variant === 'home';
  const panelClass = isHome ? 'home-meal-plan-queue-panel' : 'meal-plan-queue-panel';
  const progressClass = isHome ? 'home-meal-plan-sync-progress' : 'meal-plan-sync-progress';

  const focusQueueScrollTarget = (reducedMotion: boolean) => {
    const firstFailed = queue.find((item) => failedIds.has(item.id));
    if (firstFailed) {
      const row = document.getElementById(`meal-plan-queue-item-${firstFailed.id}`);
      if (row) {
        row.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
        const retryBtn = row.querySelector<HTMLButtonElement>('[data-meal-plan-retry]');
        if (retryBtn) {
          retryBtn.focus({ preventScroll: true });
          return;
        }
        if (row instanceof HTMLElement) {
          row.focus({ preventScroll: true });
          return;
        }
      }
    }

    panelRef.current?.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
    if (serverOnline && syncBtnRef.current && !syncing && !retryingId) {
      syncBtnRef.current.focus({ preventScroll: true });
    } else {
      panelRef.current?.focus({ preventScroll: true });
    }
  };

  useMealPlanQueueShortcuts({
    enabled: queue.length > 0 || syncing,
    serverOnline,
    syncing,
    retrying: !!retryingId,
    failedCount,
    onSyncAll,
    onRetryFailed: failedCount > 0 ? onRetryFailed : undefined,
  });

  const shortcutHint =
    failedCount > 0 && onRetryFailed
      ? ` · press S or ${syncActionHint} · R retry failed`
      : ` · press S or ${syncActionHint}`;

  const bannerText =
    syncing && syncProgress
      ? `Syncing meal logs (${syncProgress.done}/${syncProgress.total})…`
      : `${queue.length} meal log${queue.length === 1 ? '' : 's'} queued${
          failedCount > 0 ? ` · ${failedCount} failed` : ''
        }${bannerSuffix}${serverOnline ? shortcutHint : ' — will sync when online'}.`;

  useEffect(() => {
    if (failedCount === 0) {
      prevFailedCountRef.current = 0;
      return;
    }
    const shouldFocus = failedCount > prevFailedCountRef.current;
    prevFailedCountRef.current = failedCount;
    if (!shouldFocus || syncing) return;

    const firstFailed = queue.find((item) => failedIds.has(item.id));
    if (!firstFailed) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    requestAnimationFrame(() => {
      focusQueueScrollTarget(reducedMotion);
    });
  }, [failedCount, syncing, queue, failedIds]);

  useEffect(() => {
    if (!scrollToQueueToken) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        focusQueueScrollTarget(reducedMotion);
      });
    });
  }, [scrollToQueueToken, queue, failedIds, serverOnline, syncing, retryingId]);

  return (
    <div
      ref={panelRef}
      id="meal-plan-queue-panel"
      tabIndex={-1}
      className={`${panelClass}${syncing ? ` ${panelClass}--syncing` : ''}${
        isHome && noPlanToday ? ` ${panelClass}--no-plan` : ''
      }${failedCount > 0 ? ` ${panelClass}--has-failed` : ''}`}
      role="status"
    >
      <div className={`banner banner-row${failedCount > 0 ? ' banner-err' : ' banner-warn'}`}>
        <span
          aria-live={syncing && syncProgress ? 'polite' : undefined}
          aria-atomic={syncing && syncProgress ? 'true' : undefined}
        >
          {bannerText}
        </span>
        {serverOnline && (
          <>
            {failedCount > 0 && onRetryFailed && (
              <button
                type="button"
                className="btn-small"
                disabled={syncing || !!retryingId}
                aria-keyshortcuts="R"
                onClick={() => void onRetryFailed()}
              >
                Retry failed
              </button>
            )}
            <button
              type="button"
              ref={syncBtnRef}
              className="btn-small"
              disabled={syncing || !!retryingId}
              aria-keyshortcuts="S"
              onClick={() => void onSyncAll()}
            >
              {syncing ? 'Syncing…' : syncAllLabel}
            </button>
          </>
        )}
        <button
          type="button"
          className="btn-small"
          aria-label="Dismiss meal plan log queue"
          disabled={syncing}
          onClick={onClearAll}
        >
          {clearAllLabel}
        </button>
      </div>
      {syncing && syncProgress && syncProgress.total > 0 && (
        <div
          className={progressClass}
          role="progressbar"
          aria-live="polite"
          aria-atomic="true"
          aria-valuenow={syncProgress.done}
          aria-valuemin={0}
          aria-valuemax={syncProgress.total}
          aria-valuetext={`Syncing meal logs, ${syncProgress.done} of ${syncProgress.total} complete`}
          aria-label="Meal plan sync progress"
        >
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(syncProgress.done / syncProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
      {queue.length > 0 && (
        <ul className="food-list meal-plan-queue-list" aria-label="Queued meal logs">
          {queue.map((item) => {
            const failed = failedIds.has(item.id);
            const retrying = retryingId === item.id;
            const label = mealPlanQueueLabel(item);
            return (
              <li
                key={item.id}
                id={`meal-plan-queue-item-${item.id}`}
                tabIndex={failed ? -1 : undefined}
                className={`food-row food-row--${failed ? 'failed' : 'queued'}`}
                role={failed ? 'alert' : undefined}
              >
                <div>
                  <strong>{label}</strong>
                  <span className={`muted${failed ? ' meal-plan-queue-item-failed' : ''}`}>
                    {item.description ? ` · ${item.description}` : ''}
                    {retrying ? ' · Syncing…' : failed ? ' · Failed to sync' : ' · Queued offline'}
                  </span>
                </div>
                <div className="food-row-actions">
                  {serverOnline && (
                    <button
                      type="button"
                      className="btn-small"
                      data-meal-plan-retry=""
                      disabled={syncing || !!retryingId}
                      onClick={() => void onRetry(item)}
                    >
                      {retrying ? 'Syncing…' : 'Retry'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-small btn-danger"
                    aria-label={`Dismiss queued ${label}`}
                    disabled={retrying || syncing}
                    onClick={() => onDismissItem(item.id)}
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
  );
}
