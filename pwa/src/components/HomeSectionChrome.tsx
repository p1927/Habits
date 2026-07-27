import type { CSSProperties } from 'react';

interface HomePullRefreshIndicatorProps {
  pullProgress: number;
  refreshing: boolean;
}

export function HomePullRefreshIndicator({ pullProgress, refreshing }: HomePullRefreshIndicatorProps) {
  if (pullProgress <= 0 && !refreshing) return null;

  return (
    <div
      className="pull-refresh-indicator"
      role="status"
      aria-live="polite"
      style={{ '--pull-progress': pullProgress } as CSSProperties}
    >
      {refreshing ? 'Refreshing…' : pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
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
