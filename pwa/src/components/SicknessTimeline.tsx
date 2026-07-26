export interface SicknessTimelineEvent {
  label: string;
  start: string;
  end: string;
}

interface SicknessTimelineProps {
  events: SicknessTimelineEvent[];
}

function parseDay(iso: string): number {
  return new Date(`${iso}T12:00:00`).getTime();
}

export function SicknessTimeline({ events }: SicknessTimelineProps) {
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

  return (
    <div className="sickness-timeline" role="img" aria-label="Sickness timeline for the last 90 days">
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
          return (
            <li key={`${ev.start}-${ev.label}`} className="sickness-timeline-row">
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
