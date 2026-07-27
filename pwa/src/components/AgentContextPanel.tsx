import type { AgentContextState } from '../hooks/useAgentContext';
import { habitCompletionPct } from '../lib/homeSectionShared';
import { HomeSummaryTiles } from './HomeSummaryTiles';
import { MealPlanSyncAwarenessSlot } from './MealPlanSyncAwarenessSlot';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

interface AgentContextPanelProps {
  context: AgentContextState;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
}

const HABIT_LABELS: Record<string, string> = {
  sleep: 'Sleep',
  work: 'Work',
  wasted: 'Wasted',
  speak: 'Speak',
  game: 'Game',
  read: 'Read',
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function AgentContextPanel({ context, onNavigateMealPlanSyncSource }: AgentContextPanelProps) {
  const { food, habits, calendar, summary, loading, error } = context;

  if (loading && !food) {
    return (
      <div className="agent-context agent-context--gemini">
        <HomeSummaryTiles loading calTarget={2200} proteinTarget={150} habitsPct={0} />
      </div>
    );
  }

  if (error && !food) {
    return <div className="agent-context banner banner-warn banner-revolut">{error}</div>;
  }

  const proteinTarget = food?.protein_target_g ?? 150;
  const habitsPct = habitCompletionPct(habits);
  const metrics = habits?.metrics ?? {};
  const habitEntries = Object.entries(metrics).filter(([, v]) => v != null && v > 0);

  return (
    <div className="agent-context agent-context--gemini">
      <MealPlanSyncAwarenessSlot
        viewer="external"
        onNavigate={onNavigateMealPlanSyncSource}
        showPendingWhenIdle
      />

      <HomeSummaryTiles
        loading={loading}
        calories={food?.calories}
        calTarget={2200}
        protein={food?.protein_g}
        proteinTarget={proteinTarget}
        habitsPct={habitsPct}
      />

      {habitEntries.length > 0 && (
        <div className="agent-habit-chips">
          {habitEntries.map(([key, val]) => (
            <span key={key} className="agent-habit-chip">
              {HABIT_LABELS[key] ?? key} {val}h
            </span>
          ))}
        </div>
      )}

      {calendar.length > 0 && (
        <ul className="agent-events">
          {calendar.slice(0, 3).map((ev) => (
            <li key={ev.id}>
              <span className="agent-event-time">{formatTime(ev.start)}</span>
              <span className="agent-event-title">{ev.summary}</span>
            </li>
          ))}
        </ul>
      )}

      {summary && <p className="agent-summary-snippet">{summary}</p>}
    </div>
  );
}
