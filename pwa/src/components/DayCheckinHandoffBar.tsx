import { useCallback, useEffect, useState } from 'react';
import { DAY_CHECKIN_HANDOFF_DISMISS_PREFIX } from '../lib/daySectionConstants';
import { formatEventTime } from '../lib/dayCalendarUtils';
import type { DayCalendarEvent } from '../lib/dayCalendarUtils';

const HANDOFF_PROMPT_PREFIX = 'Help me plan for my next event:';

export interface DayCheckinHandoffBarProps {
  events: DayCalendarEvent[];
  onAskCoach: (prompt: string) => void;
  onReviewRings: () => void;
}

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function nextUpcomingEvent(events: DayCalendarEvent[]): DayCalendarEvent | null {
  if (events.length === 0) return null;
  const now = Date.now();
  const timed = events.filter((e) => e.start.includes('T'));
  const sorted = [...timed].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const upcoming = sorted.find((e) => new Date(e.start).getTime() >= now);
  return upcoming ?? sorted[0] ?? null;
}

function buildCoachPrompt(event: DayCalendarEvent | null): string {
  if (!event) return HANDOFF_PROMPT_PREFIX + ' my day';
  const time = formatEventTime(event.start);
  const summary = (event.summary ?? '').trim() || 'my next event';
  return `${HANDOFF_PROMPT_PREFIX} ${summary} at ${time}`;
}

export function DayCheckinHandoffBar({ events, onAskCoach, onReviewRings }: DayCheckinHandoffBarProps) {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem(DAY_CHECKIN_HANDOFF_DISMISS_PREFIX + todayKey()) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === DAY_CHECKIN_HANDOFF_DISMISS_PREFIX + todayKey() && e.newValue === '1') {
        setDismissed(true);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleDismiss = useCallback(() => {
    try {
      window.sessionStorage.setItem(DAY_CHECKIN_HANDOFF_DISMISS_PREFIX + todayKey(), '1');
    } catch {
      // ignore quota / disabled storage
    }
    setDismissed(true);
  }, []);

  if (dismissed) return null;

  const upcoming = nextUpcomingEvent(events);
  const prompt = buildCoachPrompt(upcoming);
  const hasContext = upcoming !== null;
  const ariaLabel = hasContext
    ? `Looking ahead. Next event ${upcoming!.summary} at ${formatEventTime(upcoming!.start)}`
    : 'Looking ahead. Ask Coach and Review rings on Home';

  return (
    <div
      className="day-checkin-handoff-bar"
      role="region"
      aria-label={ariaLabel}
      data-testid="day-checkin-handoff-bar"
    >
      <div className="day-checkin-handoff-bar__copy">
        <p className="section-eyebrow day-checkin-handoff-bar__eyebrow">Looking ahead</p>
        <p className="day-checkin-handoff-bar__text">
          {hasContext
            ? <>Next: <strong>{upcoming!.summary}</strong> at {formatEventTime(upcoming!.start)}</>
            : 'Continue your check-in'}
        </p>
      </div>
      <div className="day-checkin-handoff-bar__actions">
        <button
          type="button"
          className="btn-pill day-checkin-handoff-bar__cta"
          onClick={() => onAskCoach(prompt)}
          aria-label="Ask Coach to plan the next event"
        >
          Ask Coach
        </button>
        <button
          type="button"
          className="btn-pill btn-pill-ghost day-checkin-handoff-bar__cta"
          onClick={onReviewRings}
          aria-label="Review rings on Home"
        >
          Review rings
        </button>
        <button
          type="button"
          className="link-btn day-checkin-handoff-bar__dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss Looking ahead for today"
        >
          ×
        </button>
      </div>
    </div>
  );
}
