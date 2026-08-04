export interface SicknessTimelineEvent {
  label: string;
  start: string;
  end: string;
}

interface SicknessTimelineProps {
  events: SicknessTimelineEvent[];
  /**
   * Fired when the user activates an event (click / Enter / Space).
   * The parent (Cards) jumps to the matching notes filter, prefills
   * search with the event label, scrolls the grid into view, and
   * announces the handoff via aria-live. See ui-072 / crit-081.
   */
  onEventSelect?: (event: SicknessTimelineEvent) => void;
}

function parseDay(iso: string): number {
  return new Date(`${iso}T12:00:00`).getTime();
}

function formatDateRange(start: string, end: string): string {
  if (start === end) return start;
  return `${start} to ${end}`;
}

export function SicknessTimeline({ events, onEventSelect }: SicknessTimelineProps) {
  if (!events.length) return null;

  const today = new Date();
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - 90);
  const minTs = windowStart.getTime();
  const maxTs = today.getTime();
  const span = Math.max(maxTs - minTs, 1);

  const visible = events.filter((e) => parseDay(e.end) >= minTs);

  if (!visible.length) {
    return <p className="muted">No sickness entries in the last 90 days.</p>;
  }

  const hasSelect = typeof onEventSelect === 'function';

  return (
    <div
      className="sickness-timeline"
      role={hasSelect ? 'group' : 'img'}
      aria-label={
        hasSelect
          ? 'Sickness timeline for the last 90 days. Activate an event to open related notes.'
          : 'Sickness timeline for the last 90 days'
      }
    >
      <div className="sickness-timeline-axis">
        <span>{windowStart.toISOString().slice(0, 10)}</span>
        <span>{today.toISOString().slice(0, 10)}</span>
      </div>
      <ul className="sickness-timeline-list">
        {visible.map((ev) => {
          const start = Math.max(parseDay(ev.start), minTs);
          const end = Math.min(parseDay(ev.end), maxTs);
          const left = ((start - minTs) / span) * 100;
          const width = Math.max(((end - start) / span) * 100, 1.5);
          const range = formatDateRange(ev.start, ev.end);
          const label = `Open related sickness notes for ${ev.label} (${range})`;
          return (
            <li key={`${ev.start}-${ev.label}`} className="sickness-timeline-row">
              {hasSelect ? (
                <button
                  type="button"
                  className="sickness-timeline-event"
                  onClick={() => onEventSelect?.(ev)}
                  aria-label={label}
                  data-testid={`sickness-timeline-event-${ev.label}`}
                >
                  <span className="sickness-timeline-label">{ev.label}</span>
                  <div className="sickness-timeline-track">
                    <div
                      className="sickness-timeline-bar"
                      style={{ left: `${left}%`, width: `${width}%` }}
                    />
                  </div>
                  <span className="sickness-timeline-dates muted">
                    {ev.start === ev.end ? ev.start.slice(5) : `${ev.start.slice(5)} – ${ev.end.slice(5)}`}
                  </span>
                </button>
              ) : (
                <>
                  <span className="sickness-timeline-label">{ev.label}</span>
                  <div className="sickness-timeline-track" aria-hidden="true">
                    <div
                      className="sickness-timeline-bar"
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${ev.start} → ${ev.end}`}
                    />
                  </div>
                  <span className="sickness-timeline-dates muted">
                    {ev.start === ev.end ? ev.start.slice(5) : `${ev.start.slice(5)} – ${ev.end.slice(5)}`}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
