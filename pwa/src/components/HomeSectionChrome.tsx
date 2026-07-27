import type { CSSProperties } from 'react';

interface HomePullRefreshIndicatorProps {
  pullProgress: number;
  refreshing: boolean;
}

const PULL_RING_SIZE = 28;
const PULL_RING_STROKE = 3;
const PULL_RING_RADIUS = (PULL_RING_SIZE - PULL_RING_STROKE) / 2;
const PULL_RING_CIRCUMFERENCE = 2 * Math.PI * PULL_RING_RADIUS;

export function HomePullRefreshIndicator({ pullProgress, refreshing }: HomePullRefreshIndicatorProps) {
  if (pullProgress <= 0 && !refreshing) return null;

  const ringOffset = PULL_RING_CIRCUMFERENCE * (1 - (refreshing ? 0.72 : pullProgress));
  const statusLabel = refreshing ? 'Refreshing dashboard' : pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh';

  return (
    <div
      className={`pull-refresh-indicator${refreshing ? ' pull-refresh-indicator--spinning' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={statusLabel}
      style={{ '--pull-progress': pullProgress } as CSSProperties}
    >
      <svg
        className="pull-refresh-ring"
        width={PULL_RING_SIZE}
        height={PULL_RING_SIZE}
        viewBox={`0 0 ${PULL_RING_SIZE} ${PULL_RING_SIZE}`}
        aria-hidden="true"
      >
        <circle
          className="pull-refresh-ring__track"
          cx={PULL_RING_SIZE / 2}
          cy={PULL_RING_SIZE / 2}
          r={PULL_RING_RADIUS}
          fill="none"
          strokeWidth={PULL_RING_STROKE}
        />
        <circle
          className="pull-refresh-ring__progress"
          cx={PULL_RING_SIZE / 2}
          cy={PULL_RING_SIZE / 2}
          r={PULL_RING_RADIUS}
          fill="none"
          strokeWidth={PULL_RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={PULL_RING_CIRCUMFERENCE}
          strokeDashoffset={ringOffset}
          transform={`rotate(-90 ${PULL_RING_SIZE / 2} ${PULL_RING_SIZE / 2})`}
        />
      </svg>
      <span className="pull-refresh-label">{refreshing ? 'Refreshing…' : pullProgress >= 1 ? 'Release' : 'Pull down'}</span>
    </div>
  );
}

interface HomeSectionHeaderProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export function HomeSectionHeader({ refreshing, onRefresh }: HomeSectionHeaderProps) {
  return (
    <div className="home-header-row">
      <div>
        <p className="section-eyebrow">Summary</p>
        <h1 id="home-heading">Today</h1>
        <p className="muted">Your health dashboard</p>
      </div>
      <button
        type="button"
        className="btn-pill btn-pill-outline home-refresh-btn"
        disabled={refreshing}
        aria-label="Refresh dashboard"
        title="Refresh dashboard (R)"
        onClick={onRefresh}
      >
        {refreshing ? 'Refreshing…' : 'Refresh'}
      </button>
    </div>
  );
}
