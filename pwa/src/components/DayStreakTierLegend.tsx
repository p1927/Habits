import type { DayStreakTierLegendProps } from '../lib/dayHabitHoursCardTypes';

export function DayStreakTierLegend({ open, onToggle }: DayStreakTierLegendProps) {
  return (
    <>
      <button
        type="button"
        className="btn-pill btn-pill-outline streak-legend-toggle"
        aria-expanded={open}
        aria-controls="streak-tier-legend"
        onClick={onToggle}
      >
        {open ? 'Hide legend' : 'Show legend'}
      </button>
      {open && (
        <ul id="streak-tier-legend" className="streak-tier-legend" aria-label="Streak badge tiers">
          <li>
            <span className="streak-badge streak-badge--warm streak-tier-legend-badge" aria-hidden="true">
              3d
            </span>
            <span className="muted">Warm · 3+ days</span>
          </li>
          <li>
            <span className="streak-badge streak-badge--hot streak-tier-legend-badge" aria-hidden="true">
              7d
            </span>
            <span className="muted">Hot · 7+ days</span>
          </li>
          <li>
            <span className="streak-badge streak-badge--fire streak-tier-legend-badge" aria-hidden="true">
              14d
            </span>
            <span className="muted">Fire · 14+ days</span>
          </li>
        </ul>
      )}
    </>
  );
}
