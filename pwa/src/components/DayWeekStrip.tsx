import { weekStripDays, isSameDay } from '../lib/daySectionShared';

export function DayWeekStrip() {
  const today = new Date();

  return (
    <div className="day-week-strip" role="group" aria-label="This week">
      {weekStripDays().map((d) => {
        const isToday = isSameDay(d, today);
        return (
          <div
            key={d.toISOString()}
            className={`day-week-pill ${isToday ? 'day-week-pill--today' : ''}`}
            aria-current={isToday ? 'date' : undefined}
          >
            <span className="day-week-pill__dow">{d.toLocaleDateString([], { weekday: 'narrow' })}</span>
            <span className="day-week-pill__date">{d.getDate()}</span>
          </div>
        );
      })}
    </div>
  );
}
